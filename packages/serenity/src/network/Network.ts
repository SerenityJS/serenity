import { Buffer } from 'node:buffer';
import { inflateRawSync, deflateRawSync } from 'node:zlib';
import type { DataPacket } from '@serenityjs/bedrock-protocol';
import { Packet, Packets, Framer, getPacketId, CompressionMethod } from '@serenityjs/bedrock-protocol';
import { BinaryStream } from '@serenityjs/binarystream';
import { Frame, Reliability, Priority } from '@serenityjs/raknet-protocol';
import type { Serenity } from '../Serenity.js';
import { Logger, LoggerColors } from '../console/index.js';
import { EventEmitter } from '../utils/index.js';
import { NetworkBound } from './Bound.js';
import type { NetworkEvents, NetworkPacketEvent } from './Events.js';
import { GAME_BYTE } from './GameByte.js';
import type { NetworkSession } from './Session.js';
import { NETWORK_HANDLERS, NetworkHandler } from './handlers/index.js';

/**
 * The network class.
 * Handles all incoming and outgoing network traffic.
 */
class Network extends EventEmitter<NetworkEvents> {
	protected readonly serenity: Serenity;

	/**
	 * The logger instance.
	 */
	public readonly logger: Logger;
	/**
	 * The sessions map.
	 */
	public readonly sessions: Map<bigint, NetworkSession>;

	/**
	 * The network instance.
	 * Handles all incoming and outgoing network traffic.
	 */
	public constructor(serenity: Serenity) {
		super();

		this.serenity = serenity;
		this.logger = new Logger('Network', LoggerColors.Blue);
		this.sessions = new Map();

		// Set the serenity instance for the abstract network handler.
		NetworkHandler.serenity = serenity;
	}

	/**
	 * Handles all incoming packets from a session.
	 *
	 * @param session The session that sent the packets.
	 * @param payloads The payloads that were sent.
	 * @returns A promise that resolves when the packets have been handled.
	 */
	public incoming(session: NetworkSession, ...payloads: Buffer[]): void {
		try {
			// Loop through each buffer.
			// We may receive multiple packets in one payload.
			for (const buffer of payloads) {
				// Construct a new BinaryStream from the buffer.
				// And check if the first byte is 0xfe AKA the game packet header.
				const stream = new BinaryStream(buffer);
				const header = stream.readUint8();
				if (header !== GAME_BYTE[0]) return console.log('Invalid packet header', header);

				// Check if the session is encrypted.
				// NOTE: Encryption is not implemented yet. So we will just handle the packet as if it was not encrypted.
				// TODO: Implement encryption for the session.
				// eslint-disable-next-line sonarjs/no-all-duplicated-branches
				let decrypted = session.encryption ? stream.readRemainingBuffer() : stream.readRemainingBuffer();

				// Some packets have a byte that represents the compression algorithm.
				// Read the compression algorithm from the buffer.
				const algorithm: CompressionMethod = CompressionMethod[decrypted[0]]
					? decrypted.readUint8()
					: CompressionMethod.NotPresent;

				// Remove the compression algorithm from the buffer.
				// Only if the buffer has compression enabled.
				if (algorithm !== CompressionMethod.NotPresent) decrypted = decrypted.subarray(1);

				// Prepare a buffer for the inflated payload.
				let inflated: Buffer;

				// Switch based on the compression algorithm given by the packet.
				switch (algorithm) {
					case CompressionMethod.Zlib:
						inflated = inflateRawSync(decrypted);
						break;
					case CompressionMethod.None:
					case CompressionMethod.NotPresent:
						inflated = decrypted;
						break;
					default:
						return console.log('Invalid compression algorithm', algorithm);
				}

				// Unframe the inflated payload.
				// Payloads can sometime contain multiple packets.
				// But it seems like a rare case for that to happen.
				const frames = Framer.unframe(inflated);

				// Loop through each frame, and handle the packet.
				// Ignore unknown packets for now.
				for (const frame of frames) {
					// Reads the packet id from the frame, which is a varint.
					const id = getPacketId(frame);
					const packet = Packets[id];
					if (packet === undefined) {
						return this.logger.debug(
							`Recieved unknown packet with the id "0x${
								id.toString(16).length === 1 ? `0${id.toString(16)}` : id.toString(16)
							}" from "${session.identifier.address}:${session.identifier.port}"!`,
						);
					}

					// We will attempt to deserialize the packet, and if it fails, we will just ignore it for now.
					try {
						// Contruct the packet instance.
						// And deserialize the packet.
						const instance = new packet(frame).deserialize();

						// Build the event with the packet instance and session.
						const event = {
							packet: instance,
							session,
							bound: NetworkBound.Server,
						} as NetworkPacketEvent<any>;
						// Emit the packet event will return a promise with a boolean value.
						// If the value is false, the packet was cancelled from being handled.
						// If the value is true, the packet was either modified or not listened to.
						const value = this.emit(instance.getId() as Packet, event);

						// Check if the packet was cancelled.
						if (!value) continue;

						// Attempt to find a handler for the packet.
						const handler = NETWORK_HANDLERS.find((x) => x.packet === instance.getId());

						// Check if a handler was not found.
						// If so, we will emit a warning and continue to the next packet.
						if (handler) {
							// We will then attempt to handle the packet.
							// If an error occurs, we will emit the error event.
							try {
								void handler.handle(instance as any, session);
							} catch (error) {
								this.logger.error(error);
							}
						} else {
							return this.logger.debug(
								`Unable to find network handler for ${Packet[id]} (0x${id.toString(16)}) packet from "${
									session.identifier.address
								}:${session.identifier.port}"!`,
							);
						}
					} catch (error) {
						// If an error occurs, we will emit the error event.
						return this.logger.error(error);
					}
				}
			}
		} catch (error) {
			// If an error occurs, we will emit the error event.
			this.logger.error('Failed to handle incoming packets!', error, payloads);
		}
	}

