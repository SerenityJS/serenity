import { Buffer } from 'node:buffer';
import { LevelChunk, NetworkChunkPublisherUpdate } from '@serenityjs/protocol';
import type { Encapsulated } from '@serenityjs/protocol';
import type { Serenity } from '../Serenity';
import { FormManager } from '../forms';
import type { Logger } from '../logger';
import type { Player } from '../player';
import { Settings } from './Settings';

class World {
	private readonly serenity: Serenity;
	private readonly logger: Logger;
	public readonly settings: Settings;
	public readonly players: Map<bigint, Player>;
	public readonly forms: FormManager;

	public tick = 0n;

	public constructor(serenity: Serenity) {
		this.serenity = serenity;
		this.logger = serenity.logger;
		this.settings = new Settings(serenity, this);
		this.players = new Map();
		this.forms = new FormManager();

		// TODO: Remove this, it's just for testing
		// Add world specific ticking
		setInterval(() => {
			for (const player of this.players.values()) {
				const net = new NetworkChunkPublisherUpdate();
				net.coordinate = { x: 0, z: 0, y: 0 };
				net.radius = 64;
				net.savedChunks = [];
				player.sendPacket(net);
			}
		}, 2_000);
	}

	public sendPacket(packet: Encapsulated): void {
		for (const [name, player] of this.players) {
			try {
				player.sendPacket(packet);
			} catch (error) {
				this.logger.error(`Failed to send packet "${packet.constructor.name}" to player "${name}"!`, error);
			}
		}
	}

	public addPlayer(player: Player): void {
		this.players.set(player.guid, player);
		this.logger.info(
			`Player "${player.username}" (${
				player.xuid
			}) is joining the server, and will be placed in world "${this.settings.getWorldName()}."`,
		);

		// Send all connected players the new player
		const players = [...this.players.values()].filter((p) => p !== player);
		for (const x of players) {
			x.addPlayerToList(player);
			x.spawnPlayer(player);
		}
	}

	public removePlayer(player: Player): void {
		this.players.delete(player.guid);
		this.logger.info(`Player "${player.username}" (${player.xuid}) has left the server.`);

		// Remove the player from the playerlist
		const players = [...this.players.values()].filter((p) => p !== player);
		for (const x of players) {
			x.removePlayerFromList(player);
		}
	}

	// TODO: Implement this
	// It will be this for now
	public sendChunk(player: Player): void {
		const net = new NetworkChunkPublisherUpdate();
		net.coordinate = { x: 0, z: 0, y: 0 };
		net.radius = 64;
		net.savedChunks = [];
		player.sendPacket(net);

		for (
			let x = player.position.z - this.settings.getChunkRadius();
			x < player.position.z + this.settings.getChunkRadius();
			x++
		) {
			for (
				let z = player.position.z - this.settings.getChunkRadius();
				z < player.position.z + this.settings.getChunkRadius();
				z++
			) {
				const chunk = new LevelChunk();
				chunk.x = x;
				chunk.z = z;
				chunk.subChunkCount = 1;
				chunk.cacheEnabled = false;
				chunk.data = getChunkData();
				player.sendPacket(chunk);
			}
		}
	}
}

// Sourced from GreenFrog MCBE
// TODO: Make own generator
function getChunkData(): Buffer {
	const airThreshold = 1 / 3_000;
	const hillThreshold = 5 / 600;

	const magicOffset = 351;

	const chunkData = Buffer.alloc(16 * 256 * 16);

	const randomNumbers = Array.from({ length: 16 * 256 * 16 })
		.fill(0)
		.map(() => Math.random());

	let blockCount = 0;

	for (let x = 0; x < 16; x++) {
		for (let y = 0; y < 256; y++) {
			for (let z = 0; z < 16; z++) {
				const index = y * 16 * 16 + z * 16 + x;
				blockCount++;

				if (x > 14 && y > -1 && y < 16) {
					// Holes
					chunkData[index - 1] = randomNumbers[index - 1] < airThreshold ? 0 : 2;
				} else {
					// Hills
					if (randomNumbers[index] < hillThreshold && blockCount > 4_161_319 && !chunkData[index]) {
						for (let i = 0; i < 1_200; i++) {
							if ((index - i) % 2 === 0 && y > 15) {
								if (!chunkData[index - i]) {
									chunkData[index - i] = 2;
								}

								if (!chunkData[index - magicOffset - i]) {
									chunkData[index - magicOffset - i] = 2;
								}
							}
						}
					} else {
						chunkData[index] = 1;
					}

					// Generate ores
					for (let i = 1; i <= 5; i++) {
						chunkData[index - i] = _generateOre();
					}

					// Dirt generator
					chunkData[index - 1] = 3;

					// 7 generator
					if (chunkData[index + 1] === 7 || chunkData[index + 2] === 7) {
						chunkData[index + 1] = 0;
						chunkData[index + 2] = 0;
					}

					chunkData[index - 13] = 7;
				}
			}
		}
	}

	return chunkData;
}

function _generateOre() {
	let blockType;

	if (Math.floor(Math.random() * 100) < 30) {
		blockType = 16;
	} else {
		blockType = 1;
	}

	return blockType;
}

export { World };
