import {
  ActorLink,
  ActorLinkType,
  AddEntityPacket,
  AddItemActorPacket,
  AddPlayerPacket,
  CommandPermissionLevel,
  EquipmentSlot,
  MobArmorEquipmentPacket,
  NetworkItemStackDescriptor,
  PermissionLevel,
  RemoveEntityPacket,
  Vector3f
} from "@serenityjs/protocol";

import { EntityRidingTrait } from "..";
import { EntityDespawnOptions, EntitySpawnOptions } from "../../..";
import { EntityIdentifier } from "../../../enums";
import { ItemStack } from "../../../item";
import { TraitOnTickDetails } from "../../../trait";
import { Entity } from "../../entity";
import { EntityEquipmentTrait } from "../equipment";
import { EntityInventoryTrait } from "../inventory";
import { EntityItemStackTrait } from "../item-stack";

import { PlayerChunkRenderingTrait } from "./chunk-rendering";
import { PlayerTrait } from "./trait";

class PlayerEntityRenderingTrait extends PlayerTrait {
  public static readonly identifier = "entity_rendering";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * A collective list of all the entities that have been rendered for the player.
   */
  public readonly entities: Set<bigint> = new Set();

  /**
   * A collective list of all the entities that have been hidden from the player.
   */
  public readonly hidden: Set<bigint> = new Set();

  /**
   * Show an entity to the target player.
   * @param entity The entity to show to the target player.
   */
  public addEntity(entity: Entity): void {
    // Check if the entity is already rendered
    if (
      this.entities.has(entity.uniqueId) ||
      !entity.isAlive || // Verify the entity is alive
      !entity.isTicking // Verify the entity is ticking (in the world
    )
      return;

    // Add the entity to the rendered entities
    this.entities.add(entity.uniqueId);

    // Create a new MobArmorEquipmentPacket
    let armor: MobArmorEquipmentPacket | undefined;

    // Check if the entity has an equipment component
    if (entity.hasTrait(EntityEquipmentTrait)) {
      // Get the equipment component
      const trait = entity.getTrait(EntityEquipmentTrait);

      // Set the head, chest, legs, and feet armor
      const head = trait.getEquipment(EquipmentSlot.Head);
      const chest = trait.getEquipment(EquipmentSlot.Chest);
      const legs = trait.getEquipment(EquipmentSlot.Legs);
      const feet = trait.getEquipment(EquipmentSlot.Feet);

      if (head && chest && legs && feet) {
        // Assign the packet properties
        armor = new MobArmorEquipmentPacket();
        armor.runtimeId = entity.runtimeId;
        armor.helmet = ItemStack.toNetworkStack(head);
        armor.chestplate = ItemStack.toNetworkStack(chest);
        armor.leggings = ItemStack.toNetworkStack(legs);
        armor.boots = ItemStack.toNetworkStack(feet);
        armor.body = ItemStack.toNetworkStack(ItemStack.empty());
      }
    }

    // Set the ridden unique id
    let riddenUniqueId = 0n;

    // Check if the entity has a riding trait
    if (entity.hasTrait(EntityRidingTrait)) {
      // Get the riding trait
      const riding = entity.getTrait(EntityRidingTrait);

      // Check if the entity is riding another entity
      if (riding.entityRidingOn) {
        // Get the entity that this entity is riding on
        const target = riding.entityRidingOn;

        // Set the ridden unique id
        riddenUniqueId = target.uniqueId;
      }
    }

    // Check if the entity is a player
    if (entity.isPlayer()) {
      // Create a new AddPlayerPacket
      const packet = new AddPlayerPacket();

      // Get the players inventory
      const inventory = entity.getTrait(EntityInventoryTrait);

      // Get the players held item
      const heldItem = inventory.getHeldItem();

      // Set the packet properties
      packet.uuid = entity.uuid;
      packet.username = entity.username;
      packet.runtimeId = entity.runtimeId;
      packet.platformChatId = String(); // TODO: Not sure what this is
      packet.position = entity.position;
      packet.velocity = entity.velocity;
      packet.pitch = entity.rotation.pitch;
      packet.yaw = entity.rotation.yaw;
      packet.headYaw = entity.rotation.headYaw;
      packet.heldItem =
        heldItem === null
          ? new NetworkItemStackDescriptor(0)
          : ItemStack.toNetworkStack(heldItem);
      packet.gamemode = entity.getGamemode();
      packet.data = entity.metadata.getAllActorMetadataAsDataItems();
      packet.properties =
        entity.sharedProperties.getSharedPropertiesAsSyncData();
      packet.uniqueEntityId = entity.uniqueId;
      packet.permissionLevel = entity.isOp
        ? PermissionLevel.Operator
        : PermissionLevel.Member;

      packet.commandPermission = entity.isOp
        ? CommandPermissionLevel.GameDirectors
        : CommandPermissionLevel.Any;

      packet.abilities = entity.abilities.getAllAbilitiesAsLayers();
      packet.links = [];
      packet.deviceId = entity.clientSystemInfo.identifier;
      packet.deviceOS = entity.clientSystemInfo.os;

      // Check if the entity is riding another entity
      if (riddenUniqueId !== 0n) {
        // Create a new ActorLink
        const link = new ActorLink(
          riddenUniqueId,
          entity.uniqueId,
          ActorLinkType.Rider,
          true,
          false,
          0
        );

        // Push the link to the packet
        packet.links.push(link);
      }

      // Adjust the player's position for rendering
      packet.position.y += entity.getCollisionHeight(); // Adjust the y position for the player

      // Send the packet to the player
      this.player.send(packet);
      if (armor) this.player.send(armor);

      // Break out of the function
      return;
    }

    // Adjust the entity's position
    const position = new Vector3f(
      entity.position.x,
      entity.position.y,
      entity.position.z
    );

    // Check if the entity is an item
    if (entity.isItem()) {
      // Get the item component
      const itemComponent = entity.getTrait(EntityItemStackTrait);

      // Check if the item component is not valid
      if (!itemComponent) return this.removeEntity(entity); // Remove the entity

      // Create a new AddItemActorPacket
      const packet = new AddItemActorPacket();

      // Set the packet properties
      packet.uniqueId = entity.uniqueId;
      packet.runtimeId = entity.runtimeId;
      packet.item = ItemStack.toNetworkStack(itemComponent.itemStack);
      packet.position = position;
      packet.velocity = entity.velocity;
      packet.data = entity.metadata.getAllActorMetadataAsDataItems();
      packet.fromFishing = false;

      // Send the packet to the player
      this.player.send(packet);
      if (armor) this.player.send(armor);

      // Break out of the function
      return;
    }

    // Create a new AddEntityPacket
    const packet = new AddEntityPacket();

    // Set the packet properties
    packet.uniqueEntityId = entity.uniqueId;
    packet.runtimeId = entity.runtimeId;
    packet.identifier = entity.type.identifier;
    packet.position = position;
    packet.velocity = entity.velocity;
    packet.pitch = entity.rotation.pitch;
    packet.yaw = entity.rotation.yaw;
    packet.headYaw = entity.rotation.headYaw;
    packet.bodyYaw = entity.rotation.yaw;
    packet.attributes = [];
    packet.data = entity.metadata.getAllActorMetadataAsDataItems();
    packet.properties = entity.sharedProperties.getSharedPropertiesAsSyncData();
    packet.links = [];

    // Check if the entity is riding another entity
    if (riddenUniqueId !== 0n) {
      // Create a new ActorLink
      const link = new ActorLink(
        riddenUniqueId,
        entity.uniqueId,
        ActorLinkType.Rider,
        true,
        false,
        0
      );

      // Push the link to the packet
      packet.links.push(link);
    }

    // Send the packet to the player
    this.player.send(packet);
    if (armor) this.player.send(armor);
  }

