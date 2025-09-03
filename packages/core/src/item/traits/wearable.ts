import {
  EquipmentSlot,
  ItemUseMethod,
  LevelSoundEvent,
  LevelSoundEventPacket,
  WearableSlot
} from "@serenityjs/protocol";

import { ItemWearableTier } from "../../enums";
import { ItemStack } from "../stack";
import { Entity, EntityEquipmentTrait, Player } from "../../entity";
import { ItemTypeWearableComponent } from "../identity";

import { ItemStackTrait } from "./trait";

import type { JSONLikeObject } from "../../types";
import type { ItemStackUseOptions } from "../types";

interface ItemStackWearableTraitProperties extends JSONLikeObject {
  /**
   * The amount of protection the wearable item provides.
   */
  protection: number;

  /**
   * The slot the wearable item can be equipped to.
   */
  slot: WearableSlot;

  /**
   * The tier of the wearable item.
   */
  tier: ItemWearableTier;
}

class ItemStackWearableTrait extends ItemStackTrait {
  public static readonly identifier = "wearable";

  // If the base item type contains this tag, it is considered wearable.
  public static readonly tag = "minecraft:is_armor";

  // If the base item type contains this component, it is considered wearable.
  public static readonly component = ItemTypeWearableComponent;

  /**
   * The dynamic properties of the wearable trait.
   */
  public get properties(): ItemStackWearableTraitProperties {
    // Check if the item has a dynamic property for the wearable trait
    if (!this.item.hasDynamicProperty(this.identifier)) {
      // Create a new dynamic property for the wearable trait
      this.item.setDynamicProperty<ItemStackWearableTraitProperties>(
        ItemStackWearableTrait.identifier,
        {
          protection: 0,
          slot: WearableSlot.Offhand,
          tier: ItemWearableTier.Generic
        }
      );
    }

    // Return the dynamic property for the wearable trait
    return this.item.getDynamicProperty(
      ItemStackWearableTrait.identifier
    ) as ItemStackWearableTraitProperties;
  }

  /**
   * The amount of protection the wearable item provides.
   */
  public get protection(): number {
    return this.properties.protection;
  }

  /**
   * The amount of protection the wearable item provides.
   */
  public set protection(value: number) {
    this.properties.protection = value;
  }

  /**
   * The slot the wearable item can be equipped to.
   */
  public get slot(): WearableSlot {
    return this.properties.slot;
  }

  /**
   * The slot the wearable item can be equipped to.
   */
  public set slot(value: WearableSlot) {
    this.properties.slot = value;
  }

  /**
   * Create a new wearable trait for the item stack.
   * @param item The item stack to apply the wearable trait to.
   * @param properties The optional properties of the wearable trait.
   */
  public constructor(
    item: ItemStack,
    properties?: Partial<ItemStackWearableTraitProperties>
  ) {
    super(item);

    // Assign the properties to the wearable trait
    if (properties) Object.assign(this.properties, properties);
    else {
      // Check if the item type has the wearable component
      // This is usually for custom item types
      if (item.hasComponent(ItemTypeWearableComponent)) {
        // Get the wearable component from the item type
        const component = item.getComponent(ItemTypeWearableComponent);

        // Assign the properties from the component to the wearable trait
        this.properties.protection = component.getProtection();
        this.properties.slot = component.getWearableSlot();
      }
      // This will be for vanilla item types
      // Check if the item type has an armor tag
      else {
        // Slot will be determined by the item type identifier
        if (item.type.identifier.endsWith("helmet")) {
          this.properties.slot = WearableSlot.Head;
        } else if (item.type.identifier.endsWith("chestplate")) {
          this.properties.slot = WearableSlot.Chest;
        } else if (item.type.identifier.endsWith("leggings")) {
          this.properties.slot = WearableSlot.Legs;
        } else if (item.type.identifier.endsWith("boots")) {
          this.properties.slot = WearableSlot.Feet;
        }

        // Get the item tags
        const tags = this.item.type.getTags();

        // Tier will be determined by if the item contains a specific tag
        if (tags.includes("minecraft:minecraft:leather_tier")) {
          this.properties.tier = ItemWearableTier.Leather;
          this.properties.protection = 1;
        } else if (tags.includes("minecraft:chainmail_tier")) {
          this.properties.tier = ItemWearableTier.Chainmail;
          this.properties.protection = 2;
        } else if (tags.includes("minecraft:copper_tier")) {
          this.properties.tier = ItemWearableTier.Copper;
          this.properties.protection = 2;
        } else if (tags.includes("minecraft:iron_tier")) {
          this.properties.tier = ItemWearableTier.Iron;
          this.properties.protection = 3;
        } else if (tags.includes("minecraft:gold_tier")) {
          this.properties.tier = ItemWearableTier.Gold;
          this.properties.protection = 4;
        } else if (tags.includes("minecraft:diamond_tier")) {
          this.properties.tier = ItemWearableTier.Diamond;
          this.properties.protection = 5;
        } else if (tags.includes("minecraft:netherite_tier")) {
          this.properties.tier = ItemWearableTier.Netherite;
          this.properties.protection = 6;
        }
      }
    }
  }

