import { Buffer } from 'node:buffer';
import { inflateRawSync, deflateRawSync } from 'node:zlib';
import type {
	RequestNetworkSettings,
	Login,
	ResourcePackClientResponse,
	RequestChunkRadius,
	ClientCacheStatus,
	TickSync,
} from '@serenityjs/protocol';
import { Framer, Packets, Packet, getPacketId, DisconectReason, Disconect } from '@serenityjs/protocol';
import { Frame, Reliability, Priority } from '@serenityjs/raknet.js';
import type { Session } from '@serenityjs/raknet.js';
import { BinaryStream } from 'binarystream.js';
import type { Serenity } from '../Serenity';
import type { Player } from '../player';
import { EventEmitter } from '../utils';
import type { SessionHandler } from './handlers';
import { sessionHandlers } from './handlers';

const GameByte = Buffer.from([0xfe]);

interface NetworkSessionEvents {
	ClientCacheStatus: [ClientCacheStatus];
	Login: [Login];
	RequestChunkRadius: [RequestChunkRadius];
	RequestNetworkSettings: [RequestNetworkSettings];
	ResourcePackClientResponse: [ResourcePackClientResponse];
	TickSync: [TickSync];
}

let runtimeId = 0n;

class NetworkSession extends EventEmitter<NetworkSessionEvents> {
	public readonly serenity: Serenity;
	public readonly session: Session;
	public readonly guid: bigint;
	public readonly runtimeId = runtimeId++;
	public readonly handlers = sessionHandlers;

	public compression = false;
	public encryption = false;

	public constructor(serenity: Serenity, session: Session) {
		super();
		this.serenity = serenity;
		this.session = session;
		this.guid = session.guid;
	}

	public getHandler(name: string): typeof SessionHandler {
		return this.handlers.find((x) => x.name.startsWith(name))!;
	}

	public disconnect(message: string, hideScreen = false, reason: DisconectReason = DisconectReason.Kicked): void {
		const packet = new Disconect();
		packet.reason = reason;
		packet.message = message;
		packet.hideDisconnectScreen = hideScreen;
		this.send(packet.serialize());
	}

	/**
	 * **send**
	 *
	 * Sends packets to the client.
	 *
	 * @param {Buffer[]} packets - Packets to send to the client.
	 */
	public send(...packets: Buffer[]): void {
		// All packets must be framed. because sometimes more than one packet is sent at a time.
		const framed = Framer.frame(...packets);
		// Check if compression is enabled, if so, compress the packet
		const compressed = this.compression ? deflateRawSync(framed) : framed;
		if (this.encryption) {
			this.serenity.logger.warn('Encryption is not supported yet.');
		} else {
			// We must concat the game byte to the front of the framed packet.
			const stream = new BinaryStream();
			stream.writeUInt8(GameByte[0]);
			stream.write(compressed);

			const frame = new Frame();
			frame.reliability = Reliability.Unreliable;
			frame.orderChannel = 0;
			frame.body = stream.getBuffer();
			this.session.sendFrame(frame, Priority.Normal);
		}
	}

	/**
	 * **incoming**
	 *
	 * Handles incoming packets from the client.
	 *
	 * @param {Buffer} buffer - Incoming buffer stream from the client
	 * @returns
	 */
	public async incoming(buffer: Buffer): Promise<void> {
		// create the stream
		const stream = new BinaryStream(buffer);
		const header = stream.readUInt8();
		if (header !== GameByte[0])
			return this.serenity.logger.error(
				`Got invalid header "${header}" from "${this.session.remote.address}:${this.session.remote.port}"!`,
			);
		// Checks for encryption
		if (this.encryption) {
			this.serenity.logger.warn('Encryption is not supported yet!');
		} else {
			// Inflate the packet if compression is enabled, otherwise just read the packet
			const inflated = this.compression ? inflateRawSync(stream.readRemaining()) : stream.readRemaining();
			const frames = Framer.unframe(inflated);
			// Handle each frame individually
			for (const frame of frames) {
				const id = getPacketId(frame);
				const bin = frame;
				// Attempts to get the player instance
				const player = this.getPlayerInstance();
				// Emit the buffer event
				await this.serenity.emit('packet', { bin, id }, this, player);
				// Attempt to get the packet, if so, construct and emit the packet event
				const packet = Packet[id as Packets];
				if (!packet) {
					this.serenity.logger.error(
						`Unable to find packet serializer for packet "0x${id.toString(16)}" from "${this.session.remote.address}:${
							this.session.remote.port
						}"!`,
					);
					continue;
				}

				// The packet event should be emitted through the Serenity instance. But if is was cancelled, dont emit through the client.
				// try to construct the packet, and deserialize it.
				try {
					// Create the instance.
					const instance = new packet(frame).deserialize();
					// emit the packet event, if cancelled, continue.
					const value = await this.serenity.emit(Packets[instance.getId()] as any, instance, this);
					if (!value) continue;

					if (player) {
						// Get the player handler
						const handler = player.handlers.find((x) => x.name.startsWith(Packets[instance.getId()]));
						if (handler) {
							// Handle the packet
							handler.handle(instance as any, player);
						} else {
							this.serenity.logger.warn(
								`Unable to find player handler for ${Packets[id]} (0x${id.toString(16)}) packet from "${
									this.session.remote.address
								}:${this.session.remote.port}"!`,
							);
						}
					} else {
						// Get the network session handler
						const handler = this.handlers.find((x) => x.name.startsWith(Packets[instance.getId()]));
						if (handler) {
							// Handle the packet
							handler.handle(instance as any, this);
						} else {
							this.serenity.logger.warn(
								`Unable to find network session handler for ${Packets[id]} (0x${id.toString(16)}) packet from "${
									this.session.remote.address
								}:${this.session.remote.port}"!`,
							);
						}
					}

					// Emit the packet event through the client.
					await this.emit(Packets[instance.getId()] as any, instance);
				} catch (error) {
					this.serenity.logger.error(
						`Failed to deserialize packet "0x${id.toString(16)}" from "${this.session.remote.address}:${
							this.session.remote.port
						}"!`,
					);
					this.serenity.logger.error(error);
				}
			}
		}
	}

	/**
	 * **getPlayerInstance**
	 *
	 * Gets the player instance from the session, if there is one.
	 *
	 * @returns {Player | undefined} - The player instance if available
	 */
	public getPlayerInstance(): Player | undefined {
		const worlds = [...this.serenity.worlds.values()];
		return worlds.find((world) => world.players.has(this.session.guid))?.players.get(this.session.guid);
	}
}

export { NetworkSession, type NetworkSessionEvents };
