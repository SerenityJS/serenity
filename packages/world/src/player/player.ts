import {
	AbilityIndex,
	AbilityLayerType,
	ActorEventIds,
	ActorEventPacket,
	type BlockCoordinates,
	ChangeDimensionPacket,
	ContainerName,
	Gamemode,
	LevelSoundEvent,
	LevelSoundEventPacket,
	MoveMode,
	MovePlayerPacket,
	PermissionLevel,
	PlayStatus,
	PlayStatusPacket,
	RespawnPacket,
	RespawnState,
	SerializedSkin,
	SetPlayerGameTypePacket,
	TeleportCause,
	TextPacket,
	TextPacketType,
	TransferPacket,
	UpdateAbilitiesPacket,
	Vector3f,
	AbilitySet,
	type EffectType,
	OnScreenTextureAnimationPacket,
	ToastRequestPacket
} from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { Entity } from "../entity";
import { PlayerComponent, EntityComponent } from "../components";
import { EntitySpawnedSignal, PlayerMissSwingSignal } from "../events";

import { PlayerStatus } from "./status";
import { Device } from "./device";

import type { ItemStack } from "../item";
import type { PlayerOptions } from "./options";
import type { Container } from "../container";
import type { Dimension } from "../world";
import type { PlayerComponents } from "../types/components";
import type { NetworkSession } from "@serenityjs/network";

/**
 * Represents a player in a Dimension instance that is connected to the server, and can interact with the world. Creating a new Player instance should be handled by the server instead of Plugins. This class is responsible for handling player-specific logic, such as sending packets, handling player movement, and managing player data. Player instances requires a NetworkSession instance to communicate with the player, and data from the player's login tokens.
 */
class Player extends Entity {
	/**
	 * The player's network session.
	 */
	public readonly session: NetworkSession;

	/**
	 * The player's username.
	 */
	public readonly username: string;

	/**
	 * The player's Xbox Live User ID.
	 */
	public readonly xuid: string;

	/**
	 * The player's Universally Unique Identifier.
	 */
	public readonly uuid: string;

	/**
	 * The player's abilities.
	 */
	public readonly abilities = new Map<AbilityIndex, boolean>();

	/**
	 * The player's skin.
	 */
	public readonly skin: SerializedSkin;

	/**
	 * The player's device information.
	 */
	public readonly device: Device;

	/**
	 * The current status of the player's connection.
	 */
	public status: PlayerStatus = PlayerStatus.Connecting;

	/**
	 * The player's permission level.
	 */
	public permission: PermissionLevel;

	/**
	 * The gamemode of the player.
	 */
	public gamemode = Gamemode.Survival;

	/**
	 * The player's current network latency.
	 */
	public ping = 0;

	/**
	 * The target block the player is currently mining.
	 */
	public target: BlockCoordinates | null = null;

	/**
	 * The player spawn position
	 */
	public spawnPosition: BlockCoordinates = this.dimension.spawn;

	/**
	 * @readonly
	 * The currently opened container visible to the player.
	 */
	public openedContainer: Container | null = null;

	/**
	 * @readonly
	 * The ItemStack the player is currently using.
	 */
	public usingItem: ItemStack | null = null;

	/**
	 * @readonly
	 * The latest start item use tick
	 */
	public startUsingTick: bigint = -1n;

	/**
	 * @readonly
	 * If the player is sneaking.
	 */
	public isSneaking = false;

	/**
	 * @readonly
	 * If the player is sprinting.
	 */
	public isSprinting = false;

	/**
	 * @readonly
	 * If the player is flying.
	 */
	public isFlying = false;

	public constructor(dimension: Dimension, options: PlayerOptions) {
		super(EntityIdentifier.Player, dimension);
		this.session = options.session;
		this.username = options.tokens.identityData.displayName;
		this.xuid = options.tokens.identityData.XUID;
		this.uuid = options.tokens.identityData.identity;
		this.permission = options.permission;
		this.skin = SerializedSkin.from(options.tokens.clientData);
		this.device = new Device(options.tokens.clientData);

		// Register the type components to the entity.
		for (const component of EntityComponent.registry.get(
			this.type.identifier
		) ?? [])
			new component(this, component.identifier);

		// Register the type components to the player.
		for (const component of PlayerComponent.registry.get(
			this.type.identifier
		) ?? [])
			new component(this, component.identifier);
	}

