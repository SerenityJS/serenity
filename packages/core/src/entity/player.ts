import { Connection } from "@serenityjs/raknet";
import {
  AbilityIndex,
  BlockPosition,
  ChangeDimensionPacket,
  ContainerName,
  CraftingDataEntryType,
  CraftingDataPacket,
  CreativeContentPacket,
  CreativeGroup,
  CreativeItem,
  DataPacket,
  DefaultAbilityValues,
  DisconnectMessage,
  DisconnectPacket,
  DisconnectReason,
  Gamemode,
  MoveMode,
  MovePlayerPacket,
  PlayerStartItemCooldownPacket,
  PlaySoundPacket,
  SerializedSkin,
  SetActorMotionPacket,
  ShowProfilePacket,
  StopSoundPacket,
  TeleportCause,
  TextPacket,
  TextPacketType,
  TransferPacket,
  UpdatePlayerGameTypePacket,
  Vector3f
} from "@serenityjs/protocol";
import { CompoundTag } from "@serenityjs/nbt";

import {
  EntitySpawnOptions,
  PlayerProperties,
  PlaySoundOptions
} from "../types";
import { Dimension, World } from "../world";
import { EntityIdentifier } from "../enums";
import { Container } from "../container";
import {
  ItemStackBundleTrait,
  ItemStack,
  ItemType,
  ItemTypeCooldownComponent,
  ShapelessCraftingRecipe,
  ShapedCraftingRecipe
} from "../item";
import {
  EntityDimensionChangeSignal,
  PlayerGamemodeChangeSignal
} from "../events";
import { FormParticipant } from "../ui";
import { PermissionMember } from "../permissions";
import { DefaultPlayerProperties } from "../constants";

import { Entity } from "./entity";
import { AbilityMap } from "./maps";
import {
  EntityRidingTrait,
  EntityInventoryTrait,
  PlayerChunkRenderingTrait,
  PlayerCraftingInputTrait,
  PlayerCursorTrait,
  PlayerTrait,
  PlayerLevelingTrait
} from "./traits";
import { ScreenDisplay } from "./screen-display";
import { ClientSystemInfo } from "./system-info";
import { PlayerLevelStorage } from "./storage";

class Player extends Entity {
  /**
   * The current raknet connection of the player
   */
  public readonly connection: Connection;

  /**
   * The username of the player
   */
  public readonly username: string;

  /**
   * The xbox user id of the player
   */
  public readonly xuid: string;

  /**
   * The uuid of the player
   */
  public readonly uuid: string;

  /**
   * The traits that are attached to the player
   */
  public readonly traits = new Map<string, PlayerTrait>();

  /**
   * The current abilities of the player, and whether they are enabled
   */
  public readonly abilities = new AbilityMap(this);

  /**
   * The player's device information.
   */
  public readonly clientSystemInfo: ClientSystemInfo;

  /**
   * The skin of the player
   */
  public readonly skin: SerializedSkin;

  /**
   * The screen display for the player.
   * This is used to hide and show elements on the player's screen.
   * This is also used to send title and subtitle messages to the player.
   */
  public readonly onScreenDisplay = new ScreenDisplay(this);

  /**
   * The permission level of the player.
   */
  public readonly permissions: PermissionMember;

  /**
   * The pending forms of the player
   */
  public pendingForms: Map<number, FormParticipant<never>> = new Map();

  /**
   * The container that the player is currently viewing.
   */
  public openedContainer: Container | null = null;

  /**
   * The target block that the player is currently breaking.
   */
  public blockTarget: BlockPosition | null = null;

  /**
   * The target item that the player is currently using.
   */
  public itemTarget: ItemStack | null = null;

  /**
   * The target entity that the player is currently looking at.
   */
  public entityTarget: Entity | null = null;

