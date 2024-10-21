import { Connection } from "@serenityjs/raknet";
import {
  AbilityIndex,
  BlockPosition,
  ContainerName,
  DataPacket,
  DefaultAbilityValues,
  DisconnectMessage,
  DisconnectPacket,
  DisconnectReason,
  Gamemode,
  SerializedSkin,
  SetPlayerGameTypePacket,
  TextPacket,
  TextPacketType
} from "@serenityjs/protocol";

import { PlayerEntry, PlayerProperties } from "../types";
import { Dimension } from "../world";
import { EntityIdentifier } from "../enums";
import { Container } from "../container";
import { ItemStack } from "../item";

import { Entity } from "./entity";
import { AbilityMap } from "./maps";
import { PlayerCursorTrait, PlayerTrait } from "./traits";

const DefaultPlayerProperties: PlayerProperties = {
  username: "SerenityJS",
  xuid: "0000000000000000",
  uuid: "00000000-0000-0000-0000-000000000000",
  permission: 0,
  uniqueId: 0n,
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

  public readonly traits = new Map<string, PlayerTrait>();

  /**
   * The current abilities of the player, and whether they are enabled
   */
  public readonly abilities = new AbilityMap(this);

  /**
   * The skin of the player
   */
  public readonly skin: SerializedSkin;

  /**
   * The container that the player is currently viewing.
   */
  public openedContainer: Container | null = null;

  /**
   * The current gamemode of the player
   */
  public gamemode: Gamemode = Gamemode.Survival;

  /**
   * The target block that the player is currently breaking.
   */
  public blockTarget: BlockPosition | null = null;

  /**
   * The target item that the player is currently using.
   */
  public itemTarget: ItemStack | null = null;

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
    this.skin = props.skin;

    // If the player properties contains an entry, load it
    if (properties?.entry) this.load(properties.entry);

    // Get the traits for the player
    const traits = dimension.world.entityPalette.getRegistryFor(
      this.type.identifier
    );

    // Register the traits to the player
    for (const trait of traits) this.addTrait(trait);

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
  }

  /**
   * Sets the gamemode of the player
   * @param gamemode The gamemode to set
   */
  public setGamemode(gamemode: Gamemode): void {
    // Set the gamemode of the player
    this.gamemode = gamemode;

    // Create a new set player game type packet
    const packet = new SetPlayerGameTypePacket();
    packet.gamemode = gamemode;

    // Send the packet to the player
    this.send(packet);
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
  public spawn(): void {
    // Call the super method to spawn the player
    super.spawn();

    // Update the abilities of the player
    this.abilities.update();
  }

  /**
   * Save the player to the provider of the dimension
   */
  public save(): void {
    // Get the provider of the dimension
    const provider = this.dimension.world.provider;

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
      abilities: [...this.abilities.entries()]
    };

    // Write the player to the provider
    provider.writePlayer(entry, this.dimension);
  }

  /**
   * Load the player from the provided player entry
   * @param entry The player entry to load
   * @param overwrite Whether to overwrite the current player data; default is true
   */
  public load(entry: PlayerEntry, overwrite = true): void {
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
      this.components.clear();
      this.traits.clear();
      this.abilities.clear();
    }

    // Add the components to the player, if it does not already exist
    for (const [key, value] of entry.components) {
      if (!this.components.has(key)) this.components.set(key, value);
    }

    // Add the traits to the player, if it does not already exist
    // Add the traits to the entity, if it does not already exist
    for (const trait of entry.traits) {
      // Check if the palette has the trait
      const traitType = this.dimension.world.entityPalette.traits.get(trait);

      // Check if the trait exists in the palette
      if (!traitType) {
        this.serenity.logger.error(
          `Failed to load trait "${trait}" for entity "${this.type.identifier}:${this.uniqueId}" in dimension "${this.dimension.identifier}" as it does not exist in the palette`
        );

        continue;
      }

      // Attempt to add the trait to the entity
      this.addTrait(traitType);
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
  }
}

export { Player };