	/**
	 * Gets the player's gamemode.
	 * @returns The gamemode of the player.
	 */
	public getGamemode(): Gamemode {
		return this.gamemode;
	}

	/**
	 * Sets the gamemode of the player.
	 * @param gamemode The gamemode to set.
	 */
	public setGamemode(gamemode: Gamemode): void {
		// Get the previous gamemode of the player
		const previous = this.gamemode;

		// Set the gamemode of the player
		this.gamemode = gamemode;

		// Trigger the onGamemodeChange method fof all applicable components
		for (const [, component] of this.components) {
			// Check if the component is not a PlayerComponent
			if (!(component instanceof PlayerComponent)) continue;

			// Call the onGamemodeChange method of the component
			component.onGamemodeChange?.(previous, gamemode);
		}

		// Create a new SetPlayerGameTypePacket
		const packet = new SetPlayerGameTypePacket();
		packet.gamemode = gamemode;

		// Send the packet to the player
		this.session.send(packet);

		// Check if the player is in creative mode
		if (gamemode === Gamemode.Creative) {
			this.abilities.set(AbilityIndex.MayFly, true);
		}
	}

	/**
	 * The player experience level
	 */
	public get level(): number {
		if (!this.hasComponent("minecraft:player.level")) return 0;
		const experienceComponent = this.getComponent("minecraft:player.level");

		return experienceComponent.level;
	}

	public set level(experienceLevel: number) {
		if (!this.hasComponent("minecraft:player.level")) return;
		const experienceComponent = this.getComponent("minecraft:player.level");
		experienceComponent.level = experienceLevel;
	}

	/**
	 * Syncs the player instance.
	 */
	public sync(): void {
		// Sync the entity based properties
		super.sync();

		// Sync the player's abilities
		this.updateAbilities();

		const inventory = this.getComponent("minecraft:inventory");
		inventory.container.sync(this);

		// Get the commands that are available to the player
		const available = this.dimension.world.commands.serialize();

		// Filter out the commands that are not applicable to the player
		const filtered = available.commands.filter(
			(command) => command.permissionLevel <= this.permission
		);

		// Update the commands of the player
		available.commands = filtered;

		// Send the commands & playerList to the player
		this.session.sendImmediate(available);
	}

	/**
	 * Checks if the player is an operator.
	 * @returns If the player is an operator.
	 */
	public isOp(): boolean {
		return this.permission === PermissionLevel.Operator;
	}

	/**
	 * Spawns the player in the world.
	 * @param player The player to spawn the player to.
	 */
	public spawn(): void {
		// Create a new EntitySpawnedSignal
		const signal = new EntitySpawnedSignal(this, this.dimension);
		const value = signal.emit();

		// Check if the signal was cancelled
		if (!value) return this.despawn();

		// Set the player's status
		this.status = PlayerStatus.Spawned;

		// Add the player to the dimension
		this.dimension.entities.set(this.unique, this);

		// Trigger the onSpawn method of all applicable components
		for (const component of this.getComponents()) component.onSpawn?.();

		// Sync the players data
		return this.sync();
	}

	/**
	 * Despawns the player from the world.
	 * @param player The player to despawn the player from.
	 */
	public respawn(): void {
		// Create a new RespawnPacket
		const respawn = new RespawnPacket();

		// Get the spawn position of the dimension
		const { x, y, z } = this.spawnPosition;

		// Set the packet properties
		respawn.position = this.position;
		respawn.runtimeEntityId = this.runtime;
		respawn.state = RespawnState.ClientReadyToSpawn;

		// Create a new PlayStatusPacket
		const ready = new PlayStatusPacket();

		// Set the packet properties
		ready.status = PlayStatus.PlayerSpawn;

		// Send the packets to the player
		this.session.send(respawn, ready);

		// Reset the players health & chunks
		this.getComponent("minecraft:health").resetToDefaultValue();

		// Add the player to the dimension
		this.spawn();

		// Teleport the player to the spawn position
		this.teleport(new Vector3f(x, y, z));

		// Set the player as alive
		this.isAlive = true;
	}