  /**
   * The gamemode of the player.
   */
  public get gamemode(): Gamemode {
    // Check if the player has the gamemode component
    if (!this.dynamicProperties.has("gamemode"))
      // Set the default gamemode for the player
      this.dynamicProperties.set("gamemode", this.world.getDefaultGamemode());

    // Return the gamemode of the player
    return this.dynamicProperties.get("gamemode") as Gamemode;
  }

  /**
   * The gamemode of the player.
   */
  public set gamemode(value: Gamemode) {
    const signal = new PlayerGamemodeChangeSignal(this, this.gamemode, value);

    if (!signal.emit()) return;

    // Set the gamemode of the player
    this.dynamicProperties.set("gamemode", value);

    // Call the onGamemodeChange event for the player
    for (const trait of this.traits.values()) trait.onGamemodeChange?.(value);

    // Enable or disable the ability to fly based on the gamemode
    switch (value) {
      case Gamemode.Survival:
      case Gamemode.Adventure: {
        // Disable the ability to fly
        this.abilities.set(AbilityIndex.MayFly, false);
        break;
      }

      case Gamemode.Creative:
      case Gamemode.Spectator: {
        // Enable the ability to fly
        this.abilities.set(AbilityIndex.MayFly, true);
        break;
      }
    }

    // Create a new UpdatePlayerGameTypePacket
    const packet = new UpdatePlayerGameTypePacket();
    packet.gamemode = value;
    packet.uniqueActorId = this.uniqueId;
    packet.inputTick = this.inputInfo.tick;

    // Broadcast the packet to the dimension
    this.dimension.broadcast(packet);
  }

  /**
   * Whether the player has operator permissions.
   */
  public get isOp(): boolean {
    return this.permissions.has("serenity.operator");
  }

  /**
   * Whether the player has operator permissions.
   */
  public set isOp(value: boolean) {
    // Add or remove the operator permission
    if (value) this.permissions.add("serenity.operator");
    else this.permissions.remove("serenity.operator");

    // Update the player's abilities
    this.abilities.set(AbilityIndex.OperatorCommands, value);
    this.abilities.set(AbilityIndex.Teleport, value);
  }

  /**
   * Create a new player instance within a dimension.
   * @param dimension The dimension the player will spawn in.
   * @param connection The raknet connection of the player.
   * @param properties The additional properties of the player.
   */
  public constructor(
    dimension: Dimension,
    connection: Connection,
    properties?: Partial<PlayerProperties>
  ) {
    super(dimension, EntityIdentifier.Player, properties);

    // Assign the connection to the player
    this.connection = connection;

    // Spread the default properties and the provided properties
    const props = { ...DefaultPlayerProperties, ...properties };

    // Assign the properties to the player
    this.username = props.username;
    this.xuid = props.xuid;
    this.uuid = props.uuid;
    this.clientSystemInfo = props.clientSystemInfo;
    this.skin = props.skin;
    this.alwaysShowNameTag = true;

    // Get the player's permission level from the permissions map
    this.permissions = this.serenity.getPermissionMember(this);
    this.permissions.player = this; // Set the player instance to the permission member

    // If the player properties contains an entry, load it
    if (properties?.storage)
      this.loadLevelStorage(dimension.world, properties.storage);

    // Add the traits of the player type
    for (const [, trait] of this.type.traits) this.addTrait(trait);

    // Add the default abilities to the player
    for (const [ability, value] of Object.entries(DefaultAbilityValues)) {
      if (!this.abilities.has(+ability as AbilityIndex))
        this.abilities.set(+ability as AbilityIndex, value);
    }

    // Set the ability for operator commands
    this.abilities.operatorCommands = this.isOp;
  }

  /**
   * Send packets to the player (Normal Priority)
   * @param packets The packets to send to the player
   */
  public send(...packets: Array<DataPacket>): void {
    // Send the packets to the player
    this.serenity.network.sendNormal(this.connection, ...packets);
  }

  /**
   * Send packets to the player (Immediate Priority)
   * @param packets The packets to send to the player
   */
  public sendImmediate(...packets: Array<DataPacket>): void {
    // Send the packets to the player
    this.serenity.network.sendImmediate(this.connection, ...packets);
  }

