import {
  ActorEvent,
  ActorEventPacket,
  LevelSoundEvent,
  LevelSoundEventPacket,
  TakeItemActorPacket
} from "@serenityjs/protocol";

import { EntityIdentifier, ItemIdentifier } from "../../enums";
import { ItemStack } from "../../item";
import { Entity } from "../entity";
import { Player } from "../player";
import { ItemStackEntry } from "../../types";
import { TraitOnTickDetails } from "../../trait";

import { EntityTrait } from "./trait";
import { EntityInventoryTrait } from "./inventory";

class EntityItemStackTrait extends EntityTrait {
  public static readonly identifier = "itemstack";

  /**
   * The birth tick of the item.
   */
  public readonly birthTick: bigint;

  /**
   * The item stack of the component.
   */
  public itemStack: ItemStack;

  /**
   * The lifespan of the item in ticks.
   */
  public lifeSpan: number = 6000;

  /**
   * The pickup tick of the item.
   */
  protected pickupTick: bigint = -1n;

  /**
   * The target player of the item.
   */
  protected target: Player | null = null;

  /**
   * The merging state of the item.
   */
  protected isMerging = false;

  protected mergingEntity: Entity | null = null;

  /**
   * Creates a new entity inventory component.
   *
   * @param entity The entity of the component.
   * @param itemStack The item stack of the component.
   * @returns A new entity inventory component.
   */
  public constructor(entity: Entity) {
    super(entity);

    // Check if the entity type is an item
    // If not we throw an error
    if (entity.type.identifier !== EntityIdentifier.Item) {
      throw new Error("Entity must be an item");
    }

    // Get the component of the item stack from the entity
    const entry = entity.dynamicProperties.get("itemstack") as ItemStackEntry;

    // Check if the entry exists
    if (entry) {
      // Set the item stack of the component
      this.itemStack = new ItemStack(entry.identifier, { entry });
    } else {
      // Set the item stack of the component
      this.itemStack = new ItemStack(ItemIdentifier.Air);
    }

    // Set the birth tick of the item
    this.birthTick = entity.dimension.world.currentTick;
  }

  /**
   * Gets the lifespan of the item.
   * @returns The lifespan of the item.
   */
  public getLifeSpan(): number {
    return this.lifeSpan;
  }

  /**
   * Sets the lifespan of the item.
   * @param value The lifespan of the item.
   */
  public setLifeSpan(value: number): void {
    this.lifeSpan = value;
  }

  /**
   * Picks up the item by a player.
   * @param player The player that picked up the item.
   */
  public pickup(player: Player): void {
    // Teleport the item to the player
    this.entity.teleport(player.position);

    // Set the player as the target
    this.target = player;

    // Set the pickup tick
    this.pickupTick = this.entity.dimension.world.currentTick;
  }

  public increment(amount?: number): void {
    this.itemStack.increment(amount);

    // Set the item stack component of the entity
    this.entity.dynamicProperties.set(
      "itemstack",
      this.itemStack.getDataEntry()
    );

    const packet = new ActorEventPacket();
    packet.event = ActorEvent.UpdateStackSize;
    packet.data = this.itemStack.amount;
    packet.actorRuntimeId = this.entity.runtimeId;

    this.entity.dimension.broadcast(packet);
  }

  public decrement(amount?: number): void {
    this.itemStack.decrement(amount);

    // Set the item stack component of the entity
    this.entity.dynamicProperties.set(
      "itemstack",
      this.itemStack.getDataEntry()
    );

    const packet = new ActorEventPacket();
    packet.event = ActorEvent.UpdateStackSize;
    packet.data = this.itemStack.amount;
    packet.actorRuntimeId = this.entity.runtimeId;

    this.entity.dimension.broadcast(packet);
  }

