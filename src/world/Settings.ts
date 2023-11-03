import type { Vec3f } from '@serenityjs/protocol';
import { Gamemode, PermissionLevel, Difficulty, SetDifficulty, ChunkRadiusUpdate } from '@serenityjs/protocol';
import type { Serenity } from '../Serenity';
import type { World } from './World';

class Settings {
	private readonly serenity: Serenity;
	private readonly world: World;

	public readonly seed: bigint;
	private worldname = 'Serenity World';
	private difficulty: Difficulty = Difficulty.Peaceful; // TODO enum in protocol
	private gamemode: Gamemode = Gamemode.Survival; // TODO enum in protocol
	private chunkRadius = 4;
	private spawnPosition: Vec3f = { x: 0, y: -48, z: 0 };
	private permissionLevel: PermissionLevel = PermissionLevel.Member; // TODO enum in protocol
	private emotesDisabled = false;
	private skinsDisabled = false;
	private personaDisabled = false;

	// generator type?

	public constructor(serenity: Serenity, world: World, seed?: bigint) {
		this.serenity = serenity;
		this.world = world;
		this.seed = seed ?? 0n;
	}

	public getWorldName(): string {
		return this.worldname;
	}

	public setWorldName(name: string): void {
		// TODO: Send packet to players in world
		this.worldname = name;
	}

	public getDifficulty(): Difficulty {
		return this.difficulty;
	}

	public setDifficulty(difficulty: Difficulty): void {
		// Create a new set difficulty packet, and send it
		const packet = new SetDifficulty();
		packet.difficulty = difficulty;
		this.world.sendPacket(packet);
		// Set the difficulty property
		this.difficulty = difficulty;
	}

	public getGamemode(): Gamemode {
		return this.gamemode;
	}

	public setGamemode(gamemode: Gamemode): void {
		this.gamemode = gamemode;
	}

	public getChunkRadius(): number {
		return this.chunkRadius;
	}

	public setChunkRadius(radius: number): void {
		// Create a new chunk radius update packet, and send it
		const packet = new ChunkRadiusUpdate();
		packet.radius = radius;
		this.world.sendPacket(packet);
		// Set the chunk radius property
		this.chunkRadius = radius;
	}

	public getSpawnPosition(): Vec3f {
		return this.spawnPosition;
	}

	public setSpawnPosition(position: Vec3f): void {
		// TODO: Send packet to players in world
		this.spawnPosition = position;
	}

	public getPermissionLevel(): PermissionLevel {
		return this.permissionLevel;
	}

	public setPermissionLevel(permissionLevel: PermissionLevel): void {
		this.permissionLevel = permissionLevel;
	}

	public getEmotesDisabled(): boolean {
		return this.emotesDisabled;
	}

	public setEmotesDisabled(disabled: boolean): void {
		this.emotesDisabled = disabled;
	}

	public getSkinsDisabled(): boolean {
		return this.skinsDisabled;
	}

	public setSkinsDisabled(disabled: boolean): void {
		this.skinsDisabled = disabled;
	}

	public getPersonaDisabled(): boolean {
		return this.personaDisabled;
	}

	public setPersonaDisabled(disabled: boolean): void {
		this.personaDisabled = disabled;
	}
}

export { Settings };
