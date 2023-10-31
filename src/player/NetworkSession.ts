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
import { EventEmitter } from '../utils';
import { Handlers } from './handlers';

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
	public readonly runtimeId = runtimeId++;

	public compression = false;
	public encryption = false;

	public constructor(serenity: Serenity, session: Session) {
		super();
		this.serenity = serenity;
		this.session = session;
	}

	public disconnect(message: string, hideScreen = false, reason: DisconectReason = DisconectReason.Kicked): void {
		const packet = new Disconect();
		packet.reason = reason;
		packet.message = message;
		packet.hideDisconnectScreen = hideScreen;
		this.send(packet.serialize());
	}

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
				// Emit the buffer event
				// await this.serenity.emit('buffer', { bin, id }, this);
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
					// Let the player handle the packet.
					const handler = Handlers.get(instance.getId());
					if (handler) {
						handler.handle(instance, this);
					} else {
						this.serenity.logger.warn(
							`Unable to find handler for ${Packets[id]} (0x${id.toString(16)}) packet from "${
								this.session.remote.address
							}:${this.session.remote.port}"!`,
						);
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
}

export { NetworkSession, type NetworkSessionEvents };
