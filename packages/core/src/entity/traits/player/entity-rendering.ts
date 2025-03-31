import {
  AbilityLayerType,
  AbilitySet,
  AddEntityPacket,
  AddItemActorPacket,
  AddPlayerPacket,
  CommandPermissionLevel,
  EquipmentSlot,
  MobArmorEquipmentPacket,
  NetworkItemStackDescriptor,
  PermissionLevel,
  PropertySyncData,
  RemoveEntityPacket,
  Vector3f
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityInventoryTrait } from "../inventory";
import { ItemStack } from "../../../item";
import { EntityItemStackTrait } from "../item-stack";
import { EntityEquipmentTrait } from "../equipment";
import { Entity } from "../../entity";
import { EntityDespawnOptions, EntitySpawnOptions } from "../../..";
import { TraitOnTickDetails } from "../../../trait";

import { PlayerTrait } from "./trait";
import { PlayerChunkRenderingTrait } from "./chunk-rendering";

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
    if (this.entities.has(entity.uniqueId)) return;

    // Add the entity to the rendered entities
    this.entities.add(entity.uniqueId);

    // Create a new MobArmorEquipmentPacket
    const armor = new MobArmorEquipmentPacket();

    // Check if the entity has an equipment component
    if (entity.hasTrait(EntityEquipmentTrait)) {
      // Get the equipment component
      const trait = entity.getTrait(EntityEquipmentTrait);

      // Set the head, chest, legs, and feet armor
      const head = trait.getEquipment(EquipmentSlot.Head) ?? ItemStack.empty();
      const chest =
        trait.getEquipment(EquipmentSlot.Chest) ?? ItemStack.empty();
      const legs = trait.getEquipment(EquipmentSlot.Legs) ?? ItemStack.empty();
      const feet = trait.getEquipment(EquipmentSlot.Feet) ?? ItemStack.empty();

      // Assign the packet properties
      armor.runtimeId = entity.runtimeId;
      armor.helmet = ItemStack.toNetworkStack(head);
      armor.chestplate = ItemStack.toNetworkStack(chest);
      armor.leggings = ItemStack.toNetworkStack(legs);
      armor.boots = ItemStack.toNetworkStack(feet);
      armor.body = ItemStack.toNetworkStack(ItemStack.empty());
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
      packet.gamemode = entity.gamemode;
      packet.data = [...entity.metadata.values()];
      packet.properties = new PropertySyncData([], []);
      packet.uniqueEntityId = entity.uniqueId;
      packet.premissionLevel = entity.isOp
        ? PermissionLevel.Operator
        : PermissionLevel.Member;

      packet.commandPermission = entity.isOp
        ? CommandPermissionLevel.Operator
        : CommandPermissionLevel.Normal;

      packet.abilities = [
        {
          type: AbilityLayerType.Base,
          abilities: [...entity.abilities.entries()].map(
            ([ability, value]) => new AbilitySet(ability, value)
          ),
          walkSpeed: 0.1,
          verticalFlySpeed: 1.0,
          flySpeed: 0.05
        }
      ];
      packet.links = [];
      packet.deviceId = entity.device.identifier;
      packet.deviceOS = entity.device.os;

      // Adjust the player's position for rendering
      packet.position.y -= entity.hitboxHeight; // Adjust the y position for the player

      // Send the packet to the player
      this.player.send(packet);
      if (entity.hasTrait(EntityEquipmentTrait)) this.player.send(armor);

      // Break out of the function
      return;
    }

    // Adjust the entity's position
    const position = new Vector3f(
      entity.position.x,
      entity.position.y - entity.hitboxHeight,
      entity.position.z
    );

    // Check if the entity is an item
    if (entity.isItem()) {
      // Get the item component
      const itemComponent = entity.getTrait(EntityItemStackTrait);

      // Create a new AddItemActorPacket
      const packet = new AddItemActorPacket();

      // Set the packet properties
      packet.uniqueId = entity.uniqueId;
      packet.runtimeId = entity.runtimeId;
      packet.item = ItemStack.toNetworkStack(itemComponent.itemStack);
      packet.position = position;
      packet.velocity = entity.velocity;
      packet.data = [...entity.metadata.values()];
      packet.fromFishing = false;

      // Send the packet to the player
      this.player.send(packet);
      if (entity.hasTrait(EntityEquipmentTrait)) this.player.send(armor);

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
    packet.data = [...entity.metadata.values()];
    packet.properties = new PropertySyncData([], []);
    packet.links = [];

    // Send the packet to the player
    this.player.send(packet);
    if (entity.hasTrait(EntityEquipmentTrait)) this.player.send(armor);
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
    if (details.currentTick % 50n !== 0n) return;

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
      if (this.distance(entity.position, this.player.position) > viewDistance)
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
        const distance = this.distance(entity.position, this.player.position);

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

  public distance(a: Vector3f, b: Vector3f): number {
    return Math.sqrt(
      Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
    );
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
