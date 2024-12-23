import { Connection } from "@serenityjs/raknet";
import {
  AbilityIndex,
  BlockPosition,
  ChangeDimensionPacket,
  ContainerName,
  CreativeContentPacket,
  DataPacket,
  DefaultAbilityValues,
  DisconnectMessage,
  DisconnectPacket,
  DisconnectReason,
  Gamemode,
  MoveMode,
  MovePlayerPacket,
  PermissionLevel,
  SerializedSkin,
  SetPlayerGameTypePacket,
  ShowProfilePacket,
  TeleportCause,
  TextPacket,
  TextPacketType,
  TransferPacket,
  Vector3f
} from "@serenityjs/protocol";

import { PlayerEntry, PlayerProperties } from "../types";
import { Dimension, World } from "../world";
import { EntityIdentifier } from "../enums";
import { Container } from "../container";
import { ItemBundleTrait, ItemStack } from "../item";
import {
  EntityDimensionChangeSignal,
  PlayerGamemodeChangeSignal
} from "../events";
import { FormParticipant } from "../ui";

import { Entity } from "./entity";
import { AbilityMap } from "./maps";
import { type EntityTrait, PlayerCursorTrait, PlayerTrait } from "./traits";
import { Device } from "./device";
import { ScreenDisplay } from "./screen-display";

