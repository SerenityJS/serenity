import {
  ContainerId,
  ContainerType,
  Enchantment,
  EquipmentSlot,
  MobArmorEquipmentPacket,
  Vector3f
} from "@serenityjs/protocol";

import { EntityContainer } from "../container";
import { Entity } from "../entity";
import { EntityIdentifier } from "../../enums";
import {
  ItemStackEnchantableTrait,
  ItemStackKeepOnDieTrait,
  ItemStack,
  ItemStackWearableTrait
} from "../../item";
import { Container } from "../../container";

import { EntityInventoryTrait } from "./inventory";
import { EntityTrait } from "./trait";

import type { JSONLikeObject } from "../../types";
import type { ItemStackDataEntry } from "../../item";

interface EntityEquipmentTraitProperties extends JSONLikeObject {
  head: ItemStackDataEntry | null;
  chest: ItemStackDataEntry | null;
  legs: ItemStackDataEntry | null;
  feet: ItemStackDataEntry | null;
  offhand: ItemStackDataEntry | null;
}

class EntityEquipmentTrait extends EntityTrait {
  public static readonly identifier = "equipment";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The armor container that holds the equipment items.
   */
  public readonly armor: EntityContainer;

  /**
   * The offhand container that holds the equipment items.
   */
  public readonly offhand: EntityContainer;

  /**
   * The dynamic property used to store the equipment items.
   */
  public get properties(): EntityEquipmentTraitProperties {
    // Check if the entity has a dynamic property for the equipment trait
    if (!this.entity.hasDynamicProperty(this.identifier)) {
      // Create a new dynamic property for the equipment trait
      this.entity.setDynamicProperty<EntityEquipmentTraitProperties>(
        this.identifier,
        {
          head: null,
          chest: null,
          legs: null,
          feet: null,
          offhand: null
        }
      );
    }

    // Return the dynamic property for the equipment trait
    return this.entity.getDynamicProperty(
      this.identifier
    ) as EntityEquipmentTraitProperties;
  }

  /**
   * Create a new equipment trait for the entity.
   * @param entity The entity to apply the equipment trait to.
   * @param properties The optional properties of the equipment trait.
   */
  public constructor(
    entity: Entity,
    properties?: Partial<EntityEquipmentTraitProperties>
  ) {
    super(entity);

    // Create the armor container
    this.armor = new EntityContainer(
      entity,
      ContainerType.Armor,
      ContainerId.Armor,
      4
    );

    // Create the offhand container
    this.offhand = new EntityContainer(
      entity,
      ContainerType.Inventory,
      ContainerId.Offhand,
      1
    );

    // Assign the properties to the equipment trait, if defined
    if (properties) Object.assign(this.properties, properties);
  }

  /**
   * Sets an item stack to a specific equipment slot.
   * @param slot The equipment slot to set the item stack to.
   * @param itemStack The item stack to set to the equipment slot.
   */
  public setEqupment(slot: EquipmentSlot, itemStack: ItemStack): void {
    // Check if the slot is the head slot
    if (slot === EquipmentSlot.Offhand)
      // Set the item stack to the offhand container
      return this.offhand.setItem(0, itemStack);

    // Set the item stack to the armor container
    this.armor.setItem(slot, itemStack);
  }

  /**
   * Gets the item stack from a specific equipment slot.
   * @param slot The equipment slot to get the item stack from.
   * @returns The item stack from the equipment slot; otherwise, null.
   */
  public getEquipment(slot: EquipmentSlot): ItemStack | null {
    // Check if the slot is the head slot
    if (slot === EquipmentSlot.Offhand)
      // Get the item stack from the offhand container
      return this.offhand.getItem(0);

    // Get the item stack from the armor container
    return this.armor.getItem(slot);
  }

