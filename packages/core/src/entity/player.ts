import { Connection } from "@serenityjs/raknet";
import {
  AbilityIndex,
  BlockPosition,
  ChangeDimensionPacket,
  ContainerName,
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
  PlaySoundPacket,
  SerializedSkin,
  SetPlayerGameTypePacket,
  ShowProfilePacket,
  StopSoundPacket,
  TeleportCause,
  TextPacket,
  TextPacketType,
  TransferPacket,
  Vector3f
} from "@serenityjs/protocol";

import {
  EntitySpawnOptions,
  PlayerEntry,
  PlayerProperties,
  PlaySoundOptions
} from "../types";
import { Dimension, World } from "../world";
import { EntityIdentifier } from "../enums";
import { Container } from "../container";
import { ItemBundleTrait, ItemStack, ItemType } from "../item";
import {
  EntityDimensionChangeSignal,
  PlayerGamemodeChangeSignal
} from "../events";
import { FormParticipant } from "../ui";
import { PermissionMember } from "../permissions";

import { Entity } from "./entity";
import { AbilityMap } from "./maps";
import {
  PlayerChunkRenderingTrait,
  PlayerCraftingInputTrait,
  PlayerCursorTrait,
  PlayerTrait
} from "./traits";
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
   * The permission level of the player.
   */
  public readonly permissions: PermissionMember;

  /**
   * The current input tick of the player
   */
  public inputTick = 0n;

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
      this.dynamicProperties.set("gamemode", Gamemode.Survival); // TODO: Get the default gamemode from the world

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
    this.permissions = this.serenity.getPermissionMember(this);
    this.permissions.player = this; // Set the player instance to the permission member

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
    return this.permissions.has("serenity.operator");
  }

  /**
   * Add the operator status to the player
   */
  public op(): void {
    // Set the player's permission level to operator in the permissions map
    this.permissions.add("serenity.operator");

    // Update the player's abilities
    this.abilities.set(AbilityIndex.OperatorCommands, true);
    this.abilities.set(AbilityIndex.Teleport, true);
  }

  /**
   * Remove the operator status from the player
   */
  public deop(): void {
    // Set the player's permission level to member in the permissions map
    this.permissions.remove("serenity.operator");

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

    // Send the available creative content to the player
    this.send(content);

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
      packet.riddenRuntimeId = 0n;
      packet.cause = new TeleportCause(4, 0);
      packet.inputTick = this.inputTick;

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
    this.despawn();

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

      // Get the chunk rendering trait
      const rendering = this.getTrait(PlayerChunkRenderingTrait);

      // Send the player the spawn chunks
      return rendering.send(...rendering.next());
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
   * Gets the player's data as a database entry
   * @returns The player entry
   */
  public getDataEntry(): PlayerEntry {
    // Create the player entry to save
    const entry: PlayerEntry = {
      username: this.username,
      xuid: this.xuid,
      uuid: this.uuid,
      abilities: [...this.abilities.entries()],
      ...super.getDataEntry()
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
    // Call the super method to load the player data
    super.loadDataEntry(world, entry, overwrite);

    try {
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

      // Check if the player should overwrite the current data
      if (overwrite) this.abilities.clear();

      // Add the abilities to the player
      for (const [key, value] of entry.abilities)
        this.abilities.set(key, value);
    } catch {
      // Log the error to the console
      this.world.logger.error(
        `Failed to load player entry for player "${this.username}" in dimension "${this.dimension.identifier}". Player data will be reset for this player.`
      );
    }
  }
}

export { Player };