  /**
   * Disconnect the player from the server
   * @param reason The reason for the disconnection
   * @param code The disconnect reason code
   * @param hideDisconnectScreen Whether to hide the disconnect screen
   */
  public disconnect(
    reason: string,
    code?: DisconnectReason,
    hideDisconnectScreen?: false
  ): void {
    // Create a new disconnect packet with the specified reason
    const packet = new DisconnectPacket();
    packet.message = new DisconnectMessage(reason, reason);
    packet.reason = code ?? DisconnectReason.Kicked;
    packet.hideDisconnectScreen = hideDisconnectScreen ?? false;

    // Send the packet to the player
    this.sendImmediate(packet);

    // Despawn the player from the world
    this.despawn({ disconnected: true, hasDied: false });
  }

  /**
   * Check if the player has a specific permission.
   * @param permission The permission to check.
   * @returns True if the player has the permission, false otherwise.
   */
  public hasPermission(permission: string): boolean {
    // Check if the player has the permission
    return this.permissions.has(permission);
  }

  /**
   * Add a permission to the player.
   * @param permission The permission to add.
   */
  public addPermission(permission: string): void {
    // Add the permission to the player
    this.permissions.add(permission);
  }

  /**
   * Remove a permission from the player.
   * @param permission The permission to remove.
   */
  public removePermission(permission: string): void {
    // Remove the permission from the player
    this.permissions.remove(permission);
  }

  /**
   * Get the permissions of the player.
   * @returns An array of permissions that the player has.
   */
  public getPermissions(): Array<string> {
    // Return the permissions of the player
    return this.permissions.permissions;
  }

  /**
   * Get the round-trip ping of the player in milliseconds.
   * @returns The ping of the player in milliseconds.
   */
  public getPing(): number {
    return this.connection.ping;
  }

  /**
   * Sends a message to the player
   * @param message The message that will be sent.
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
    packet.filtered = "";

    // Send the packet.
    this.send(packet);
  }

  /**
   * Set the motion of the player.
   * @param vector The motion vector to set.
   */
  public setMotion(vector?: Vector3f): void {
    // Call the super method to set the motion
    super.setMotion(vector);

    // Create a new SetActorMotionPacket
    const packet = new SetActorMotionPacket();

    // Set the properties of the packet
    packet.runtimeId = this.runtimeId;
    packet.motion = this.velocity;
    packet.inputTick = this.inputInfo.tick;

    // Broadcast the packet to the dimension
    this.dimension.broadcast(packet);
  }

  /**
   * Get a container from the player.
   * @param name The name of the container to get.
   */
  public getContainer(
    name: ContainerName,
    dynamicId?: number
  ): Container | null {
    // Check if the super instance will fetch the container
    const container = super.getContainer(name, dynamicId);

    // Check if the container is null and the name is dynamic
    if (container === null && name === ContainerName.Dynamic) {
      // Check if the player has the cursor trait
      if (!this.hasTrait(PlayerCursorTrait))
        throw new Error("The player does not have a cursor trait.");

      // Get the cursor trait
      const { container } = this.getTrait(PlayerCursorTrait);

      // Iterate over the items in the container
      for (const item of container.storage) {
        // Check if the item is valid
        if (!item) continue;

        // Check if the item has a ItemStackBundleTrait
        if (item.hasTrait(ItemStackBundleTrait)) {
          // Get the bundle trait
          const _bundle = item.getTrait(ItemStackBundleTrait);

          // Check if the bundle has the dynamic id
          // if (bundle.dynamicId === dynamicId) return bundle.container;
        }
      }
    }

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
        if (!this.hasTrait(PlayerCraftingInputTrait))
          throw new Error("The player does not have a crafting input.");

        // Get the crafting input component
        const craftingInput = this.getTrait(PlayerCraftingInputTrait);

        // Return the crafting input container
        return craftingInput.container;
      }