  public onTick(details: TraitOnTickDetails): void {
    // Check if an item stack exists
    if (!this.itemStack) return;

    // Check if the current tick is a multiple of 5, if the entity is alive
    if (details.currentTick % 5n !== 0n || !this.entity.isAlive) return;

    if (
      this.entity.onGround && // Check if the entity is on the ground
      this.pickupTick === -1n && // And if the item does not have a pickup tick
      this.itemStack.amount < this.itemStack.maxAmount && // Check if the item stack is not full
      details.currentTick % 25n === 0n // Check if the current tick is a multiple of 25
    ) {
      // Iterate over the entities in the dimension
      for (const [, entity] of this.entity.dimension.entities) {
        // Check if the entity is not an item
        if (!entity.isItem()) continue;

        // Check if the entity is the same as the item
        if (entity === this.entity) continue;

        // Continue if the item is being merged
        if (this.isMerging && this.mergingEntity?.isAlive) continue;
        // Check if the item is being merged and the entity is the last item
        else if (this.isMerging && !this.mergingEntity?.isAlive) {
          // Reset the merging properties
          this.isMerging = false;
          this.mergingEntity = null;
        }

        // Calculate the distance between the entities
        const distance = entity.position.distance(this.entity.position);

        // Check if the distance is less than 1.5 blocks
        if (distance <= 1.5) {
          // Get the item component of the entity
          const component = entity.getTrait(EntityItemStackTrait);

          // Check if the component exists
          if (!component) continue;

          // Get the item stack of the component
          const existingItem = component.itemStack;

          // Check if the existing item stack is full
          if (existingItem.amount >= existingItem.maxAmount) continue;

          // Check if the item stacks are the same
          if (!existingItem.equals(this.itemStack)) continue;

          // Increment the item stack and despawn the existing item
          this.increment(existingItem.amount);
          component.entity.despawn();

          // Set merging to true and set the merging entity
          this.isMerging = true;
          this.mergingEntity = entity;
        }
      }
    }

    // Check if there is a target player
    if (
      this.target && // Check if the pickup tick is not null
      this.pickupTick && // Check if the current tick is greater than the pickup tick
      details.currentTick - this.pickupTick >= 5n
    ) {
      // Get the players inventory component
      const inventory = this.target.getTrait(EntityInventoryTrait);

      // Add the item to the players inventory
      const success = inventory.container.addItem(this.itemStack);

      // Check if the item was added to the inventory
      if (!success) {
        // If not, reset the target player and pickup tick
        this.target = null;
        this.pickupTick = -1n;

        // Break the loop
        return;
      }

      // Create a new take item actor packet
      const take = new TakeItemActorPacket();
      take.itemRuntimeId = this.entity.runtimeId;
      take.targetRuntimeId = this.target.runtimeId;

      // Create a new level sound event packet
      const sound = new LevelSoundEventPacket();
      sound.event = LevelSoundEvent.Pop;
      sound.position = this.target.position;
      sound.actorIdentifier = this.entity.type.identifier;
      sound.data = -1;
      sound.isBabyMob = false;
      sound.isGlobal = false;
      sound.uniqueActorId = -1n;

      // Send the packets to the player
      this.target.send(sound);
      this.target.dimension.broadcast(take);

      // Remove the item from the dimension
      this.entity.despawn();
    } else if (this.target) return;

    // Check if the item has been alive for 10 ticks
    // This is to prevent the item from being picked up immediately
    if (details.currentTick - this.birthTick <= 10n || this.target) return;

    // Check if a player is within a 1 block radius
    for (const player of this.entity.dimension.getPlayers()) {
      // Check if the player is alive
      if (!player.isAlive) continue;

      // Calculate the distance between the player and the item
      const distance = player.position.distance(this.entity.position);

      // Check if the distance is less than 1.5 blocks
      if (distance <= 1.0) {
        // Set the player as the target
        this.target = player;

        // Set the pickup tick
        this.pickupTick = details.currentTick;
      }
    }
  }
}

export { EntityItemStackTrait };