  /**
   * Swaps an item stack from the inventory to an equipment slot.
   * @param slot The slot of the item stack in the inventory.
   * @param equipmentSlot The equipment slot to swap the item stack to.
   */
  public swapFromInventory(slot: number, equipmentSlot: EquipmentSlot): void {
    // Get the inventory trait of the entity
    const inventory = this.entity.getTrait(EntityInventoryTrait);

    // Check if the entity does not have an inventory trait
    if (!inventory) throw new Error("Entity does not have an inventory trait.");

    // Get the item stack from the inventory slot
    const itemStack = inventory.container.getItem(slot);

    // Check if the item stack is null
    if (!itemStack) return;

    // Check if the equipment slot is the offhand slot
    if (equipmentSlot === EquipmentSlot.Offhand)
      return inventory.container.swapItems(slot, equipmentSlot, this.offhand);

    // Swap the item stack from the inventory to the equipment slot
    inventory.container.swapItems(slot, equipmentSlot, this.armor);
  }

  /**
   * Calculates the total protection of the armor items.
   * @returns The total protection of the armor items.
   */
  public calculateArmorProtection(): number {
    // Get the armor items from the equipment trait
    const head = this.getEquipment(EquipmentSlot.Head);
    const chest = this.getEquipment(EquipmentSlot.Chest);
    const legs = this.getEquipment(EquipmentSlot.Legs);
    const feet = this.getEquipment(EquipmentSlot.Feet);

    let protection = 0;

    // Get the protection values of the armor items
    protection += head?.getTrait(ItemStackWearableTrait)?.protection ?? 0;
    protection += chest?.getTrait(ItemStackWearableTrait)?.protection ?? 0;
    protection += legs?.getTrait(ItemStackWearableTrait)?.protection ?? 0;
    protection += feet?.getTrait(ItemStackWearableTrait)?.protection ?? 0;

    // Check if the head item is enchantable
    if (head?.hasTrait(ItemStackEnchantableTrait)) {
      const enchantable = head.getTrait(ItemStackEnchantableTrait);

      // Get the protection enchantments of the head item
      protection += enchantable.getEnchantment(Enchantment.Protection) ?? 0;
    }

    // Check if the chest item is enchantable
    if (chest?.hasTrait(ItemStackEnchantableTrait)) {
      const enchantable = chest.getTrait(ItemStackEnchantableTrait);

      // Get the protection enchantments of the chest item
      protection += enchantable.getEnchantment(Enchantment.Protection) ?? 0;
    }

    // Check if the legs item is enchantable
    if (legs?.hasTrait(ItemStackEnchantableTrait)) {
      const enchantable = legs.getTrait(ItemStackEnchantableTrait);

      // Get the protection enchantments of the legs item
      protection += enchantable.getEnchantment(Enchantment.Protection) ?? 0;
    }

    // Check if the feet item is enchantable
    if (feet?.hasTrait(ItemStackEnchantableTrait)) {
      const enchantable = feet.getTrait(ItemStackEnchantableTrait);

      // Get the protection enchantments of the feet item
      protection += enchantable.getEnchantment(Enchantment.Protection) ?? 0;
    }

    // Calculate the total protection of the armor items
    return protection;
  }

  public onContainerUpdate(container: Container): void {
    // Check if the container is not the armor or offhand container
    if (container !== this.armor && container !== this.offhand) return;

    const head = this.armor.getItem(EquipmentSlot.Head);
    const chest = this.armor.getItem(EquipmentSlot.Chest);
    const legs = this.armor.getItem(EquipmentSlot.Legs);
    const feet = this.armor.getItem(EquipmentSlot.Feet);
    const offhand = this.offhand.getItem(0);

    // Assign the head item to the properties
    this.properties.head = head ? head.getDataEntry() : null;

    // Assign the chest item to the properties
    this.properties.chest = chest ? chest.getDataEntry() : null;

    // Assign the legs item to the properties
    this.properties.legs = legs ? legs.getDataEntry() : null;

    // Assign the feet item to the properties
    this.properties.feet = feet ? feet.getDataEntry() : null;

    // Assign the offhand item to the properties
    this.properties.offhand = offhand ? offhand.getDataEntry() : null;

    // Create a new MobArmorEquipmentPacket, and assign the equipment properties
    const packet = new MobArmorEquipmentPacket();
    packet.runtimeId = this.entity.runtimeId;
    packet.helmet = ItemStack.toNetworkStack(head ?? ItemStack.empty());
    packet.chestplate = ItemStack.toNetworkStack(chest ?? ItemStack.empty());
    packet.leggings = ItemStack.toNetworkStack(legs ?? ItemStack.empty());
    packet.boots = ItemStack.toNetworkStack(feet ?? ItemStack.empty());
    packet.body = ItemStack.toNetworkStack(offhand ?? ItemStack.empty());

    // Broadcast the packet to the dimension of the entity
    this.entity.dimension.broadcast(packet);
  }