	/**
	 * Sends packets to a session.
	 *
	 * @param session The session to send the packets to.
	 * @param priority The priority of the packets.
	 * @param packets The packets to send.
	 * @returns A promise that resolves when the packets have been sent.
	 */
	public send(session: NetworkSession, priority = Priority.Normal, ...packets: DataPacket[]): void {
		try {
			// Prepare an array of buffers
			const payloads: Buffer[] = [];

			// We will first loop each packet and emit them through the event loop.
			// This will allow the ability to cancel or modify the packet.
			for (const packet of packets) {
				// Construct the event with the packet instance and session.
				const event = {
					packet,
					session,
					bound: NetworkBound.Client,
				} as NetworkPacketEvent<any>;

				// Emit the packet event will return a promise with a boolean value.
				// If the value is false, the packet was cancelled from sending.
				// If the value is true, the packet was either modified or not listened to.
				const value = this.emit(packet.getId() as Packet, event);

				// Check if the packet was cancelled.
				// If so, we will ignore the packet and continue to the next one.
				if (!value) continue;

				// Will will then serialize the packet.
				// And push the serialized packet into the payloads array.
				const serialized = packet.serialize();
				payloads.push(serialized);
			}

			// Then we will frame the packets into a single payload.
			// A framed payload starts with the size of the upcoming packet.
			// Followed by the packet buffer itself. This continues until all packets are framed.
			const framed = Framer.frame(...payloads);

			// We will then check if compression is enabled for the session.
			// If so, we will deflate the framed payload.
			// If not, we will just use the framed payload.
			const deflated = Buffer.concat([
				Buffer.from([CompressionMethod.Zlib]),
				session.compression ? deflateRawSync(framed) : framed,
			]);

			// We will then check if encryption is enabled for the session.
			// If so, we will encrypt the deflated payload.
			// If not, we will just use the deflated payload.
			// NOTE: Encryption is not implemented yet. So we will just use the deflated payload for now.
			// TODO: Implement encryption for the session.
			// eslint-disable-next-line sonarjs/no-all-duplicated-branches
			const encrypted = session.encryption ? deflated : deflated;

			// We will then construct the final payload with the game header and the encrypted compressed payload.
			const payload = Buffer.concat([GAME_BYTE, encrypted]);

			// Finally we will assemble a new frame with the payload.
			// The frame contains the reliability and priority of the packet.
			// As well as the payload itself.
			const frame = new Frame();
			frame.reliability = Reliability.ReliableOrdered;
			frame.orderChannel = 0;
			frame.body = payload;

			// And send the frame to the session.
			return session.connection.sendFrame(frame, priority);
		} catch (error) {
			// If an error occurs, we will emit the error event.
			this.logger.error(
				'Failed to send packets!',
				error,
				packets.map((x) => x.getBuffer()),
			);
		}
	}

	/**
	 * Broadcasts a packet to all players.
	 *
	 * @param packets The packets to broadcast.
	 * @returns A promise that resolves when the packets have been broadcasted.
	 */
	public broadcast(...packets: DataPacket[]): void {
		// Loop through each session.
		for (const session of this.sessions.values()) {
			// Send the packet to the session.
			this.send(session, Priority.Normal, ...packets);
		}
	}

	/**
	 * Broadcasts a packet to all players immediately.
	 *
	 * @param packets The packets to broadcast.
	 * @returns A promise that resolves when the packets have been broadcasted.
	 */
	public broadcastImmediate(...packets: DataPacket[]): void {
		// Loop through each session.
		for (const session of this.sessions.values()) {
			// Send the packet to the session.
			this.send(session, Priority.Immediate, ...packets);
		}
	}
}

export { Network };
