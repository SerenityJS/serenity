import {
  ActorDataId,
  ActorDataType,
  ContainerId,
  ContainerType,
  DataItem,
  MobEquipmentPacket,
  NetworkItemStackDescriptor,
  Vector3f
} from "@serenityjs/protocol";

import { EntityIdentifier, EntityInteractMethod } from "../../enums";
import { EntityContainer } from "../container";
import { Entity } from "../entity";
import { ItemKeepOnDieTrait, ItemStack } from "../../item";
import {
  EntityInventoryTraitOptions,
  ItemStackEntry,
  ItemStorage
} from "../../types";
import { Container } from "../../container";
import { Player } from "../player";

import { EntityTrait } from "./trait";

class EntityInventoryTrait extends EntityTrait {
  public static readonly identifier = "inventory";
  public static readonly types = [EntityIdentifier.Player];
  public static readonly components = ["minecraft:inventory"];

  /**
   * The container that holds the inventory items.
   */
  public readonly container: EntityContainer;

  /**
   * The dynamic property used to store the inventory items.
   */
  public get property(): ItemStorage {
    return this.entity.getDynamicProperty("inventory") as ItemStorage;
  }

  /**
   * The dynamic property used to store the inventory items.
   */
  public set property(value: ItemStorage) {
    this.entity.setDynamicProperty<ItemStorage>("inventory", value);
  }

  /**
   * The selected slot in the inventory.
   */
  public selectedSlot: number = 0;

  /**
   * Creates a new entity inventory trait.
   * @param entity The entity that this trait will be attached to.
   */
  public constructor(
    entity: Entity,
    options?: Partial<EntityInventoryTraitOptions>
  ) {
    super(entity);

    // Create a new entity container
    this.container = new EntityContainer(
      entity,
      // Determine the container type
      entity.isPlayer()
        ? ContainerType.Inventory
        : (options?.type ?? ContainerType.Container),
      // Determine the container identifier
      entity.isPlayer()
        ? ContainerId.Inventory
        : (options?.identifier ?? ContainerId.None),
      // Determine the container size
      entity.isPlayer() ? 36 : (options?.size ?? 27)
    );
  }

  /**
   * Gets the held item in the inventory.
   * @returns The held item in the inventory.
   */
  public getHeldItem(): ItemStack | null {
    return this.container.getItem(this.selectedSlot);
  }

  /**
   * Sets the held item in the inventory.
   * @param slot The slot to set the held item to.
   */
  public setHeldItem(slot: number): void {
    // Check if the entity is not a player
    if (!this.entity.isPlayer()) return;

    // Create a new MobEquipmentPacket
    const packet = new MobEquipmentPacket();

    // Get the held item from the inventory
    const heldItem = this.getHeldItem();

    // Create a new item descriptor from the held item
    const itemDescriptor = heldItem
      ? ItemStack.toNetworkStack(heldItem)
      : new NetworkItemStackDescriptor(0);

    // Assign the packet properties
    packet.runtimeEntityId = this.entity.runtimeId;
    packet.containerId = this.container.identifier;
    packet.selectedSlot = slot;
    packet.slot = slot;
    packet.item = itemDescriptor;

    // Set the selected slot to the slot
    this.selectedSlot = slot;

    // Send the packet to the player
    this.entity.send(packet);
  }

  public onContainerUpdate(container: Container): void {
    // Check if the container is not the inventory container
    if (container !== this.container) return;

    // Prepare the items array
    const items: Array<[number, ItemStackEntry]> = [];

    // Iterate over the container slots
    for (let i = 0; i < this.container.size; i++) {
      // Get the item stack at the index
      const itemStack = this.container.getItem(i);

      // Check if the item is null
      if (!itemStack) continue;

      // Push the item stack entry to the inventory items
      items.push([i, itemStack.getDataEntry()]);
    }

    // Set the inventory property to the entity
    this.property = { size: this.container.size, items };
  }

  public onSpawn(): void {
    // Iterate over each item in the inventory property
    for (const [slot, entry] of this.property.items) {
      try {
        // Create a new item stack
        const itemStack = new ItemStack(entry.identifier, {
          amount: entry.amount,
          metadata: entry.metadata,
          world: this.entity.world,
          entry
        });

        // Set the item stack to the equipment slot
        this.container.setItem(slot, itemStack);
      } catch {
        // Log the error
        this.entity.world.logger.error(
          `Failed to create ItemStack with ItemType "${entry.identifier}", the type does not exist in the ItemPalette.`
        );
      }
    }
  }

  public onAdd(): void {
    // Check if the entity has an inventory property
    if (this.entity.hasDynamicProperty("inventory")) return;

    // Create the item storage property
    this.entity.setDynamicProperty<ItemStorage>("inventory", {
      size: this.container.size,
      items: []
    });

    // Create the container type metadata
    const type = new DataItem(
      ActorDataId.ContainerType,
      ActorDataType.Byte,
      this.container.type
    );

    // Create the container size metadata
    const set = new DataItem(
      ActorDataId.ContainerSize,
      ActorDataType.Int,
      this.container.size
    );

    // Set the container metadata
    this.entity.metadata.set(ActorDataId.ContainerType, type);
    this.entity.metadata.set(ActorDataId.ContainerSize, set);
  }

  public onRemove(): void {
    // Remove the item storage property
    this.entity.removeDynamicProperty("inventory");

    // Remove the container metadata
    this.entity.metadata.delete(ActorDataId.ContainerType);
    this.entity.metadata.delete(ActorDataId.ContainerSize);
  }

  public onInteract(player: Player, method: EntityInteractMethod): void {
    // Check if the method is not interact
    if (method !== EntityInteractMethod.Interact) return;

    // Check if the entity is a player, if so return
    if (this.entity.isPlayer()) return;

    // Show the inventory to the player
    this.container.show(player);
  }

  public onDeath(): void {
    // Check if the entity is a player, and the keep inventory gamerule is enabled
    if (this.entity.isPlayer() && this.entity.world.gamerules.keepInventory)
      return;

    // Iterate over the container slots
    for (let slot = 0; slot < this.container.size; slot++) {
      // Get the item stack at the index
      const itemStack = this.container.getItem(slot);

      // Check if the item is null
      if (!itemStack || itemStack.hasTrait(ItemKeepOnDieTrait)) continue;

      // Drop the item stack from the armor container
      const entity = this.dimension.spawnItem(itemStack, this.entity.position);

      // Generate a random motion vector
      const vx = Math.random() * 0.6 - 0.35;
      const vy = Math.random() * 0.35;
      const vz = Math.random() * 0.6 - 0.35;

      // Set the item stack motion vector
      entity.setMotion(new Vector3f(vx, vy, vz));

      // Clear the item stack from the armor container
      this.container.clearSlot(slot);
    }
  }
}

export { EntityInventoryTrait };