  /**
   * Removes an entity from the target player.
   * @param entity The entity to remove from the target player.
   */
  public removeEntity(entity: Entity | bigint): void {
    // Get the unique entity id
    const unique = typeof entity === "bigint" ? entity : entity.uniqueId;

    // Check if the entity is already rendered
    if (!this.entities.has(unique)) return;

    // Create a new remove entity packet
    const packet = new RemoveEntityPacket();

    // Set the unique entity id
    packet.uniqueEntityId = unique;

    // Send the packet to the player
    this.player.send(packet);

    // Remove the entity from the rendered entities
    this.entities.delete(unique);
  }

  public onTick(details: TraitOnTickDetails): void {
    // Check if the player is spawned
    if (!this.player.isAlive) return;

    // Check if the current tick is divisible by 20
    // This is to ensure that the rendering is done every second
    if (details.currentTick % 20n !== 0n) return;

    // Check if the player has a chunk rendering component
    const component = this.player.getTrait(PlayerChunkRenderingTrait);
    if (!component) return;

    // Get the player's view distance
    const viewDistance = component.viewDistance << 4;

    // Get all the entities in the player's dimension
    const entities = this.player.dimension.entities;

    // Iterate over the entities
    for (const [unique, entity] of entities) {
      // Check if the entity is the player or if the entity has already been rendered
      if (this.entities.has(unique) || entity === this.player) continue;

      // Check if the entity is hidden
      if (this.hidden.has(unique)) continue;

      // Check if the entity is alive
      if (!entity.isAlive) continue;

      // Check if the entity is within the player's view distance
      if (entity.position.distance(this.player.position) > viewDistance)
        continue;

      // Show the entity to the player
      this.addEntity(entity);
    }

    // Iterate over the entities
    for (const unique of this.entities) {
      // Check if the entity is still in the player's dimension
      if (this.player.dimension.entities.has(unique)) {
        // Get the entity
        const entity = this.player.dimension.entities.get(unique);
        if (!entity) continue;

        // Calculate the distance from the player to the entity
        const distance = entity.position.distance(this.player.position);

        // Check if the entity is in the player's view distance
        // And that the entity is alive
        if (
          distance <= viewDistance &&
          entity.isAlive === true // Ensure the entity is alive
        )
          continue;

        // Remove the entity from the player
        this.removeEntity(unique);
      } else {
        // Remove the entity from the player
        this.removeEntity(unique);
      }
    }
  }

  public onRemove(): void {
    // Clear the entities
    this.clear();
  }

  /**
   * Clears all the entities that have been rendered for the player.
   */
  public clear(): void {
    // Iterate over the entities
    for (const unique of this.entities) {
      // Create a new remove entity packet
      const packet = new RemoveEntityPacket();
      packet.uniqueEntityId = unique;

      // Send the packet to the player
      this.player.send(packet);
    }

    // Clear the entities
    this.entities.clear();
  }

  public onDespawn(options: EntityDespawnOptions): void {
    // Clear the entities from the player's view if the entity has not died
    if (!options.hasDied) this.clear();
  }

  public onSpawn(details: EntitySpawnOptions): void {
    // Clear the entities if the spawn details indicate that the dimensions have changed
    if (details.changedDimensions) this.clear();
  }
}

export { PlayerEntityRenderingTrait };
