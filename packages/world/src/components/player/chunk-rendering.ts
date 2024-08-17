import {
	ChunkCoords,
	LevelChunkPacket,
	NetworkChunkPublisherUpdatePacket
} from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { Chunk } from "../../chunk";
import { PlayerStatus, type Player } from "../../player";

import { PlayerComponent } from "./player-component";

class PlayerChunkRenderingComponent extends PlayerComponent {
	public static readonly identifier = "minecraft:chunk_rendering";

	public static readonly types = [EntityIdentifier.Player];

	/**
	 * A map of chunks that the player has been sent, and whether or not they have been rendered.
	 */
	public readonly chunks: Set<bigint> = new Set();

	/**
	 * The player's view distance. The default value is the player's dimension's view distance value.
	 */
	public viewDistance = this.player.dimension.viewDistance;

	public constructor(player: Player) {
		super(player, PlayerChunkRenderingComponent.identifier);
	}

	/**
	 * Sends a chunk to the player.
	 * @param chunks The chunks to send to the player.
	 */
	public send(...chunks: Array<Chunk>): void {
		// Iterate over the chunks
		for (const chunk of chunks) {
			// Check if the chunk is already rendered
			if (this.chunks.has(chunk.hash)) continue;

			// Add the chunk to the rendered chunks
			// Set the chunk to false to indicate that it has been rendered
			this.chunks.add(chunk.hash);
		}
	}

	/**
	 * Checks if a chunk has been sent to the player.
	 * @param hash The hash of the chunk to check.
	 * @returns True if the chunk has been sent, false otherwise.
	 */
	public sent(hash: bigint): boolean {
		return this.chunks.has(hash);
	}

	/**
	 * Gets the distance between the player and a chunk.
	 * @param chunk The hash of the chunk to get the distance to.
	 * @returns The distance between the player and the chunk.
	 */
	public distance(hash: bigint): number {
		// Convert the chunk hash to a position
		const { x: cx, z: cz } = ChunkCoords.unhash(hash);
		const { bx, bz } = { bx: Math.abs(cx << 4), bz: Math.abs(cz << 4) };

		// Get the player's position
		const { x, z } = this.player.position.floor();
		const { ax, az } = { ax: Math.abs(x), az: Math.abs(z) };

		// Calculate the distance
		const dx = Math.abs(ax - bx);
		const dz = Math.abs(az - bz);

		// Return the distance
		return Math.max(dx, dz);
	}

	/**
	 * Gets the next set of chunk hashes to send to the player.
	 * @note This method obtains the chunks that are within the player's view distance.
	 * @returns An array of chunk hashes to send to the player.
	 */
	public next(): Array<bigint> {
		// Calculate the chunk position of the entity
		const cx = this.player.position.x >> 4;
		const cz = this.player.position.z >> 4;

		// Get the simulation distance of the dimension
		const simulationDistance = this.player.dimension.simulationDistance;

		// Calculate the distance or use the simulation distance of the dimension
		const dx = (this.viewDistance ?? simulationDistance) >> 4;
		const dz = (this.viewDistance ?? simulationDistance) >> 4;

		// Prepare an array to store the chunks that need to be sent to the player.
		const hashes: Array<bigint> = [];

		// Get the chunks to render.
		for (let x = -dx + cx; x <= dx + cx; x++) {
			for (let z = -dz + cz; z <= dz + cz; z++) {
				// Check if the chunk is already rendered
				if (this.chunks.has(ChunkCoords.hash({ x, z }))) continue;

				// Add the chunk to the array.
				hashes.push(ChunkCoords.hash({ x, z }));
			}
		}

		// Return the hashes
		return hashes;
	}

	public onTick(): void {
		// Check if the player is spawned
		if (this.player.status !== PlayerStatus.Spawned) return;

		// Get the next chunks to send to the player
		const hashes = [...this.chunks.keys(), ...this.next()].filter(
			// Filter out the chunks that are already rendered
			(hash) => !this.chunks.has(hash) || !this.chunks.has(hash)
		);

		// Get the coords of the chunks
		const coords = hashes.map((hash) => ChunkCoords.unhash(hash));

		// Check if there are any chunks to send
		if (coords.length > 0) {
			// Send the chunks to the player
			for (const hash of hashes) {
				// Another sanity check to make sure the chunk is not already rendered
				if (this.chunks.has(hash)) continue;

				// Get the chunk from the dimension
				const chunk = this.player.dimension.getChunkFromHash(hash);

				// Check if the chunk is ready
				if (!chunk.ready) {
					// Remove the coordinates from the list
					coords.splice(coords.indexOf({ x: chunk.x, z: chunk.z }), 1);

					// Continue to the next chunk
					continue;
				}

				// Create a new level chunk packet
				const packet = new LevelChunkPacket();

				// Assign the chunk data to the packet
				packet.x = chunk.x;
				packet.z = chunk.z;
				packet.dimension = chunk.type;
				packet.subChunkCount = chunk.getSubChunkSendCount();
				packet.cacheEnabled = false;
				packet.data = Chunk.serialize(chunk);

				// Return the packet
				this.player.session.send(packet);

				// Set the chunk to rendered
				this.chunks.add(hash);
			}

			// Create a new network chunk publisher update packet
			const update = new NetworkChunkPublisherUpdatePacket();

			// Set the packet properties
			update.radius = this.player.dimension.viewDistance << 4;
			update.coordinate = this.player.position.floor();
			update.savedChunks = coords;

			// Send the update to the player.
			this.player.session.send(update);
		} else {
			// Check if any chunks need to be removed from the player's view
			for (const hash of this.chunks) {
				// Get the distance between the player and the chunk
				const distance = this.distance(hash);
				const maxDistance = this.viewDistance + this.viewDistance / 4;

				// Check if the distance is greater than the view distance
				if (maxDistance < distance) {
					// Remove the chunk from the player's view
					this.chunks.delete(hash);
				}
			}
		}
	}
}

export { PlayerChunkRenderingComponent };
