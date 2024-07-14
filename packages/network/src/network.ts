import { inflateRawSync, deflateRawSync } from "node:zlib";

import Emitter from "@serenityjs/emitter";
import { Logger, LoggerColors } from "@serenityjs/logger";
import {
	CompressionMethod,
	type DataPacket,
	DisconnectPacket,
	DisconnectReason,
	Framer,
	Packet,
	Packets,
	getPacketId
} from "@serenityjs/protocol";
import {
	type Connection,
	Frame,
	Priority,
	type Server
} from "@serenityjs/raknet";

import { NetworkSession } from "./session";
import { NetworkHandler } from "./handlers";
import { GAME_BYTE } from "./constants";
import { NetworkBound } from "./enums";

import type { NetworkEvents, NetworkPacketEvent } from "./types";

/**
 * The network class.
 * Handles all incoming and outgoing network traffic.
 */
class Network extends Emitter<NetworkEvents> {
	/**
	 * The Raknet server instance.
	 */
	protected readonly raknet: Server;

	/**
	 * The logger instance.
	 */
	public readonly logger: Logger;

	/**
	 * The sessions map.
	 */
	public readonly sessions: Map<bigint, NetworkSession>;

	/**
	 * The compression threshold.
	 */
	public readonly compressThreshold: number;

	/**
	 * The compression method.
	 */
	public readonly compressMethod: CompressionMethod;

	/**
	 * The amount of packets that can be sent per frame.
	 */
	public readonly packetsPerFrame: number;

	/**
	 * The network handlers.
	 */
	public readonly handlers: Array<typeof NetworkHandler>;

	/**
	 * Constructs a new network instance.
	 *
	 * @param raknet The Raknet server instance.
	 * @param compressThreshold The compression threshold.
	 * @param compressMethod The compression method.
	 * @param packetsPerFrame The amount of packets that can be sent per frame.
	 */
	public constructor(
		raknet: Server,
		compressThreshold?: number,
		compressMethod?: CompressionMethod,
		packetsPerFrame?: number,
		handlers?: Array<typeof NetworkHandler>
	) {
		super();

		this.raknet = raknet;
		this.logger = new Logger("Network", LoggerColors.Blue);
		this.sessions = new Map();
		this.compressThreshold = compressThreshold ?? 256;
		this.compressMethod = compressMethod ?? CompressionMethod.Zlib;
		this.packetsPerFrame = packetsPerFrame ?? 32;
		this.handlers = handlers ?? [];

		// Bind the network events.
		this.raknet.on("encapsulated", this.incoming.bind(this));

		// Listen for new connections.s
		this.raknet.on("connect", (connection) => {
			// Check if the session already exists.
			if (this.sessions.has(connection.guid)) {
				// Log a warning if the session already exists.
				this.logger.warn(
					`A session with the guid "${connection.guid}" already exists!`
				);

				// Disconnect the session if it already exists.
				return connection.disconnect();
			} else {
				// Create a new session.
				const session = new NetworkSession(this, connection);

				// Set the session on the sessions map.
				this.sessions.set(connection.guid, session);
			}
		});

		// Listen for disconnections.
		this.raknet.on("disconnect", (connection) => {
			// Check if the session exists.
			const session = this.sessions.get(connection.guid);
			if (session) {
				// Create a new disconnect packet.
				const packet = new DisconnectPacket();
				packet.message = "Player disconnected.";
				packet.reason = DisconnectReason.Disconnected;
				packet.hideDisconnectScreen = true;

				// Then we will create a dummy payload.
				const payload = Buffer.from([
					GAME_BYTE,
					CompressionMethod.None,
					...Framer.frame(packet.serialize())
				]);

				// Let the incoming method handle the packet.
				this.incoming(connection, payload);

				// Remove the session from the sessions map.
				this.sessions.delete(connection.guid);
			} else {
				// Log a warning if the session does not exist.
				this.logger.warn(
					`A session with the guid "${connection.guid}" does not exist!`
				);
			}
		});

		// Set the network instance on the abstract network handler.
		NetworkHandler.network = this;
	}

	/**
	 * Registers a network handler.
	 *
	 * @param handler The network handler to register.
	 */
	public registerHandler(handler: typeof NetworkHandler): void {
		this.handlers.push(handler);
	}