  /**
   * Equip the wearable item to the entity.
   * @param entity The entity to equip the item to.
   */
  public equip(entity: Entity): void {
    // Check if the entity does not have an equipment trait
    // If it does not, add the equipment trait to the entity
    if (!entity.hasTrait(EntityEquipmentTrait))
      entity.addTrait(EntityEquipmentTrait);

    // Get the entity's equipment trait
    const equipment = entity.getTrait(EntityEquipmentTrait);

    // Get the current slot of the item
    const currentSlot = this.item.slot;

    // Check if the item isn't in a container
    if (currentSlot === -1)
      // Set the item to the equipment slot
      return equipment.setEquipment(this.getEquipmentSlot(), this.item);

    // Swap the item from the player's inventory to the equipment slot
    equipment.swapFromInventory(currentSlot, this.getEquipmentSlot());
  }

  /**
   * Get the equipment slot of the wearable item.
   * @returns The equipment slot of the wearable item.
   */
  public getEquipmentSlot(): EquipmentSlot {
    return Object.values(WearableSlot).indexOf(this.properties.slot);
  }

  public onUse(
    player: Player,
    options: ItemStackUseOptions
  ): ItemUseMethod | void {
    // Check if the item use method is not a click or if the use was canceled
    if (options.method !== ItemUseMethod.Interact || options.canceled) return;

    // Equip the wearable item to the player
    this.equip(player);

    // Create a new LevelSoundEventPacket
    const packet = new LevelSoundEventPacket();

    // Switch the tier of the wearable item
    switch (this.properties.tier) {
      case ItemWearableTier.Generic: {
        packet.event = LevelSoundEvent.EquipGeneric;
        break;
      }

      case ItemWearableTier.Leather: {
        packet.event = LevelSoundEvent.EquipLeather;
        break;
      }

      case ItemWearableTier.Chainmail: {
        packet.event = LevelSoundEvent.EquipChain;
        break;
      }

      case ItemWearableTier.Iron: {
        packet.event = LevelSoundEvent.EquipIron;
        break;
      }

      case ItemWearableTier.Gold: {
        packet.event = LevelSoundEvent.EquipGold;
        break;
      }

      case ItemWearableTier.Diamond: {
        packet.event = LevelSoundEvent.EquipDiamond;
        break;
      }

      case ItemWearableTier.Netherite: {
        packet.event = LevelSoundEvent.EquipNetherite;
        break;
      }
    }

    // Assign the packet properties
    packet.position = player.position;
    packet.actorIdentifier = player.type.identifier;
    packet.data = -1;
    packet.isBabyMob = false;
    packet.isGlobal = false;
    packet.uniqueActorId = -1n;

    // Broadcast the packet to the dimension
    player.dimension.broadcast(packet);

    // Return the item use method
    return ItemUseMethod.EquipArmor;
  }
}

export { ItemStackWearableTrait, ItemStackWearableTraitProperties };
