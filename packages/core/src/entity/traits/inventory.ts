import {
  ContainerId,
  ContainerType,
  MobEquipmentPacket,
  NetworkItemStackDescriptor
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";
import { EntityContainer } from "../container";
import { Entity } from "../entity";
import { ItemStack } from "../../item";
import { ItemStackEntry, ItemStorage } from "../../types";
import { Container } from "../../container";

import { EntityTrait } from "./trait";

class EntityInventoryTrait extends EntityTrait {
  public static readonly identifier = "inventory";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The container that holds the inventory items.
   */
  public readonly container: EntityContainer;

  /**
   * The component used to store the inventory items.
   */
  public get component(): ItemStorage {
    return this.entity.getComponent("inventory") as ItemStorage;
  }

  /**
   * The component used to store the inventory items.
   */
  public set component(value: ItemStorage) {
    this.entity.setComponent<ItemStorage>("inventory", value);
  }

  /**
   * The selected slot in the inventory.
   */
  public selectedSlot: number = 0;

  /**
   * Creates a new entity inventory trait.
   * @param entity The entity that this trait will be attached to.
   */
  public constructor(entity: Entity) {
    super(entity);

    // Create a new container
    this.container = new EntityContainer(
      entity,
      ContainerType.Inventory,
      ContainerId.Inventory,
      36
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

    // Set the inventory component to the entity
    this.component = { size: this.container.size, items };
  }

  public onSpawn(): void {
    // Iterate over each item in the inventory component
    for (const [slot, entry] of this.component.items) {
      try {
        // Create a new item stack
        const itemStack = new ItemStack(entry.identifier, {
          amount: entry.amount,
          auxillary: entry.auxillary,
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
    // Check if the entity has an inventory component
    if (this.entity.hasComponent("inventory")) return;

    // Create the item storage component
    this.entity.setComponent<ItemStorage>("inventory", {
      size: this.container.size,
      items: []
    });
  }

  public onRemove(): void {
    // Remove the item storage component
    this.entity.removeComponent("inventory");
  }
}

export { EntityInventoryTrait };