  public onSpawn(): void {
    // Get the equipment properties
    // Clone the properties to avoid reference issues
    const properties = { ...this.properties };

    // Check if a head item is defined
    if (properties.head) {
      // Create a new item stack using the head item entry
      const itemStack = ItemStack.fromDataEntry(properties.head);

      // Set the item stack to the head equipment slot
      this.setEqupment(EquipmentSlot.Head, itemStack);
    }

    // Check if a chest item is defined
    if (properties.chest) {
      // Create a new item stack using the chest item entry
      const itemStack = ItemStack.fromDataEntry(properties.chest);

      // Set the item stack to the chest equipment slot
      this.setEqupment(EquipmentSlot.Chest, itemStack);
    }

    // Check if a legs item is defined
    if (properties.legs) {
      // Create a new item stack using the legs item entry
      const itemStack = ItemStack.fromDataEntry(properties.legs);

      // Set the item stack to the legs equipment slot
      this.setEqupment(EquipmentSlot.Legs, itemStack);
    }

    // Check if a feet item is defined
    if (properties.feet) {
      // Create a new item stack using the feet item entry
      const itemStack = ItemStack.fromDataEntry(properties.feet);

      // Set the item stack to the feet equipment slot
      this.setEqupment(EquipmentSlot.Feet, itemStack);
    }

    // Check if an offhand item is defined
    if (properties.offhand) {
      // Create a new item stack using the offhand item entry
      const itemStack = ItemStack.fromDataEntry(properties.offhand);

      // Set the item stack to the offhand equipment slot
      this.setEqupment(EquipmentSlot.Offhand, itemStack);
    }
  }

  public onRemove(): void {
    // Remove the equipment properties
    this.entity.removeDynamicProperty(this.identifier);
  }

  public onDeath(): void {
    // Check if the entity is a player, and the keep inventory gamerule is enabled
    if (this.entity.isPlayer() && this.entity.world.gamerules.keepInventory)
      return;

    // Iterate over the armor container slots
    for (let slot = 0; slot < this.armor.size; slot++) {
      // Get the item stack from the armor container
      const itemStack = this.armor.getItem(slot);

      // Check if the item stack is null
      if (!itemStack || itemStack.hasTrait(ItemStackKeepOnDieTrait)) continue;

      // Drop the item stack from the armor container
      const entity = this.dimension.spawnItem(itemStack, this.entity.position);

      // Generate a random motion vector
      const vx = Math.random() * 1 - 0.5;
      const vy = Math.random() * 0.5;
      const vz = Math.random() * 1 - 0.5;

      // Set the item stack motion vector
      entity.setMotion(new Vector3f(vx, vy, vz));

      // Clear the item stack from the armor container
      this.armor.clearSlot(slot);
    }

    // Iterate over the offhand container slots
    for (let slot = 0; slot < this.offhand.size; slot++) {
      // Get the item stack from the offhand container
      const itemStack = this.offhand.getItem(slot);

      // Check if the item stack is null
      if (!itemStack || itemStack.hasTrait(ItemStackKeepOnDieTrait)) continue;

      // Drop the item stack from the offhand container
      const entity = this.dimension.spawnItem(itemStack, this.entity.position);

      // Generate a random motion vector
      const vx = Math.random() * 1 - 0.5;
      const vy = Math.random() * 0.5;
      const vz = Math.random() * 1 - 0.5;

      // Set the item stack motion vector
      entity.setMotion(new Vector3f(vx, vy, vz));

      // Clear the item stack from the offhand container
      this.offhand.clearSlot(slot);
    }
  }
}

export { EntityEquipmentTrait };
