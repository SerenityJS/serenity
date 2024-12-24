import {
  ContainerId,
  ContainerName,
  ContainerType,
  EquipmentSlot,
  MobArmorEquipmentPacket
} from "@serenityjs/protocol";

import { EntityContainer } from "../container";
import { Entity } from "../entity";
import { ItemStack } from "../../item";
import { ItemStackEntry, ItemStorage } from "../../types";
import { EntityIdentifier } from "../../enums";
import { Container } from "../..";

import { EntityTrait } from "./trait";
class EntityEquipmentTrait extends EntityTrait {
  public static readonly identifier = "equipment";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The armor container that holds the equipment items.
   */
  public readonly container: EntityContainer;

  /**
   * The component used to store the equipment items.
   */
  public get component(): ItemStorage {
    return this.entity.getComponent("equipment") as ItemStorage;
  }

  /**
   * The component used to store the equipment items.
   */
  public set component(value: ItemStorage) {
    this.entity.setComponent<ItemStorage>("equipment", value);
  }

  public constructor(entity: Entity) {
    super(entity);

    this.container = new EntityContainer(
      entity,
      ContainerType.Armor,
      ContainerId.Armor,
      4
    );
  }

  /**
   * Equips the given item to given slot in the entity equipment.
   * @param slot The item where the item will be placed
   * @param itemStack The item that will be placed
   */
  public setEquipment(slot: EquipmentSlot, itemStack: ItemStack): void {
    this.container.setItem(slot, itemStack);
  }

  /**
   * Gets the equipment item at the given slot.
   * @param slot The slot to get the equipment
   * @returns The item in the desired slot if existing.
   */
  public getEquipment(slot: EquipmentSlot): ItemStack | null {
    return this.container.getItem(slot);
  }

  public swapFromInventory(slot: number, equipmentSlot: EquipmentSlot): void {
    // Get the inventory container
    const inventory = this.entity.getContainer(ContainerName.Inventory);

    // Check if the inventory container is null
    if (!inventory) return;

    inventory.swapItems(slot, equipmentSlot, this.container);
  }

  public onContainerUpdate(container: Container): void {
    // Check if the container is the equipment container
    if (container !== this.container) return;

    // Create a new equipment packet
    const packet = new MobArmorEquipmentPacket();

    // Set the runtime ID of the entity
    packet.runtimeId = this.entity.runtimeId;

    packet.helmet = ItemStack.toNetworkStack(
      this.getEquipment(EquipmentSlot.Head) ?? ItemStack.empty()
    );

    packet.chestplate = ItemStack.toNetworkStack(
      this.getEquipment(EquipmentSlot.Chest) ?? ItemStack.empty()
    );

    packet.leggings = ItemStack.toNetworkStack(
      this.getEquipment(EquipmentSlot.Legs) ?? ItemStack.empty()
    );

    packet.boots = ItemStack.toNetworkStack(
      this.getEquipment(EquipmentSlot.Feet) ?? ItemStack.empty()
    );

    packet.body = ItemStack.toNetworkStack(
      this.getEquipment(EquipmentSlot.Chest) ?? ItemStack.empty()
    );

    // Broadcast the packet to the dimension
    this.entity.dimension.broadcast(packet);
  }

  public onSpawn(): void {
    // Iterate over the equipment slots
    for (const [slot, entry] of this.component.items) {
      // Create a new item stack
      const itemStack = new ItemStack(entry.identifier, {
        amount: entry.amount,
        auxillary: entry.auxillary,
        world: this.entity.world,
        entry
      });

      // Set the item stack to the equipment slot
      this.setEquipment(slot as EquipmentSlot, itemStack);
    }
  }

  public onDespawn(): void {
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

    // Set the equipment component to the entity
    this.component = { size: this.container.size, items };
  }

  public onAdd(): void {
    // Check if the entity has an equipment component
    if (this.entity.hasComponent("equipment")) return;

    // Create the item storage component
    this.entity.setComponent<ItemStorage>("equipment", {
      size: this.container.size,
      items: []
    });
  }

  public onRemove(): void {
    // Remove the item storage component
    this.entity.removeComponent("equipment");
  }
}

export { EntityEquipmentTrait };
