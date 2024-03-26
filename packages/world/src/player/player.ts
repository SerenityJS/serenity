import { NetworkSession } from "@serenityjs/network";
import {
	AbilityLayerType,
	AddPlayerPacket,
	BlockCoordinates,
	Gamemode,
	LevelChunkPacket,
	MetadataFlags,
	MetadataKey,
	NetworkChunkPublisherUpdatePacket
} from "@serenityjs/protocol";

import { Entity } from "../entity";
import { LoginTokenData } from "../types/login-data";
import { Dimension } from "../world";
import { EntityIdentifier } from "../enums";
import { PlayerAbilityComponents, PlayerComponents } from "../types/components";
import {
	EntityAlwaysShowNametagComponent,
	EntityBreathingComponent,
	EntityHasGravityComponent,
	EntityInvetoryComponent,
	EntityMovementComponent,
	EntityNametagComponent,
	PlayerAbilityComponent,
	PlayerAttackMobsComponent,
	PlayerAttackPlayersComponent,
	PlayerBuildComponent,
	PlayerComponent,
	PlayerCountComponent,
	PlayerCursorComponent,
	PlayerDoorsAndSwitchesComponent,
	PlayerFlyingComponent,
	PlayerFlySpeedComponent,
	PlayerInstantBuildComponent,
	PlayerInvulnerableComponent,
	PlayerLightningComponent,
	PlayerMayFlyComponent,
	PlayerMineComponent,
	PlayerMutedComponent,
	PlayerNoClipComponent,
	PlayerOpenContainersComponent,
	PlayerOperatorCommandsComponent,
	PlayerPrivilegedBuilderComponent,
	PlayerTeleportComponent,
	PlayerWalkSpeedComponent,
	PlayerWorldBuilderComponent
} from "../components";
import { Chunk } from "../chunk";
import { ItemStack } from "../item";

class Player extends Entity {
	public readonly session: NetworkSession;
	public readonly username: string;
	public readonly xuid: string;
	public readonly uuid: string;
	public readonly chunks: Map<bigint, boolean>;

	public mining: BlockCoordinates | null = null;
	public gamemode: Gamemode = Gamemode.Creative;

	public constructor(
		session: NetworkSession,
		tokens: LoginTokenData,
		dimension: Dimension
	) {
		super(EntityIdentifier.Player, dimension, session.guid);
		this.session = session;
		this.username = tokens.identityData.displayName;
		this.xuid = tokens.identityData.XUID;
		this.uuid = tokens.identityData.identity;
		this.chunks = new Map();
	}

	/**
	 * Ticks the player instance.
	 */
	public tick(): void {
		// Get the hashes that aren't rendered
		const hashes = [...this.chunks.entries()].filter(
			([, rendered]) => !rendered
		);

		// Get the chunks from the hashes
		const coords = hashes.map(([hash]) => Chunk.fromHash(hash));

		// Check if there are any chunks to render
		if (hashes.length > 0) {
			// Iterate over the hashes
			for (const [hash] of hashes) {
				// Get the chunk from the hash
				const chunk = this.dimension.getChunkFromHash(hash);

				// Create a new LevelChunkPacket
				const packet = new LevelChunkPacket();

				// Set the packet properties
				packet.x = chunk.x;
				packet.z = chunk.z;
				packet.dimension = this.dimension.type;
				packet.subChunkCount = chunk.getSubChunkSendCount();
				packet.cacheEnabled = false;
				packet.data = Chunk.serialize(chunk);

				// Send the packet to the player
				this.session.send(packet);
			}
		}

		// Create a new NetworkChunkPublisherUpdatePacket
		const update = new NetworkChunkPublisherUpdatePacket();

		// Set the packet properties
		update.radius = this.dimension.viewDistance;
		update.coordinate = this.position.floor();
		update.savedChunks = coords;

		// Send the update to the player.
		this.session.send(update);

		// Set the chunks to rendered.
		for (const [hash] of hashes) this.chunks.set(hash, true);
	}