	public kill(): void {
		this.addExperience(-this.getTotalExperience());
		if (this.hasComponent("minecraft:player.hunger")) {
			const hunger = this.getComponent("minecraft:player.hunger");
			const exhaustion = this.getComponent("minecraft:player.exhaustion");
			const saturation = this.getComponent("minecraft:player.saturation");

			hunger.resetToDefaultValue();
			exhaustion.resetToDefaultValue();
			saturation.resetToDefaultValue();
		}

		super.kill();
	}

	/**
	 * Querys if the player is hungry
	 * @returns The player is hungry
	 */

	public isHungry(): boolean {
		if (!this.hasComponent("minecraft:player.hunger")) return false;
		const hungerComponent = this.getComponent("minecraft:player.hunger");
		return hungerComponent.isHungry;
	}

	/**
	 * Exhausts the player decreasing food over time
	 * @param amount The exhaustion amount
	 */
	public exhaust(amount: number): void {
		if (!this.hasComponent("minecraft:player.hunger")) return;
		const hungerComponent = this.getComponent("minecraft:player.hunger");

		hungerComponent.exhaust(amount);
	}

	/**
	 * Despawns the player from the world.
	 * @param player The player to despawn the player from.
	 */
	public hasComponent<T extends keyof PlayerComponents>(
		identifier: T
	): boolean {
		return this.components.has(identifier) as boolean;
	}