      case ContainerName.Cursor: {
        // Check if the player has the cursor trait
        if (!this.hasTrait(PlayerCursorTrait))
          throw new Error("The player does not have a cursor trait.");

        // Get the cursor trait
        const cursor = this.getTrait(PlayerCursorTrait);

        // Return the cursor container
        return cursor.container;
      }
    }
  }

  /**
   * Spawn the player in the dimension
   */
  public spawn(options?: Partial<EntitySpawnOptions>): this {
    // Call the super method to spawn the player
    super.spawn(options);

    // Update the abilities of the player
    this.abilities.update();

    // Create a new CreativeContentPacket, and map the creative content to the packet
    const content = new CreativeContentPacket();

    // Prepare an array to store the creative items
    content.items = [];

    // Map the creative content to the packet
    content.groups = [...this.world.itemPalette.creativeGroups].map(
      ([index, group]) => {
        // Iterate over the items in the group
        for (const { descriptor } of group.items) {
          // Get the next index for the item
          const itemIndex = content.items.length;

          // Create and push the creative item to the packet
          content.items.push(new CreativeItem(itemIndex, descriptor, index));
        }

        // Get the icon item type from the map
        const icon = ItemType.toNetworkInstance(group.icon);

        // Create a new creative group
        return new CreativeGroup(group.category, group.identifier, icon);
      }
    );

    // Create a new CraftingDataPacket, and map the crafting recipes to the packet
    const recipes = new CraftingDataPacket();

    // Assign the recipe properties
    recipes.clearRecipes = true;
    recipes.containers = [];
    recipes.crafting = [];
    recipes.materitalReducers = [];
    recipes.potions = [];

    // Iterate over the recipes in the item palette
    for (const [, recipe] of this.world.itemPalette.recipes) {
      // Check if the recipe is a ShapedCraftingRecipe
      if (recipe instanceof ShapelessCraftingRecipe) {
        // Convert the recipe to a network format
        const shapeless = ShapelessCraftingRecipe.toNetwork(recipe);

        // Iterate over the shapeless recipes and add them to the packet
        for (const recipe of shapeless) {
          // Add the recipe to the crafting data packet
          recipes.crafting.push({
            type: CraftingDataEntryType.ShapelessRecipe,
            recipe
          });
        }
      } else if (recipe instanceof ShapedCraftingRecipe) {
        // Convert the recipe to a network format
        const shaped = ShapedCraftingRecipe.toNetwork(recipe);

        // Iterate over the shaped recipes and add them to the packet
        for (const recipe of shaped) {
          // Add the recipe to the crafting data packet
          recipes.crafting.push({
            type: CraftingDataEntryType.ShapedRecipe,
            recipe
          });
        }
      }
    }

    // Send the available creative content & crafting data to the player
    this.send(content, recipes);

    // Teleport the player to their position
    // This fixes an issue where the player is sometimes stuck in the ground
    this.teleport(this.position, this.dimension);

    // Return the player
    return this;
  }

  /**
   * Transfers the player to a different server.
   * @param address The address to transfer the player to.
   * @param port The port to transfer the player to.
   * @param reload If the world should be reloaded.
   */
  public transfer(address: string, port: number, reload = false): void {
    // Create a new TransferPacket
    const packet = new TransferPacket();

    // Set the packet properties
    packet.address = address;
    packet.port = port;
    packet.reloadWorld = reload;

    // Send the packet to the player
    this.send(packet);
  }

  /**
   * Shows the player profile of another player.
   * @param xuid The xuid of the player to show the profile of; default is this player.
   */
  public showProfile(xuid?: Player | string): void {
    // Create a new ShowProfilePacket
    const packet = new ShowProfilePacket();

    // Assign the xuid to the packet
    if (!xuid) packet.xuid = this.xuid;
    else if (xuid instanceof Player) packet.xuid = xuid.xuid;
    else packet.xuid = xuid;

    // Send the packet to the player
    this.send(packet);
  }

  /**
   * Teleports the player to a specific position.
   * @param position The position to teleport the player to.
   * @param dimension The dimension to teleport the player to.
   */
  public teleport(position: Vector3f, dimension?: Dimension): void {
    // Call the parent method to teleport the player
    super.teleport(position, dimension);

    // Prepare the ridden runtime id
    let riddenRuntimeId = 0n;

    // Check if the player is riding another entity
    if (this.getTrait(EntityRidingTrait)) {
      // Get the riding trait
      const riding = this.getTrait(EntityRidingTrait);

      // Get the runtime id of the entity being ridden
      riddenRuntimeId = riding.entityRidingOn.runtimeId;
    }

    // Check if the dimension is not provided
    if (!dimension) {
      // Create a new MovePlayerPacket
      const packet = new MovePlayerPacket();

      // Set the packet properties
      packet.runtimeId = this.runtimeId;
      packet.position = position;
      packet.pitch = this.rotation.pitch;
      packet.yaw = this.rotation.yaw;
      packet.headYaw = this.rotation.headYaw;
      packet.mode = MoveMode.Teleport;
      packet.onGround = this.onGround;
      packet.riddenRuntimeId = riddenRuntimeId;
      packet.cause = new TeleportCause(4, 0);
      packet.inputTick = this.inputInfo.tick;

      // Adjust the y position to account for the hitbox height
      packet.position.y += this.getCollisionHeight();

      // Send the packet to the player
      this.send(packet);
    }
  }

  /**
   * Changes the dimension of the player.
   * @param dimension The dimension to change the player to.
   */
  public changeDimension(dimension: Dimension): void {
    // Check if the dimension is the same as the current dimension
    if (this.dimension === dimension) return;

    // Despawn the player from the current dimension
    this.despawn({ changedDimensions: true });

    // Create a new EntityDimensionChangeSignal
    new EntityDimensionChangeSignal(this, this.dimension, dimension).emit();

    // Check if the dimension is the same as the current dimension
    if (this.dimension.type === dimension.type) {
      // Change the player's dimension
      this.dimension = dimension;

      // Check if the player has the chunk rendering trait
      if (!this.hasTrait(PlayerChunkRenderingTrait))
        return void this.spawn({ changedDimensions: true });

      // Get the chunk rendering trait
      const rendering = this.getTrait(PlayerChunkRenderingTrait);

      // Send the player the spawn chunks
      rendering.send(...rendering.next());

      // Spawn the player in the new dimension
      return void this.spawn({ changedDimensions: true });
    } else {
      // Change the player's dimension
      this.dimension = dimension;

      // Create a new ChangeDimensionPacket
      const change = new ChangeDimensionPacket();

      // Set the packet properties
      change.dimension = dimension.type;
      change.position = this.position;
      change.respawn = true;
      change.hasLoadingScreen = false;

      // Send the packet to the player
      this.sendImmediate(change);

      // Check if the player has the chunk rendering trait
      if (!this.hasTrait(PlayerChunkRenderingTrait))
        return void this.spawn({ changedDimensions: true });

      // Spawn the player in the new dimension
      this.spawn({ changedDimensions: false, initialSpawn: false });

      // Get the chunk rendering trait
      const rendering = this.getTrait(PlayerChunkRenderingTrait);

      // Send the player the spawn chunks
      return void rendering.send(...rendering.next());
    }
  }

  /**
   * Plays a sound that player can only hear.
   * @param sound The name of the sound to play.
   * @param options The options for playing the sound.
   */
  public playSound(sound: string, options?: PlaySoundOptions): void {
    // Create a new PlaySoundPacket
    const packet = new PlaySoundPacket();

    // Get the position to play the sound at
    const position = BlockPosition.from(options?.position ?? this.position);

    // Set the packet properties
    packet.name = sound;
    packet.position = position.multiply(8); // Mojank...
    packet.volume = options?.volume ?? 1;
    packet.pitch = options?.pitch ?? 1;

    // Send the packet to the player
    this.send(packet);
  }

  /**
   * Stops a sound that is currently playing.
   * @param sound The name of the sound to stop; default is all sounds.
   */
  public stopSound(sound?: string): void {
    // Create a new StopSoundPacket
    const packet = new StopSoundPacket();

    // Set the packet properties
    packet.soundName = sound ?? "";
    packet.stopAllSounds = sound === undefined;
    packet.stopMusic = false;

    // Send the packet to the player
    this.send(packet);
  }

  /**
   * Get the spawn point of the player.
   * @returns The spawn point of the player.
   */
  public getSpawnPoint(): Vector3f {
    // Check if the player has the spawn point dynamic property
    if (!this.hasDynamicProperty("spawnPoint")) {
      // Get the spawn position of the dimension
      const { x, y, z } = this.dimension.spawnPosition;

      // Set the spawn point of the player
      this.setDynamicProperty<Array<number>>("spawnPoint", [x, y, z]);
    }

    // Get the spawn point of the player
    const position = this.getDynamicProperty("spawnPoint") as Array<number>;

    // Return the spawn point as a Vector3f
    return Vector3f.fromArray(position);
  }

  /**
   * Set the spawn point of the player.
   * @param position The position to set the spawn point to.
   */
  public setSpawnPoint(position: Vector3f): void {
    // Set the spawn point of the player
    this.setDynamicProperty("spawnPoint", [position.x, position.y, position.z]);
  }

  /**
   * Starts an item cooldown for a specific category.
   * @param category The category of the item cooldown.
   * @param duration The duration of the cooldown in ticks.
   */
  public startItemCooldown(category: string, duration: number): void {
    // Create a new PlayerStartItemCooldownPacket
    const packet = new PlayerStartItemCooldownPacket();
    packet.category = category;
    packet.duration = duration * 2;

    // Check if the player has the inventory trait
    if (this.hasTrait(EntityInventoryTrait)) {
      // Get the container from the inventory trait
      const { container } = this.getTrait(EntityInventoryTrait);

      // Iterate over the items in the container
      for (const item of container.storage) {
        // Check if the item is air or if it doesn't have a cooldown component
        if (!item || !item.components.hasComponent(ItemTypeCooldownComponent))
          continue;

        // Get the cooldown component of the item
        const cooldown = item.components.getCooldown();

        // Check if the cooldown category matches the provided category
        if (cooldown.getCategory() !== category) continue;

        // Start the cooldown on the item
        item.startCooldown(duration);
      }
    }

    // Send the packet to the player
    return this.send(packet);
  }

  /**
   * Get the current xp level of the player.
   * @returns The current level of the player.
   * @note This method is dependent on the `PlayerLevelingTrait` being added to the player.
   */
  public getLevel(): number {
    // Check if the player has the PlayerLevelingTrait
    if (this.hasTrait(PlayerLevelingTrait)) {
      // Return the level from the PlayerLevelingTrait
      return this.getTrait(PlayerLevelingTrait).getLevel();
    }

    // If the PlayerLevelingTrait is not present, return 0
    return 0;
  }

  /**
   * Set the current xp level of the player.
   * @param value The new level to set for the player.
   * @note This method is dependent on the `PlayerLevelingTrait` being added to the player.
   */
  public setLevel(value: number): void {
    // Check if the player has the PlayerLevelingTrait
    if (this.hasTrait(PlayerLevelingTrait)) {
      // Set the level in the PlayerLevelingTrait
      this.getTrait(PlayerLevelingTrait).setLevel(value);
    } else {
      // Add the PlayerLevelingTrait to the player
      this.addTrait(PlayerLevelingTrait).setLevel(value);
    }
  }

  /**
   * Add xp levels to the player.
   * @param value The number of levels to add to the player.
   * @returns The new level of the player after adding the specified value.
   * @note This method is dependent on the `PlayerLevelingTrait` being added to the player.
   */
  public addLevels(value: number): number {
    // Check if the player has the PlayerLevelingTrait
    if (this.hasTrait(PlayerLevelingTrait)) {
      // Get the PlayerLevelingTrait
      const leveling = this.getTrait(PlayerLevelingTrait);

      // Get the current level
      const currentLevel = leveling.getLevel();

      // Set the new level
      leveling.setLevel(currentLevel + value);

      // Return the new level
      return leveling.getLevel();
    } else {
      // Add the PlayerLevelingTrait to the player and set the level
      this.addTrait(PlayerLevelingTrait).setLevel(value);

      // Return the new level
      return value;
    }
  }

  /**
   * Get the current xp experience progress of the player.
   * @returns The current experience progress of the player.
   * @note This method is dependent on the `PlayerLevelingTrait` being added to the player.
   */
  public getExperience(): number {
    // Check if the player has the PlayerLevelingTrait
    if (this.hasTrait(PlayerLevelingTrait)) {
      // Return the experience from the PlayerLevelingTrait
      return this.getTrait(PlayerLevelingTrait).getExperience();
    }

    // If the PlayerLevelingTrait is not present, return 0
    return 0;
  }

  /**
   * Set the current xp experience progress of the player.
   * @param value The new experience progress to set for the player.
   * @note This method is dependent on the `PlayerLevelingTrait` being added to the player.
   */
  public setExperience(value: number): void {
    // Check if the player has the PlayerLevelingTrait
    if (this.hasTrait(PlayerLevelingTrait)) {
      // Set the experience in the PlayerLevelingTrait
      this.getTrait(PlayerLevelingTrait).setExperience(value);
    } else {
      // Add the PlayerLevelingTrait to the player
      this.addTrait(PlayerLevelingTrait).setExperience(value);
    }
  }

  /**
   * Add experience to the player.
   * @param value The amount of experience to add.
   * @returns The new experience progress of the player after adding the specified value.
   * @note This method is dependent on the `PlayerLevelingTrait` being added to the player.
   */
  public addExperience(value: number): number {
    // Check if the player has the PlayerLevelingTrait
    if (this.hasTrait(PlayerLevelingTrait)) {
      // Get the PlayerLevelingTrait
      const leveling = this.getTrait(PlayerLevelingTrait);

      // Get the current experience and level
      let currentXp = leveling.getExperience();
      currentXp += value;

      let currentLevel = leveling.getLevel();
      let xpForNextLevel = 0;

      if (currentLevel >= 31) {
        xpForNextLevel = 9 * currentLevel - 158;
      } else if (currentLevel >= 16) {
        xpForNextLevel = 5 * currentLevel - 38;
      } else {
        xpForNextLevel = 2 * currentLevel + 7;
      }

      while (currentXp >= xpForNextLevel) {
        currentXp -= xpForNextLevel;
        currentLevel++;

        if (currentLevel >= 31) {
          xpForNextLevel = 9 * currentLevel - 158;
        } else if (currentLevel >= 16) {
          xpForNextLevel = 5 * currentLevel - 38;
        } else {
          xpForNextLevel = 2 * currentLevel + 7;
        }
      }

      // Set the new level and experience progress
      leveling.setLevel(currentLevel);
      leveling.setExperienceProgress(
        xpForNextLevel > 0 ? currentXp / xpForNextLevel : 0
      );

      // Return the new experience points
      return currentXp;
    } else {
      // Add the PlayerLevelingTrait to the player
      const leveling = this.addTrait(PlayerLevelingTrait);

      // Set the experience in the PlayerLevelingTrait
      leveling.setExperience(value);

      // Return the new experience points
      return leveling.getExperience();
    }
  }

  /**
   * Remove experience from the player.
   * @param value The amount of experience to remove.
   * @returns The new experience progress of the player after adding the specified value.
   * @note This method is dependent on the `PlayerLevelingTrait` being added to the player.
   */
  public removeExperience(value: number): number {
    // Check if the player has the PlayerLevelingTrait
    if (this.hasTrait(PlayerLevelingTrait)) {
      // Get the PlayerLevelingTrait
      const leveling = this.getTrait(PlayerLevelingTrait);

      // Get the current experience and level
      let currentXp = leveling.getExperience();
      currentXp -= value;

      let currentLevel = leveling.getLevel();

      while (currentXp < 0) {
        currentLevel--;

        if (currentLevel < 0) {
          currentLevel = 0;
          currentXp = 0;
          break;
        }

        let xpForPreviousLevel = 0;
        if (currentLevel >= 31) {
          xpForPreviousLevel = 9 * currentLevel - 158;
        } else if (currentLevel >= 16) {
          xpForPreviousLevel = 5 * currentLevel - 38;
        } else {
          xpForPreviousLevel = 2 * currentLevel + 7;
        }

        currentXp += xpForPreviousLevel;
      }

      // Set the new level and experience progress
      leveling.setLevel(currentLevel);

      let xpForNextLevel = 0;
      if (currentLevel >= 31) {
        xpForNextLevel = 9 * currentLevel - 158;
      } else if (currentLevel >= 16) {
        xpForNextLevel = 5 * currentLevel - 38;
      } else {
        xpForNextLevel = 2 * currentLevel + 7;
      }

      // Set the new level and experience progress
      leveling.setLevel(currentLevel);
      leveling.setExperienceProgress(
        xpForNextLevel > 0 ? currentXp / xpForNextLevel : 0
      );

      // Return the new experience points
      return currentXp;
    } else {
      // If the trait doesn't exist, there's no experience to remove.
      return 0;
    }
  }

  /**
   * Get the total xp of the player.
   * @returns The total experience of the player, which is the sum of the level and experience.
   * @note This method is dependent on the `PlayerLevelingTrait` being added to the player.
   */
  public getTotalXp(): number {
    // Check if the player has the PlayerLevelingTrait
    if (this.hasTrait(PlayerLevelingTrait)) {
      // Get the PlayerLevelingTrait
      const leveling = this.getTrait(PlayerLevelingTrait);

      // Return the total experience of the player
      return leveling.getTotalXp();
    }

    // If the PlayerLevelingTrait is not present, return 0
    return 0;
  }

  /**
   * Set the total xp of the player.
   * @param value The total experience to set for the player.
   * @note This method is dependent on the `PlayerLevelingTrait` being added to the player.
   */
  public setTotalXp(value: number): void {
    // Parse the value to ensure it is a float
    const level = Math.trunc(value);
    const experience = value - level;

    // Check if the player has the PlayerLevelingTrait
    if (this.hasTrait(PlayerLevelingTrait)) {
      // Get the PlayerLevelingTrait
      const leveling = this.getTrait(PlayerLevelingTrait);

      // Set the level and experience in the PlayerLevelingTrait
      leveling.setLevel(level);
      leveling.setExperience(experience);
    } else {
      // Add the PlayerLevelingTrait to the player
      const leveling = this.addTrait(PlayerLevelingTrait);

      // Set the level and experience in the PlayerLevelingTrait
      leveling.setLevel(level);
      leveling.setExperience(experience);
    }
  }

  public getLevelStorage(): PlayerLevelStorage {
    // Call the super method to get the player level storage
    const storage = new PlayerLevelStorage(super.getLevelStorage());

    // Set the player properties in the storage
    storage.setUsername(this.username);
    storage.setXuid(this.xuid);
    storage.setUuid(this.uuid);
    storage.setAbilities([...this.abilities.entries()]);

    // Return the player level storage
    return storage;
  }

  public loadLevelStorage(world: World, source: CompoundTag): void {
    // Call the super method to load the player level storage
    super.loadLevelStorage(world, source);

    // Create a new PlayerLevelStorage instance
    const storage = new PlayerLevelStorage(source);

    // Load the abilities from the storage
    for (const [key, value] of storage.getAbilities())
      this.abilities.set(key, value);
  }

  /**
   * The latency of the connection in milliseconds.
   */
  public get ping(): number {
    return this.connection.ping;
  }
}

export { Player };