const DefaultPlayerProperties: PlayerProperties = {
  username: "SerenityJS",
  xuid: "0000000000000000",
  uuid: "00000000-0000-0000-0000-000000000000",
  uniqueId: 0n,
  device: Device.empty(),
  skin: SerializedSkin.empty()
};

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
   * The device information of the player
   */
  public readonly device: Device;

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
   * The current input tick of the player
   */
  public inputTick = 0n;

  /**
   * The permission level of the player
   */
  public permission: PermissionLevel;

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
    if (!this.components.has("gamemode"))
      // Set the default gamemode for the player
      this.components.set("gamemode", Gamemode.Survival); // TODO: Get the default gamemode from the world

    // Return the gamemode of the player
    return this.components.get("gamemode") as Gamemode;
  }

  /**
   * The gamemode of the player.
   */
  public set gamemode(value: Gamemode) {
    const signal = new PlayerGamemodeChangeSignal(this, this.gamemode, value);

    if (!signal.emit()) return;

    // Set the gamemode of the player
    this.components.set("gamemode", value);

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

    // Create a new set player game type packet
    const packet = new SetPlayerGameTypePacket();
    packet.gamemode = value;

    // Send the packet to the player
    this.send(packet);
  }

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
    this.device = props.device;
    this.skin = props.skin;
    this.alwaysShowNameTag = true;

    // Get the player's permission level from the permissions map
    this.permission = this.serenity.permissions.get(this.uuid);

    // If the player properties contains an entry, load it
    if (properties?.entry)
      this.loadDataEntry(dimension.world, properties.entry);

    // Initialize the player
    this.initialize();
  }

  protected initialize(): void {
    // Get the traits for the player
    const traits = this.dimension.world.entityPalette.getRegistryFor(
      this.type.identifier
    );

    // Register the traits to the player, if they do not already exist
    for (const trait of traits) if (!this.hasTrait(trait)) this.addTrait(trait);

    // Add the default abilities to the player, if they do not already exist
    for (const [ability, value] of Object.entries(DefaultAbilityValues)) {
      if (!this.abilities.has(+ability as AbilityIndex))
        this.abilities.set(+ability as AbilityIndex, value);
    }
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
   * Check if the player is an operator
   * @returns Whether the player is an operator
   */
  public isOp(): boolean {
    return this.permission === PermissionLevel.Operator;
  }

  /**
   * Add the operator status to the player
   */
  public op(): void {
    // Set the player's permission level to operator
    this.permission = PermissionLevel.Operator;

    // Set the player's permission level to operator in the permissions map
    this.serenity.permissions.set(this.uuid, PermissionLevel.Operator);

    // Update the player's abilities
    this.abilities.set(AbilityIndex.OperatorCommands, true);
    this.abilities.set(AbilityIndex.Teleport, true);
  }

  /**
   * Remove the operator status from the player
   */
  public deop(): void {
    // Set the player's permission level to member
    this.permission = PermissionLevel.Member;

    // Set the player's permission level to member in the permissions map
    this.serenity.permissions.set(this.uuid, PermissionLevel.Member);

    // Update the player's abilities
    this.abilities.set(AbilityIndex.OperatorCommands, false);
    this.abilities.set(AbilityIndex.Teleport, false);
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
    this.despawn();
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

        // Check if the item has a ItemBundleTrait
        if (item.hasTrait(ItemBundleTrait)) {
          // Get the bundle trait
          const bundle = item.getTrait(ItemBundleTrait);

          // Check if the bundle has the dynamic id
          if (bundle.dynamicId === dynamicId) return bundle.container;
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

      // case ContainerName.CraftingInput: {
      //   // Check if the player has the crafting input component
      //   if (!this.hasComponent("minecraft:crafting_input"))
      //     throw new Error("The player does not have a crafting input.");

      //   // Get the crafting input component
      //   const craftingInput = this.getComponent("minecraft:crafting_input");

      //   // Return the crafting input container
      //   return craftingInput.container;
      // }

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
  public spawn(): this {
    // Call the super method to spawn the player
    super.spawn();

    // Update the abilities of the player
    this.abilities.update();

    // Create a new CreativeContentPacket, and map the creative content to the packet
    const content = new CreativeContentPacket();
    content.items = this.world.itemPalette.getCreativeContent().map((item) => {
      return {
        network: item.type.network,
        metadata: item.metadata,
        stackSize: 1,
        networkBlockId:
          item.type.block?.permutations[item.metadata]?.network ?? 0,
        extras: {
          canDestroy: [],
          canPlaceOn: [],
          nbt: item.nbt
        }
      };
    });

    // Serialize the available commands for the player
    const commands = this.world.commands.serialize();

    // Filter the commands by the player's permission level
    commands.commands = commands.commands.filter(
      (x) => x.permissionLevel <= this.permission
    );

    // Send the available commands packet to the player
    this.send(content, commands);

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
    // Set the player's position
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;

    // Check if the dimension is provided
    if (dimension) {
      const signal = new EntityDimensionChangeSignal(
        this,
        this.dimension,
        dimension
      );

      if (!signal.emit()) return;
      // Despawn the player from the current dimension
      this.despawn();

      if (dimension.world !== this.dimension.world) {
        // Save the players current data
        this.world.provider.writePlayer(this.getDataEntry(), this.dimension);

        // Read the player data from the new world
        const data = dimension.world.provider.readPlayer(this.uuid, dimension);

        // Check if the player data exists
        if (data) this.loadDataEntry(dimension.world, data, true);
        else {
          // Clear the player's data
          this.components.clear();
          this.traits.clear();
          this.abilities.clear();
          this.metadata.clear();
          this.flags.clear();
        }

        // Initialize the player
        this.initialize();
      }

      // Check if the dimension types are different
      // This allows for a faster dimension change if the types are the same
      if (this.dimension.type !== dimension.type) {
        // Create a new ChangeDimensionPacket
        const packet = new ChangeDimensionPacket();
        packet.dimension = dimension.type;
        packet.position = position;
        packet.respawn = true;
        packet.hasLoadingScreen = false;

        // Send the packet to the player
        this.sendImmediate(packet);
      }

      // Set the new dimension
      this.dimension = dimension;

      // Spawn the player in the new dimension
      this.spawn();

      // Update the player's position
      return this.teleport(position);
    } else {
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
      packet.riddenRuntimeId = 0n;
      packet.cause = new TeleportCause(4, 0);
      packet.inputTick = this.inputTick;

      // Send the packet to the player
      this.send(packet);
    }
  }

  /**
   * Gets the player's data as a database entry
   * @returns The player entry
   */
  public getDataEntry(): PlayerEntry {
    // Create the player entry to save
    const entry: PlayerEntry = {
      username: this.username,
      xuid: this.xuid,
      uuid: this.uuid,
      uniqueId: this.uniqueId,
      identifier: this.type.identifier,
      position: this.position,
      rotation: this.rotation,
      components: [...this.components.entries()],
      traits: [...this.traits.keys()],
      metadata: [...this.metadata.entries()],
      flags: [...this.flags.entries()],
      attributes: [...this.attributes.entries()],
      abilities: [...this.abilities.entries()],
      scoreboardIdentity: this.scoreboardIdentity.identifier
    };

    // Return the player entry
    return entry;
  }

  /**
   * Load the player from the provided player entry
   * @param world The world the player data is coming from
   * @param entry The player entry to load
   * @param overwrite Whether to overwrite the current player data; default is true
   */
  public loadDataEntry(
    world: World,
    entry: PlayerEntry,
    overwrite = true
  ): void {
    // Check that the username matches the player's username
    if (entry.username !== this.username)
      throw new Error(
        "Failed to load player entry as the username does not match the player's username!"
      );

    // Check that the uuid matches the player's uuid
    if (entry.uuid !== this.uuid)
      throw new Error(
        "Failed to load player entry as the uuid does not match the player's uuid!"
      );

    // Check that the xuid matches the player's xuid
    if (entry.xuid !== this.xuid)
      throw new Error(
        "Failed to load player entry as the xuid does not match the player's xuid!"
      );

    // Check that the unique id matches the player's unique id
    if (entry.uniqueId !== this.uniqueId)
      throw new Error(
        "Failed to load player entry as the unique id does not match the player's unique id!"
      );

    // Check that the identifier matches the player's identifier
    if (entry.identifier !== this.type.identifier)
      throw new Error(
        "Failed to load player entry as the identifier does not match the player's identifier!"
      );

    // Set the player's position and rotation
    this.position.set(entry.position);
    this.rotation.set(entry.rotation);

    // Check if the player should overwrite the current data
    if (overwrite) {
      this.metadata.clear();
      this.flags.clear();
      this.attributes.clear();
      this.abilities.clear();
      this.components.clear();
      this.traits.clear();
    }

    // Add the metadata to the player, if it does not already exist
    for (const [key, value] of entry.metadata) {
      if (!this.metadata.has(key)) this.metadata.set(key, value);
    }

    // Add the flags to the player, if it does not already exist
    for (const [flag, value] of entry.flags) {
      if (!this.flags.has(flag)) this.flags.set(flag, value);
    }

    // Add the attributes to the player, if it does not already exist
    for (const [attribute, value] of entry.attributes) {
      if (!this.attributes.has(attribute))
        this.attributes.set(attribute, value);
    }

    // Add the abilities to the player, if it does not already exist
    for (const [ability, value] of entry.abilities) {
      if (!this.abilities.has(ability)) this.abilities.set(ability, value);
    }

    // Add the components to the player, if it does not already exist
    for (const [key, value] of entry.components) {
      if (!this.components.has(key)) this.components.set(key, value);
    }

    // Add the traits to the player, if it does not already exist
    // Add the traits to the entity, if it does not already exist
    for (const trait of entry.traits) {
      // Check if the palette has the trait
      const traitType = world.entityPalette.traits.get(trait);

      // Check if the trait exists in the palette
      if (!traitType) {
        world.logger.error(
          `Failed to load trait "${trait}" for player "${this.username}:${this.uniqueId}" as it does not exist in the palette`
        );

        continue;
      }

      // Attempt to add the trait to the entity
      this.addTrait(traitType as typeof EntityTrait);
    }
  }
}

export { Player };
