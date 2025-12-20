import {
  ActorEvent,
  ActorEventPacket,
  LevelSoundEvent,
  LevelSoundEventPacket,
  TakeItemActorPacket
} from "@serenityjs/protocol";
import { CompoundTag } from "@serenityjs/nbt";

import { ItemStack } from "../../item";
import { Entity } from "../entity";
import { Player } from "../player";
import { TraitOnTickDetails } from "../../trait";
import { EntityItemPickupSignal } from "../../events";

import { EntityTrait } from "./trait";
import { EntityInventoryTrait } from "./inventory";

interface EntityItemStackTraitOptions {
  /**
   * The item stack of the component.
   */
  itemStack: ItemStack;

  /**
   * The lifespan of the item in ticks.
   */
  lifeSpan?: number;

  /**
   * Whether the item can be merged with other items.
   */
  canMerge?: boolean;

  /**
   * Whether the item can despawn according to its lifespan.
   */
  canDespawn?: boolean;
}

class EntityItemStackTrait extends EntityTrait {
  public static readonly identifier = "itemstack";

  /**
   * The birth tick of the item.
   */
  public readonly birthTick: bigint;

  /**
   * The item stack of the component.
   */
  public readonly itemStack: ItemStack;

  /**
   * The lifespan of the item in ticks.
   */
  public lifeSpan: number = 6000;

  /**
   * Whether the item can be merged with other items.
   */
  public canMerge = true;

  /**
   * Whether the item can despawn according to its lifespan.
   */
  public canDespawn = true;

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

  /**
   * The target entity that the item is merging with.
   */
  protected mergingEntity: Entity | null = null;

  /**
   * Creates a new instance of the EntityItemStackTrait.
   * @param entity The entity that the trait is attached to.
   * @param options The options for the trait, including the item stack and lifespan.
   */
  public constructor(entity: Entity, options?: EntityItemStackTraitOptions) {
    super(entity);

    // Check if an item stack is provided in the options
    if (options?.itemStack) {
      // Set the item stack of the trait
      this.itemStack = options.itemStack;
    } else if (entity.hasStorageEntry("Item")) {
      // Get the item tag from the entity's nbt
      const entry = entity.getStorageEntry<CompoundTag>("Item")!;

      // Create a new item stack from the level storage entry
      this.itemStack = ItemStack.fromLevelStorage(this.entity.world, entry);
    } else {
      // Throw an error if no item stack is provided
      throw new Error(
        "A valid itemstack or itemstack dynamic property is required to create an EntityItemStackTrait."
      );
    }

    // Set the birth tick of the item
    this.birthTick = entity.dimension.world.currentTick;

    // Set the additional options for the trait
    if (options?.lifeSpan) this.lifeSpan = options.lifeSpan;
    if (options?.canMerge !== undefined) this.canMerge = options.canMerge;
    if (options?.canDespawn !== undefined) this.canDespawn = options.canDespawn;

    // Get the item stack level storage entry
    const storage = this.itemStack.getStorage();

    // Set the item stack storage in the entity's nbt
    entity.setStorageEntry("Item", storage);
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

    // Emit the entity item pickup signal
    const signal = new EntityItemPickupSignal(this.entity, this.itemStack);
    signal.emit();
  }

  public increment(amount?: number): void {
    // Increment the item stack by the specified amount
    this.itemStack.incrementStack(amount);

    // Get the level storage entry of the item stack
    const entry = this.itemStack.getStorage();

    // Update the nbt of the entity with the item stack data
    this.entity.setStorageEntry("Item", entry);

    // Create a new actor event packet to update the stack size
    const packet = new ActorEventPacket();
    packet.event = ActorEvent.UpdateStackSize;
    packet.data = this.itemStack.getStackSize();
    packet.actorRuntimeId = this.entity.runtimeId;

    // Broadcast the packet to the dimension
    this.entity.dimension.broadcast(packet);
  }

  public decrement(amount?: number): void {
    // Decrement the item stack by the specified amount
    this.itemStack.decrementStack(amount);

    // Get the level storage entry of the item stack
    const entry = this.itemStack.getStorage();

    // Update the nbt of the entity with the item stack data
    this.entity.setStorageEntry("Item", entry);

    // Create a new actor event packet to update the stack size
    const packet = new ActorEventPacket();
    packet.event = ActorEvent.UpdateStackSize;
    packet.data = this.itemStack.getStackSize();
    packet.actorRuntimeId = this.entity.runtimeId;

    // Broadcast the packet to the dimension
    this.entity.dimension.broadcast(packet);
  }

  public onAdd(): void {
    // Get the item stack level storage entry
    const entry = this.itemStack.getStorage();

    // Set the item stack data in the entity's nbt
    this.entity.setStorageEntry("Item", entry);
  }

  public onRemove(): void {
    // Delete the item stack data from the entity's nbt
    this.entity.removeStorageEntry("Item");
  }

  private resetTarget(): void {
    // Reset the target player and pickup tick
    this.target = null;
    this.pickupTick = -1n;
  }

  public onTick(details: TraitOnTickDetails): void {
    // Check if an item stack exists
    if (!this.itemStack) return;

    // Check if the current tick is a multiple of 5, if the entity is alive
    if (details.currentTick % 5n !== 0n || !this.entity.isAlive) return;

    // Check if the item has a lifespan and if it has exceeded it
    if (
      this.canDespawn && // Check if the item can despawn
      this.lifeSpan > 0 && // Check if the item has a lifespan
      details.currentTick - this.birthTick >= BigInt(this.lifeSpan)
    )
      this.entity.despawn(); // Despawn the item if it has exceeded its lifespan

    // Check if the item is ready to merge with an identical item
    if (
      this.canMerge && // Check if the item can be merged
      this.entity.onGround && // Check if the entity is on the ground
      this.pickupTick === -1n && // And if the item does not have a pickup tick
      this.itemStack.getStackSize() < this.itemStack.maxStackSize && // Check if the item stack is not full
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
          if (existingItem.getStackSize() >= existingItem.maxStackSize)
            continue;

          // Check if the item stacks are the same
          if (!existingItem.equals(this.itemStack)) continue;

          // Increment the item stack and despawn the existing item
          this.increment(existingItem.getStackSize());
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

      // Emit the entity item pickup signal
      const signal = new EntityItemPickupSignal(this.target, this.itemStack);

      if (!signal.emit()) {
        // If the event was cancelled, reset the target player and pickup tick
        this.resetTarget();
        // Break the loop
        return;
      }

      // Add the item to the players inventory
      const success = inventory.container.addItem(this.itemStack);

      // Check if the item was added to the inventory
      if (!success) {
        // If not, reset the target player and pickup tick
        this.resetTarget();
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
      if (distance <= 1.75) {
        // Set the player as the target
        this.target = player;

        // Set the pickup tick
        this.pickupTick = details.currentTick;
      }
    }
  }
}

export { EntityItemStackTrait, EntityItemStackTraitOptions };
