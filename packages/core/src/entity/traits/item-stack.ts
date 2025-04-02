import {
  ActorEvent,
  ActorEventPacket,
  LevelSoundEvent,
  LevelSoundEventPacket,
  TakeItemActorPacket,
  Vector3f
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
  protected pickupTick: bigint | null = null;

  /**
   * The target player of the item.
   */
  protected target: Player | null = null;

  /**
   * The merging state of the item.
   */
  protected merging = false;

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
    // Check if the item is on the ground and the current tick is a multiple of 25
    if (
      this.entity.onGround &&
      this.entity.dimension.world.currentTick % 25n === 0n &&
      this.pickupTick === null
    ) {
      // Check if there is a existing item stack nearby within a 0.5 block radius
      for (const [, entity] of this.entity.dimension.entities) {
        // Check if the entity is not an item
        if (!this.entity.isItem()) continue;

        // Continue if the item is being merged
        if (this.merging && this.mergingEntity?.isAlive) continue;
        // Check if the item is being merged and the entity is the last item
        else if (this.merging && !this.mergingEntity?.isAlive)
          // Set merging to false as its done
          this.merging = false;

        // Check if the entity is the same as the item
        if (entity === this.entity) continue;

        // Calculate the distance between the entities
        const distance = Vector3f.subtract(
          entity.position,
          this.entity.position
        );

        // Check if the distance is less than 0.5 blocks
        if (
          Math.abs(distance.x) <= 0.9 &&
          Math.abs(distance.y) <= 0.9 &&
          Math.abs(distance.z) <= 0.9
        ) {
          // Get the item component of the entity
          const component = entity.getTrait(EntityItemStackTrait);
          const existingItem = component.itemStack;

          // Check if the existing item stack is full
          if (existingItem.amount >= existingItem.maxAmount) continue;

          // Check if the item stacks are the same
          if (!existingItem.equals(this.itemStack)) continue;

          // Increment the item stack and despawn the existing item
          this.increment(existingItem.amount);
          component.entity.despawn();

          // Set merging to true and set the merging entity
          this.merging = true;
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
      if (!success)
        // If not, reset the target player and pickup tick
        return void (this.pickupTick = this.target = null);

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
    if (details.currentTick - this.birthTick <= 10n) return;

    // Check if the current tick is a multiple of 5
    if (details.currentTick % 5n !== 0n) return;

    // Check if a player is within a 1 block radius
    for (const [, entity] of this.entity.dimension.entities) {
      // Check if the player is alive
      if (!entity.isPlayer() || !entity.isAlive) continue;

      // Calculate the distance between the player and the item
      const distance = Vector3f.distance(entity.position, this.entity.position);

      // Calculate the distance between the player and the item
      if (distance <= 1.5) {
        // Set the player as the target
        this.target = entity;

        // Set the pickup tick
        this.pickupTick = details.currentTick;
      }
    }

    // Check if the item has been alive for the lifespan
    if (details.currentTick - this.birthTick >= BigInt(this.lifeSpan)) {
      // Remove the item from the dimension
      this.entity.despawn();
    }
  }
}

export { EntityItemStackTrait };