	/**
	 * Unregisters a network handler.
	 *
	 * @param handler The network handler to unregister.
	 */
	public unregisterHandler(handler: typeof NetworkHandler): void {
		this.handlers.splice(this.handlers.indexOf(handler), 1);
	}

	/**
	 * Handles all incoming packets from a raknet connection.
	 *
	 * @param connection The connection that sent the packets.
	 * @param payloads The payloads that were sent.
	 * @returns A promise that resolves when the packets have been handled.
	 */
	public incoming(conenction: Connection, ...payloads: Array<Buffer>): void {
		try {
			// Attempt to get the network session.
			const session = this.sessions.get(conenction.guid);

			// If there is no session, log the error and return.
			if (!session) {
				return this.logger.debug(
					`Received packets from an unconnected session "${conenction.rinfo.address}:${conenction.rinfo.port}"!`
				);
			}

			// Loop through each payload and handle the packet.
			for (const buffer of payloads) {
				// Check if the first byte is 0xfe AKA the game packet header.
				if (buffer[0] !== GAME_BYTE)
					return this.logger.error(
						`Received invalid packet header from "${session.identifier.address}:${session.identifier.port}"!`
					);

				// Check if the session is encrypted.
				// NOTE: Encryption is not implemented yet. So we will just handle the packet as if it was not encrypted.
				// TODO: Implement encryption for the session.
				let decrypted = session.encryption
					? buffer.subarray(1)
					: buffer.subarray(1);

				// Some packets have a byte that represents the compression algorithm.
				// Read the compression algorithm from the buffer.
				const algorithm: CompressionMethod = CompressionMethod[
					decrypted[0] as number
				]
					? decrypted.readUint8()
					: CompressionMethod.NotPresent;

				// Remove the compression algorithm from the buffer.
				// Only if the buffer has compression enabled.
				if (algorithm !== CompressionMethod.NotPresent)
					decrypted = decrypted.subarray(1);

				// Prepare a buffer for the inflated payload.
				let inflated: Buffer;

				// Switch based on the compression algorithm given by the packet.
				switch (algorithm) {
					case CompressionMethod.Zlib: {
						inflated = inflateRawSync(decrypted);
						break;
					}
					case CompressionMethod.None:
					case CompressionMethod.NotPresent: {
						inflated = decrypted;
						break;
					}
					default: {
						return this.logger.error(
							`Received invalid compression algorithm from "${session.identifier.address}:${session.identifier.port}"!`,
							CompressionMethod[algorithm]
						);
					}
				}

				// Unframe the inflated payload.
				// Payloads can sometime contain multiple packets.
				// But it seems like a rare case for that to happen.
				const frames = Framer.unframe(inflated);

				// Check if the frames amount is greater than the packets per frame.
				// If so, we will log a warning and disconnect the session.
				// This could be an attempt to crash the server, or some other malicious intent.
				if (frames.length > this.packetsPerFrame) {
					// Log a warning if too many packets were sent at once.
					this.logger.warn(
						`Recieved too many packets from "${session.identifier.address}:${session.identifier.port}", disconnecting the session.`
					);

					// Disconnect the session if too many packets were sent at once.
					return session.disconnect(
						"Received too many packets sent at once, possible exploit.",
						DisconnectReason.BadPacket
					);
				}

				// Loop through each frame, and handle the packet.
				// Ignore unknown packets for now.
				for (const frame of frames) {
					// Reads the packet id from the frame, which is a varint.
					const id = getPacketId(frame);
					const packet = Packets[id];
					if (packet === undefined) {
						// Debug log the receiving of an unknown packet.
						return this.logger.debug(
							`Recieved unknown packet with the id "0x${
								id.toString(16).length === 1
									? `0${id.toString(16)}`
									: id.toString(16)
							}" from "${session.identifier.address}:${session.identifier.port}".`
						);
					}

					// We will attempt to deserialize the packet, and if it fails, we will just ignore it for now.
					try {
						// Contruct the packet instance.
						// And deserialize the packet.
						const instance = new packet(frame).deserialize();

						// Check if the packet has remaining data.
						if (instance.offset < instance.binary.length) {
							this.logger.warn(
								`Packet ${Packet[id]} (0x${id.toString(16)}) from "${session.identifier.address}:${session.identifier.port}" has remaining data that was not read!`
							);
						}

						// Build the event with the packet instance and session.
						const event = {
							packet: instance,
							session,
							bound: NetworkBound.Server
						} as NetworkPacketEvent<DataPacket>;
						// Emit the packet event will return a promise with a boolean value.
						// If the value is false, the packet was cancelled from being handled.
						// If the value is true, the packet was either modified or not listened to.
						const net = this.emit(packet.id, event as never);
						const ses = session.emit(packet.id, event as never);

						// Check if the packet was cancelled.
						if (!net || !ses) continue;

						// Attempt to find handlers registered for the packet.
						const handlers = this.handlers.filter(
							(x) => x.packet === instance.getId()
						);

						// Check if a no handlers were found.
						// If so, we will emit a warning and continue to the next packet.
						if (handlers.length > 0) {
							// We will then attempt to handle the packet.
							// If an error occurs, log the error and continue to the next packet.
							try {
								// Loop through each handler and handle the packet.
								for (const handler of handlers) {
									handler.handle(instance, session);
								}
							} catch (reason) {
								this.logger.error(reason);
							}
						} else {
							this.logger.debug(
								`Unable to find network handler for ${Packet[id]} (0x${id.toString(16)}) packet from "${
									session.identifier.address
								}:${session.identifier.port}"!`
							);
						}
					} catch (reason) {
						// If an error occurs, log the error and continue to the next packet.
						this.logger.error(
							`Failed to execute handler for ${Packet[id]} (0x${id.toString(16)}) packet from "${session.identifier.address}:${session.identifier.port}"!`,
							reason
						);
					}
				}
			}
		} catch (reason) {
			// If an error occurs, log the error and continue to the next packet.
			this.logger.error(
				`Failed to handle incoming packets from "${conenction.rinfo.address}:${conenction.rinfo.port}"!`,
				reason
			);
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
	public send(
		session: NetworkSession,
		priority = Priority.Normal,
		...packets: Array<DataPacket>
	): void {
		try {
			// Prepare an array of buffers
			const payloads: Array<Buffer> = [];

			// We will first loop each packet and emit them through the event loop.
			// This will allow the ability to cancel or modify the packet.
			for (const packet of packets) {
				// Construct the event with the packet instance and session.
				const event = {
					packet,
					session,
					bound: NetworkBound.Client
				} as NetworkPacketEvent<DataPacket>;

				// Emit the packet event will return a promise with a boolean value.
				// If the value is false, the packet was cancelled from sending.
				// If the value is true, the packet was either modified or not listened to.
				const net = this.emit(packet.getId() as Packet, event as never);
				const ses = session.emit(packet.getId() as Packet, event as never);

				// Check if the packet was cancelled.
				// If so, we will ignore the packet and continue to the next one.
				if (!net || !ses) continue;

				// Will will then serialize the packet.
				// And push the serialized packet into the payloads array.
				const serialized = packet.serialize();
				payloads.push(serialized);
			}

			// Then we will frame the packets into a single payload.
			// A framed payload starts with the size of the upcoming packet.
			// Followed by the packet buffer itself. This continues until all packets are framed.
			const framed = Framer.frame(...payloads);

			// Depending on the size of the framed payload, we will check if compression is enabled for the session.
			const deflated =
				framed.byteLength > this.compressThreshold && session.compression
					? Buffer.from([this.compressMethod, ...deflateRawSync(framed)])
					: session.compression
						? Buffer.from([CompressionMethod.None, ...framed])
						: framed;

			// We will then check if encryption is enabled for the session.
			// If so, we will encrypt the deflated payload.
			// If not, we will just use the deflated payload.
			// NOTE: Encryption is not implemented yet. So we will just use the deflated payload for now.
			// TODO: Implement encryption for the session.
			const encrypted = session.encryption ? deflated : deflated;

			// We will then construct the final payload with the game header and the encrypted compressed payload.
			const payload = Buffer.concat([Buffer.from([GAME_BYTE]), encrypted]);

			// Finally we will assemble a new frame with the payload.
			// The frame contains the reliability and priority of the packet.
			// As well as the payload itself.
			const frame = new Frame();
			frame.reliability = session.reliablity;
			frame.orderChannel = session.channel;
			frame.payload = payload;

			// And send the frame to the session.
			return session.connection.sendFrame(frame, priority);
		} catch (reason) {
			// If an error occurs, we will emit the error event.
			this.logger.error(
				`Failed to send packets to "${session.identifier.address}:${session.identifier.port}"!`,
				packets.map((x) => Packet[x.getId()]),
				reason
			);
		}
	}
}

export { Network };
