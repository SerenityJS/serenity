// Network
// Handles all incoming and outgoing network traffic
// ----------------------------------

import { Buffer } from 'node:buffer';
import { inflateRawSync, deflateRawSync } from 'node:zlib';
import type {
	DataPacket,
	Login,
	RequestNetworkSettings,
	Disconnect,
	NetworkSettings,
	PlayStatus,
	ResourcePacksInfo,
	ResourcePackClientResponse,
	ResourcePackStack,
	StartGame,
	CreativeContent,
	BiomeDefinitionList,
	LevelChunk,
} from '@serenityjs/bedrock-protocol';
import { Packet, Packets, Framer, getPacketId } from '@serenityjs/bedrock-protocol';
import { BinaryStream } from '@serenityjs/binarystream';
import { Frame, Reliability, Priority } from '@serenityjs/raknet-protocol';
import type { Serenity } from '../Serenity';
import { EventEmitter } from '../utils';
import type { NetworkSession } from './Session';
import { NETWORK_HANDLERS, NetworkHandler } from './handlers';

// TODO: Move elsewhere

// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
export enum NetworkStatus {
	Incoming,
	Outgoing,
}

interface NetworkPacketEvent<T extends DataPacket> {
	packet: T;
	session: NetworkSession;
	status: NetworkStatus;
}

interface NetworkEvents {
	[Packet.Login]: [NetworkPacketEvent<Login>];
	[Packet.PlayStatus]: [NetworkPacketEvent<PlayStatus>];
	[Packet.Disconnect]: [NetworkPacketEvent<Disconnect>];
	[Packet.ResourcePacksInfo]: [NetworkPacketEvent<ResourcePacksInfo>];
	[Packet.ResourcePackStack]: [NetworkPacketEvent<ResourcePackStack>];
	[Packet.ResourcePackClientResponse]: [NetworkPacketEvent<ResourcePackClientResponse>];
	[Packet.StartGame]: [NetworkPacketEvent<StartGame>];
	[Packet.LevelChunk]: [NetworkPacketEvent<LevelChunk>];
	[Packet.BiomeDefinitionList]: [NetworkPacketEvent<BiomeDefinitionList>];
	[Packet.NetworkSettings]: [NetworkPacketEvent<NetworkSettings>];
	[Packet.CreativeContent]: [NetworkPacketEvent<CreativeContent>];
	[Packet.RequestNetworkSettings]: [NetworkPacketEvent<RequestNetworkSettings>];
}

const GameByte = Buffer.from([0xfe]);

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

class Network extends EventEmitter<NetworkEvents> {
	protected readonly serenity: Serenity;
	public readonly sessions: Map<bigint, NetworkSession>;

	public constructor(serenity: Serenity) {
		super();

		this.serenity = serenity;
		this.sessions = new Map();

		NetworkHandler.serenity = serenity;
	}

	public async incoming(session: NetworkSession, ...payloads: Buffer[]): Promise<void> {
		// Loop through each buffer.
		// We may receive multiple packets in one payload.

		for (const buffer of payloads) {
			// Construct a new BinaryStream from the buffer.
			// And check if the first byte is 0xfe AKA the game packet header.
			const stream = new BinaryStream(buffer);
			const header = stream.readUint8();
			if (header !== GameByte[0]) return console.log('Invalid packet header', header);

			// Check if the session is encrypted.
			// NOTE: Encryption is not implemented yet. So we will just handle the packet as if it was not encrypted.
			// TODO: Implement encryption for the session.
			// eslint-disable-next-line sonarjs/no-all-duplicated-branches
			const decrypted = session.encryption ? stream.readRemainingBuffer() : stream.readRemainingBuffer();

			// Inflates the buffer if the session has compression enabled.
			// If not, will read the remaining buffer.
			// We will then unframe the buffer into packets.
			// Sometimes we will get multiple packets in one payload.
			const inflated = session.compression ? inflateRawSync(decrypted) : decrypted;
			const frames = Framer.unframe(inflated);

			// Loop through each frame, and handle the packet.
			// Ignore unknown packets for now.
			for (const frame of frames) {
				// Reads the packet id from the frame, which is a varint.
				const id = getPacketId(frame);
				const packet = Packets[id];
				if (packet === undefined) return console.log('Unknown packet', id.toString(16));

				// We will attempt to deserialize the packet, and if it fails, we will just ignore it for now.
				try {
					// Contruct the packet instance.
					// And deserialize the packet.
					const instance = new packet(frame).deserialize();

					// Build the event with the packet instance and session.
					const event = {
						packet: instance,
						session,
						status: NetworkStatus.Incoming,
					} as NetworkPacketEvent<any>;

					// Emit the packet event will return a promise with a boolean value.
					// If the value is false, the packet was cancelled from being handled.
					// If the value is true, the packet was either modified or not listened to.
					const value = await this.emit(instance.getId() as Packet, event);

					// Check if the packet was cancelled.
					if (!value) continue;

					// Attempt to find a handler for the packet.
					const handler = NETWORK_HANDLERS.find((x) => x.name.startsWith(Packet[instance.getId() as Packet]));

					// Check if a handler was not found.
					// If so, we will emit a warning and continue to the next packet.
					if (handler) {
						// We will then attempt to handle the packet.
						// If an error occurs, we will emit the error event.
						try {
							void handler.handle(instance as any, session);
						} catch (error) {
							void this.serenity.emit('error', error);
						}
					} else {
						void this.serenity.emit(
							'warning',
							`Unable to find network handler for ${Packet[id]} (0x${id.toString(16)}) packet from "${
								session.identifier.address
							}:${session.identifier.port}"!`,
						);
					}
				} catch (error) {
					// If an error occurs, we will emit the error event.
					void this.serenity.emit('error', error);
				}
			}
		}
	}

	public async send(session: NetworkSession, ...packets: DataPacket[]): Promise<void> {
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
					status: NetworkStatus.Outgoing,
				} as NetworkPacketEvent<any>;

				// Emit the packet event will return a promise with a boolean value.
				// If the value is false, the packet was cancelled from sending.
				// If the value is true, the packet was either modified or not listened to.
				const value = await this.emit(packet.getId() as Packet, event);

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
			const deflated = session.compression ? deflateRawSync(framed) : framed;

			// We will then check if encryption is enabled for the session.
			// If so, we will encrypt the deflated payload.
			// If not, we will just use the deflated payload.
			// NOTE: Encryption is not implemented yet. So we will just use the deflated payload for now.
			// TODO: Implement encryption for the session.
			// eslint-disable-next-line sonarjs/no-all-duplicated-branches
			const encrypted = session.encryption ? deflated : deflated;

			// We will then construct the final payload with the game header and the encrypted compressed payload.
			const payload = Buffer.concat([GameByte, encrypted]);

			// Finally we will assemble a new frame with the payload.
			// The frame contains the reliability and priority of the packet.
			// As well as the payload itself.
			const frame = new Frame();
			frame.reliability = Reliability.Unreliable;
			frame.orderChannel = 0;
			frame.body = payload;

			// And send the frame to the session.
			return session.connection.sendFrame(frame, Priority.Normal);
		} catch (error) {
			// If an error occurs, we will emit the error event.
			void this.serenity.emit('error', error);
		}
	}
}

export { Network };
