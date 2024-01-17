import type { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';
import { Disconnect, LevelChunk, NetworkChunkPublisherUpdate } from '@serenityjs/bedrock-protocol';
import type { DataPacket, DisconnectReason } from '@serenityjs/bedrock-protocol';
import { BinaryStream, Endianness } from '@serenityjs/binarystream';
import type { Connection, NetworkIdentifier } from '@serenityjs/raknet-server';
import type { Serenity } from '../Serenity';
import type { Player } from '../player';
import type { ChunkColumn } from '../world';
import type { Network } from './Network';

let runtimeId = 0n;

class NetworkSession {
	public readonly serenity: Serenity;
	public readonly network: Network;
	public readonly connection: Connection;
	public readonly guid: bigint;
	public readonly identifier: NetworkIdentifier;
	public readonly runtimeId: bigint;
	public readonly uniqueId: bigint;

	public encryption: boolean = false;
	public compression: boolean = false;

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
		// Sort the players map into an array.
		// Then we will attempt to find the player with the same session as this.
		const players = [...this.serenity.players.values()];
		const player = players.find((x) => x.session === this);

		// If the player is not found, return null.
		if (!player) return null;

		// Return the player.
		return player;
	}

	public async sendChunk(chunk: ChunkColumn): Promise<void> {
		const packet = new LevelChunk();
		packet.x = chunk.x;
		packet.z = chunk.z;
		packet.subChunkCount = 1;
		packet.cacheEnabled = false;
		packet.data = chunk.serialize();

		// TODO: add to loaded chunks via hash

		await this.send(packet);
	}
}

export { NetworkSession };
