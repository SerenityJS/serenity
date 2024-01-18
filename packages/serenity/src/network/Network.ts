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
	MovePlayer,
	ScriptMessage,
	PlayerList,
	PacketViolationWarning,
	UpdateAbilities,
	SetLocalPlayerAsInitialized,
	Text,
	CommandRequest,
	ToastRequest,
	Interact,
	ContainerOpen,
	ContainerClose,
	PlayerAction,
	UpdateAttributes,
	NetworkChunkPublisherUpdate,
	BlockPickRequest,
	AddPlayer,
	SetEntityData,
} from '@serenityjs/bedrock-protocol';
import { Packet, Packets, Framer, getPacketId } from '@serenityjs/bedrock-protocol';
import type { SetTitle } from '@serenityjs/bedrock-protocol/dist/packets/SetTitle';
import { BinaryStream } from '@serenityjs/binarystream';
import { Frame, Reliability, Priority } from '@serenityjs/raknet-protocol';
import type { Serenity } from '../Serenity';
import { Logger, LoggerColors } from '../console';
import { EventEmitter } from '../utils';
import type { NetworkSession } from './Session';
import { NETWORK_HANDLERS, NetworkHandler } from './handlers';

// TODO: Move elsewhere

// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
export enum NetworkStatus {
	Incoming,
	Outgoing,
}

export interface NetworkPacketEvent<T extends DataPacket> {
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
	[Packet.Text]: [NetworkPacketEvent<Text>];
	[Packet.StartGame]: [NetworkPacketEvent<StartGame>];
	[Packet.AddPlayer]: [NetworkPacketEvent<AddPlayer>];
	[Packet.MovePlayer]: [NetworkPacketEvent<MovePlayer>];
	[Packet.UpdateAttributes]: [NetworkPacketEvent<UpdateAttributes>];
	[Packet.Interact]: [NetworkPacketEvent<Interact>];
	[Packet.BlockPickRequest]: [NetworkPacketEvent<BlockPickRequest>];
	[Packet.PlayerAction]: [NetworkPacketEvent<PlayerAction>];
	[Packet.SetEntityData]: [NetworkPacketEvent<SetEntityData>];
	[Packet.ContainerOpen]: [NetworkPacketEvent<ContainerOpen>];
	[Packet.ContainerClose]: [NetworkPacketEvent<ContainerClose>];
	[Packet.LevelChunk]: [NetworkPacketEvent<LevelChunk>];
	[Packet.PlayerList]: [NetworkPacketEvent<PlayerList>];
	[Packet.CommandRequest]: [NetworkPacketEvent<CommandRequest>];
	[Packet.SetTitle]: [NetworkPacketEvent<SetTitle>];
	[Packet.SetLocalPlayerAsInitialized]: [NetworkPacketEvent<SetLocalPlayerAsInitialized>];
	[Packet.NetworkChunkPublisherUpdate]: [NetworkPacketEvent<NetworkChunkPublisherUpdate>];
	[Packet.BiomeDefinitionList]: [NetworkPacketEvent<BiomeDefinitionList>];
	[Packet.NetworkSettings]: [NetworkPacketEvent<NetworkSettings>];
	[Packet.CreativeContent]: [NetworkPacketEvent<CreativeContent>];
	[Packet.PacketViolationWarning]: [NetworkPacketEvent<PacketViolationWarning>];
	[Packet.ScriptMessage]: [NetworkPacketEvent<ScriptMessage>];
	[Packet.ToastRequest]: [NetworkPacketEvent<ToastRequest>];
	[Packet.UpdateAbilities]: [NetworkPacketEvent<UpdateAbilities>];
	[Packet.RequestNetworkSettings]: [NetworkPacketEvent<RequestNetworkSettings>];
}

const GameByte = Buffer.from([0xfe]);

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

class Network extends EventEmitter<NetworkEvents> {
	protected readonly serenity: Serenity;
	public readonly logger: Logger;
	public readonly sessions: Map<bigint, NetworkSession>;

	public constructor(serenity: Serenity) {
		super();

		this.serenity = serenity;
		this.logger = new Logger('Network', LoggerColors.Blue);
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
			frame.reliability = Reliability.ReliableOrdered;
			frame.orderChannel = 0;
			frame.body = payload;

			// And send the frame to the session.
			return session.connection.sendFrame(frame, Priority.Normal);
		} catch (error) {
			// If an error occurs, we will emit the error event.
			this.logger.error(error);
		}
	}

	/**
	 * Broadcasts a packet to all players.
	 *
	 * @param packets The packets to broadcast.
	 * @returns A promise that resolves when the packets have been broadcasted.
	 */
	public async broadcast(...packets: DataPacket[]): Promise<void> {
		// Loop through each session.
		for (const session of this.sessions.values()) {
			// Send the packet to the session.
			await this.send(session, ...packets);
		}
	}
}

export { Network };