	/**
	 * Spawns the player in the world.
	 * @param player The player to spawn the player to.
	 */
	public spawn(player?: Player): void {
		// Create a new AddPlayerPacket
		const packet = new AddPlayerPacket();

		// Get the players inventory
		const inventory = this.getComponent("minecraft:inventory");

		const heldItem = inventory.getHeldItem();

		// Set the packet properties
		packet.uuid = this.uuid;
		packet.username = this.username;
		packet.runtimeId = this.runtime;
		packet.platformChatId = ""; // TODO: Not sure what this is.
		packet.position = this.position;
		packet.velocity = this.velocity;
		packet.pitch = this.rotation.pitch;
		packet.yaw = this.rotation.yaw;
		packet.headYaw = this.rotation.headYaw;
		packet.heldItem =
			heldItem === null ? { network: 0 } : ItemStack.toNetworkStack(heldItem);
		packet.gamemode = 0;
		packet.metadata = this.getMetadatas().map((entry) => {
			return {
				key: entry.flag ? MetadataKey.Flags : (entry.key as MetadataKey),
				type: entry.type,
				value: entry.currentValue,
				flag: entry.flag ? (entry.key as MetadataFlags) : undefined
			};
		});
		packet.properties = {
			ints: [],
			floats: []
		};
		packet.uniqueEntityId = this.unique;
		packet.premissionLevel = 0;
		packet.commandPermission = 0;
		packet.abilities = [
			{
				type: AbilityLayerType.Base,
				flags: this.getAbilities().map((component) => {
					return {
						flag: component.flag,
						value: component.currentValue
					};
				}),
				flySpeed: 0.05,
				walkSpeed: 0.1
			}
		];
		packet.links = [];
		packet.deviceId = "";
		packet.deviceOS = 0;

		// Send the packet to the player
		player ? player.session.send(packet) : this.dimension.broadcast(packet);

		// Add the player to the dimension
		this.dimension.entities.set(this.unique, this);
	}

	/**
	 * Gets a component from the player.
	 * @param component The component to get.
	 * @returns The component that was found.
	 */
	public getComponent<T extends keyof PlayerComponents>(
		component: T
	): PlayerComponents[T] {
		return this.components.get(component) as PlayerComponents[T];
	}

	/**
	 * Gets all the components from the player.
	 * @returns The components that were found.
	 */
	public getComponents(): Array<PlayerComponent> {
		return [...this.components.values()] as Array<PlayerComponent>;
	}

	/**
	 * Sets a component to the player.
	 * @param component The component to set.
	 */
	public setComponent<T extends keyof PlayerComponents>(
		component: PlayerComponents[T]
	): void {
		this.components.set(component.identifier, component as PlayerComponent);
	}

	/**
	 * Removes a component from the player.
	 * @param component The component to remove.
	 */
	public removeComponent<T extends keyof PlayerComponents>(component: T): void {
		this.components.delete(component);
	}

	/**
	 * Gets an ability from the player.
	 * @param ability The ability to get.
	 * @returns The ability that was found.
	 */
	public getAbility<T extends keyof PlayerAbilityComponents>(
		ability: T
	): PlayerAbilityComponents[T] {
		return this.components.get(ability) as PlayerAbilityComponents[T];
	}

	/**
	 * Gets the abilities of the player.
	 * @returns The abilities of the player.
	 */
	public getAbilities(): Array<PlayerAbilityComponent> {
		return [...this.components.values()].filter(
			(component): component is PlayerAbilityComponent =>
				component instanceof PlayerAbilityComponent
		);
	}

	/**
	 * Sends a chunk to the player.
	 * @param chunks The chunks to send to the player.
	 */
	public sendChunk(...chunks: Array<Chunk>): void {
		// Iterate over the chunks
		for (const chunk of chunks) {
			// Check if the chunk is already rendered
			if (this.chunks.has(chunk.getHash())) continue;

			// Add the chunk to the rendered chunks
			// Set the chunk to false to indicate that it has been rendered
			this.chunks.set(chunk.getHash(), false);
		}
	}
}

export { Player };

// Register the player components
Player.registerComponent(PlayerCursorComponent);
Player.registerComponent(EntityInvetoryComponent);
Player.registerComponent(EntityMovementComponent);
Player.registerComponent(EntityHasGravityComponent);
Player.registerComponent(EntityBreathingComponent);
Player.registerComponent(EntityNametagComponent);
Player.registerComponent(EntityAlwaysShowNametagComponent);
Player.registerComponent(PlayerBuildComponent);
Player.registerComponent(PlayerMineComponent);
Player.registerComponent(PlayerDoorsAndSwitchesComponent);
Player.registerComponent(PlayerOpenContainersComponent);
Player.registerComponent(PlayerAttackPlayersComponent);
Player.registerComponent(PlayerAttackMobsComponent);
Player.registerComponent(PlayerOperatorCommandsComponent);
Player.registerComponent(PlayerTeleportComponent);
Player.registerComponent(PlayerInvulnerableComponent);
Player.registerComponent(PlayerFlyingComponent);
Player.registerComponent(PlayerMayFlyComponent);
Player.registerComponent(PlayerInstantBuildComponent);
Player.registerComponent(PlayerLightningComponent);
Player.registerComponent(PlayerFlySpeedComponent);
Player.registerComponent(PlayerWalkSpeedComponent);
Player.registerComponent(PlayerMutedComponent);
Player.registerComponent(PlayerWorldBuilderComponent);
Player.registerComponent(PlayerNoClipComponent);
Player.registerComponent(PlayerPrivilegedBuilderComponent);
Player.registerComponent(PlayerCountComponent);
