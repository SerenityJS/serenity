import type { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';
import { Disconnect, LevelChunk, NetworkChunkPublisherUpdate, MovePlayer } from '@serenityjs/bedrock-protocol';
import type { DataPacket, DisconnectReason } from '@serenityjs/bedrock-protocol';
import { BinaryStream, Endianness } from '@serenityjs/binarystream';
import type { Connection, NetworkIdentifier } from '@serenityjs/raknet-server';
import type { Serenity } from '../Serenity';
import type { Player } from '../player';
import { ChunkColumn } from '../world';
import type { Network } from './Network';

let runtimeId = 0n;

// NOTE
// STRUCTURE FOR PLAYER AND NEWORKSESSION CLASS
// Any methods that will directly interact with the player should be in the player class.
// Any methods that will NOT directly interact with the player should be in the network session class.
// The methods in the network session class should be used for reiceving packets from other players.
// For example, the player class has a sendMessage() method, this method will directly interact with the player, by sending a message on screen.
// Another example, the network session class has a receiveMovement() method, this method will NOT directly interact with the player,
// As this method handles the movement of other players, not the player itself.
//

class NetworkSession {
	public readonly serenity: Serenity;
	public readonly network: Network;
	public readonly connection: Connection;
	public readonly guid: bigint;
	public readonly identifier: NetworkIdentifier;
	public readonly runtimeId: bigint;
	public readonly uniqueId: bigint;
	public readonly chunks: Map<bigint, ChunkColumn>;

	public encryption: boolean = false;
	public compression: boolean = false;

	protected player: Player | null = null;

	/**
	 * Creates a new network session.
	 *
	 * @param serenity The serenity instance.
	 * @param connection The connection.
	 * @returns A new network session.
	 */
	public constructor(serenity: Serenity, connection: Connection) {
		this.serenity = serenity;
		this.network = serenity.network;
		this.connection = connection;
		this.guid = connection.guid;
		this.identifier = connection.identifier;
		this.runtimeId = runtimeId++;
		this.uniqueId = BigInt.asUintN(64, this.guid ^ this.runtimeId);
		this.chunks = new Map();
	}

	/**
	 * Sends a packet to the client.
	 *
	 * @param packets The packets to send.
	 * @returns A promise that resolves when the packet has been sent.
	 */
	public async send(...packets: DataPacket[]): Promise<void> {
		return this.network.send(this, ...packets);
	}

	public disconnect(message: string, reason: DisconnectReason, hideReason = false): void {
		const packet = new Disconnect();
		packet.message = message;
		packet.reason = reason;
		packet.hideDisconnectionScreen = hideReason;

		void this.send(packet);
	}

	/**
	 * Gets the player instance for this session.
	 *
	 * @returns The player instance.
	 */
	public getPlayerInstance(): Player | null {
		// Check if the player is already set.
		if (this.player) return this.player;

		// Sort the players map into an array.
		// Then we will attempt to find the player with the same session as this.
		const players = [...this.serenity.players.values()];
		const player = players.find((x) => x.session === this);

		// If the player is not found, return null.
		if (!player) return null;

		// Set the player to this session.
		this.player = player;

		// Return the player.
		return player;
	}

	// TODO: move to player class
	public async sendChunk(chunk: ChunkColumn): Promise<void> {
		const packet = new LevelChunk();
		packet.x = chunk.x;
		packet.z = chunk.z;
		packet.subChunkCount = chunk.getSubChunkSendCount() + 4;
		packet.cacheEnabled = false;
		packet.data = chunk.serialize();

		const hash = ChunkColumn.getHash(chunk.x, chunk.z);
		this.chunks.set(hash, chunk);

		await this.send(packet);
	}

	/**
	 * Handles movement from other players.
	 *
	 * @param player The player that moved.
	 * @param packet The movement packet.
	 */
	public receiveMovement(player: Player, packet: MovePlayer): void {
		// Check if our player instance is null.
		// If it is, we will log an error and return.
		if (!this.player) {
			return this.serenity.logger.error(
				`Failed to find player instance for ${this.identifier.address}:${this.identifier.port}! NetworkSession.receiveMovement()`,
			);
		}

		// Check if the player is rendered to our player.
		// If it isn't, we will return.
		if (!this.player.render.players.has(player.uniqueEntityId)) return;

		// Create a new movement packet.
		const move = new MovePlayer();
		move.runtimeId = player.runtimeId;
		move.position = packet.position;
		move.pitch = player.rotation.x;
		move.yaw = player.rotation.z;
		move.headYaw = player.headYaw;
		move.mode = packet.mode;
		move.onGround = player.onGround;
		move.riddenRuntimeId = 0n;
		move.cause = packet.cause;
		move.tick = 0n;

		// Send the movement packet
		void this.send(move);
	}
}

export { NetworkSession };