	/**
	 * Gets a component from the player.
	 * @param component The component to get.
	 * @returns The component that was found.
	 */
	public getComponent<T extends keyof PlayerComponents>(
		identifier: T
	): PlayerComponents[T] {
		return this.components.get(identifier) as PlayerComponents[T];
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
	public removeComponent<T extends keyof PlayerComponents>(
		identifier: T
	): void {
		this.components.delete(identifier);
	}

	/**
	 * Sends a message to the player.
	 * @param message The message to send.
	 */
	public sendMessage(message: string): void {
		// Construct the text packet.
		const packet = new TextPacket();

		// Assign the packet data.
		packet.type = TextPacketType.Raw;
		packet.needsTranslation = false;
		packet.source = null;
		packet.message = message;
		packet.parameters = null;
		packet.xuid = "";
		packet.platformChatId = "";
		packet.filtered = message;

		// Send the packet.
		this.session.send(packet);
	}

	/**
	 * Sends a toast to the player.
	 * @param title The title of the toast.
	 * @param message The message of the toast.
	 */
	public sendToast(title: string, message: string): void {
		// Create a new ToastRequestPacket
		const packet = new ToastRequestPacket();
		packet.title = title;
		packet.message = message;

		// Send the packet to the player
		this.session.send(packet);
	}

	/**
	 * Teleports the player to a specific position.
	 * @param position The position to teleport the player to.
	 * @param dimension The dimension to teleport the player to.
	 */
	public teleport(position: Vector3f, dimension?: Dimension): void {
		// Set the player's position
		this.position.x = position.x;
		this.position.y = position.y;
		this.position.z = position.z;

		// Check if the dimension is provided
		if (dimension) {
			// Despawn the player from the current dimension
			this.despawn();

			// Check if the dimension types are different
			// This allows for a faster dimension change if the types are the same
			if (this.dimension.type !== dimension.type) {
				// Create a new ChangeDimensionPacket
				const packet = new ChangeDimensionPacket();
				packet.dimension = dimension.type;
				packet.position = position;
				packet.respawn = true;

				// Send the packet to the player
				this.session.sendImmediate(packet);
			}

			// Set the new dimension
			this.dimension = dimension;

			// Check if the player has the chunk rendering component
			if (this.hasComponent("minecraft:chunk_rendering")) {
				// Get the chunk rendering component
				const component = this.getComponent("minecraft:chunk_rendering");

				// Clear the chunks
				component.chunks.clear();
			}

			// Spawn the player in the new dimension
			this.spawn();

			// Update the player's position
			return this.teleport(position);
		} else {
			// Create a new MovePlayerPacket
			const packet = new MovePlayerPacket();

			// Set the packet properties
			packet.runtimeId = this.runtime;
			packet.position = position;
			packet.pitch = this.rotation.pitch;
			packet.yaw = this.rotation.yaw;
			packet.headYaw = this.rotation.headYaw;
			packet.mode = MoveMode.Teleport;
			packet.onGround = false; // TODO: Added ground check
			packet.riddenRuntimeId = 0n;
			packet.cause = new TeleportCause(4, 0);
			packet.tick = this.dimension.world.currentTick;

			// Send the packet to the player
			this.session.send(packet);
		}
	}

	/**
	 * Transfers the player to a different server.
	 * @param address The address to transfer the player to.
	 * @param port The port to transfer the player to.
	 */
	public transfer(address: string, port: number): void {
		// Create a new TransferPacket
		const packet = new TransferPacket();

		// Set the packet properties
		packet.address = address;
		packet.port = port;

		// Send the packet to the player
		this.session.send(packet);
	}

	/**
	 * Gets the total amount of experience the player has
	 * @returns The amount of experience
	 */

	public getTotalExperience(): number {
		if (!this.hasComponent("minecraft:player.experience")) return 0;
		const experienceComponent = this.getComponent(
			"minecraft:player.experience"
		);
		const experienceLevelComponent = this.getComponent(
			"minecraft:player.level"
		);

		return (
			experienceComponent.experience + experienceLevelComponent.toExperience()
		);
	}

	/**
	 * Gives the needed experience to the next level
	 * @param level The level to get the needed experience
	 * @returns The needed experience
	 */
	public getNextLevelXp(level: number = this.level): number {
		let neededExperience: number = 0;

		switch (true) {
			case level <= 15: {
				neededExperience = 2 * level + 7;
				break;
			}
			case level > 15 && level <= 30: {
				neededExperience = 5 * level - 38;
				break;
			}
			case level > 30: {
				neededExperience = 9 * level - 158;
				break;
			}
		}
		return neededExperience;
	}

	/**
	 * Adds or removes experience of the player
	 * @param experienceAmount The experience amount to be added / removed, negative values removes experience
	 */
	public addExperience(experienceAmount: number): void {
		if (!this.hasComponent("minecraft:player.experience")) return;
		const experienceComponent = this.getComponent(
			"minecraft:player.experience"
		);

		if (experienceAmount > 0) {
			experienceComponent.addExperience(experienceAmount);
			return;
		}
		experienceComponent.removeExperience(Math.abs(experienceAmount));
	}

	/**
	 * Clears the crafting input of the player.
	 * @note This method is dependant on the player having a `minecraft:crafting_input` component, if not will result in an `error`.
	 * @param player The player to clear the crafting input of.
	 */
	public clearCraftingInput(): void {
		// Check if the player has the crafting input component
		if (!this.hasComponent("minecraft:crafting_input"))
			throw new Error("The player does not have a crafting input.");

		// Get the crafting input component
		const craftingInput = this.getComponent("minecraft:crafting_input");

		// Clear the crafting input
		for (const [slot] of craftingInput.container.storage.entries()) {
			// Clear the slot
			craftingInput.container.clearSlot(slot);
		}
	}

	/**
	 * Get a container from the player.
	 * @param name The name of the container to get.
	 */
	public getContainer(name: ContainerName): Container | null {
		// Check if the super instance will fetch the container
		const container = super.getContainer(name);

		// Check if the super instance found the container
		if (container !== null) return container;

		// Switch the container name
		switch (name) {
			default: {
				// Return the opened container if it exists
				return this.openedContainer;
			}

			case ContainerName.CraftingInput: {
				// Check if the player has the crafting input component
				if (!this.hasComponent("minecraft:crafting_input"))
					throw new Error("The player does not have a crafting input.");

				// Get the crafting input component
				const craftingInput = this.getComponent("minecraft:crafting_input");

				// Return the crafting input container
				return craftingInput.container;
			}

			case ContainerName.Cursor: {
				// Check if the player has the cursor component
				if (!this.hasComponent("minecraft:cursor"))
					throw new Error("The player does not have a cursor.");

				// Get the cursor component
				const cursor = this.getComponent("minecraft:cursor");

				// Return the cursor container
				return cursor.container;
			}
		}
	}

	/**
	 * Retrieves the duration for which the player has been using an item.
	 *
	 * @returns  The duration in ticks that the player has been using the item.
	 *           Returns 0 if the player is not currently using an item.
	 */
	public getItemUseDuration(): bigint {
		return this.startUsingTick == -1n
			? 0n
			: this.getWorld().currentTick - this.startUsingTick;
	}

	/**
	 * Checks if the player has the ability.
	 * @param ability The ability to check.
	 * @returns If the player has the ability.
	 */
	public hasAbility(ability: AbilityIndex): boolean {
		return this.abilities.has(ability);
	}

	/**
	 * Gets the value of the ability of the player.
	 * @param ability The ability to get.
	 * @returns The value of the ability.
	 */
	public getAbility(ability: AbilityIndex): boolean {
		return this.abilities.get(ability) ?? false;
	}

	/**
	 * Sets the ability of the player.
	 * @param ability The ability to set.
	 * @param value The value to set the ability to.
	 */
	public setAbility(ability: AbilityIndex, value: boolean): void {
		// Set the ability in the abilities map
		this.abilities.set(ability, value);

		// Update the player's abilities
		this.updateAbilities();
	}

	/**
	 * Updates the player's abilities to the dimension.
	 */
	public updateAbilities(): void {
		// Create a new UpdateAbilitiesPacket
		const packet = new UpdateAbilitiesPacket();
		packet.permissionLevel = this.permission;
		packet.commandPersmissionLevel = this.permission === 2 ? 1 : 0;
		packet.entityUniqueId = this.unique;
		packet.abilities = [
			{
				type: AbilityLayerType.Base,
				abilities: [...this.abilities.entries()].map(
					([ability, value]) => new AbilitySet(ability, value)
				),
				walkSpeed: 0.1,
				flySpeed: 0.05
			}
		];

		// Send the packet to the player
		this.dimension.broadcast(packet);
	}

	public executeMissSwing(): void {
		// Create a new PlayerMissSwingSignal
		const signal = new PlayerMissSwingSignal(this);
		const value = signal.emit();

		// Check if the signal was cancelled
		if (!value) return;

		// Create a new LevelSoundEvent
		const levelEvent = new LevelSoundEventPacket();

		// Set the packet properties
		levelEvent.event = LevelSoundEvent.AttackNoDamage;
		levelEvent.position = this.position;
		levelEvent.data = -1;
		levelEvent.actorIdentifier = EntityIdentifier.Player;
		levelEvent.isBabyMob = false;
		levelEvent.isGlobal = false;

		// Create a new ActorEvent
		const actorEvent = new ActorEventPacket();

		// Set the packet properties
		actorEvent.actorRuntimeId = this.unique;
		actorEvent.eventId = ActorEventIds.ARM_SWING;
		actorEvent.eventData = 0;

		// Send packet to player
		this.session.send(levelEvent, actorEvent);
	}

	/**
	 * Plays an effect animation to the player.
	 * @param effect The effect to play.
	 */
	public playEffectAnimation(effect: EffectType): void {
		// Create a new OnScreenTextureAnimationPacket
		const packet = new OnScreenTextureAnimationPacket();
		packet.effectId = effect;

		// Send the packet to the player
		this.session.send(packet);
	}
}

export { Player };
