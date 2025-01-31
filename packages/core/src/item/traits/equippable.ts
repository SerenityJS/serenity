import {
  EquipmentSlot,
  ItemUseMethod,
  LevelSoundEvent,
  LevelSoundEventPacket,
  WearableSlot
} from "@serenityjs/protocol";

import { ItemIdentifier } from "../../enums";
import { EntityEquipmentTrait, Player } from "../../entity";
import { ItemUseOptions } from "../../types";
import { ItemTypeWearableComponent } from "../identity";
import { ItemStack } from "../stack";

import { ItemTrait } from "./trait";

class ItemEquippableTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "equippable";
  public static readonly tag = "minecraft:is_armor";
  public static readonly component = "minecraft:wearable";

  public onUse(player: Player, options: ItemUseOptions): ItemUseMethod | void {
    // Check if the item use method is not a click or if the use was canceled
    if (options.method !== ItemUseMethod.Interact || options.canceled) return;

    // Get the item type components
    const components = this.item.type.components;

    // Define the slot
    let slot = -1;

    // Check if the item has the wearable component
    if (components.has(ItemTypeWearableComponent)) {
      // Get the wearable component
      const component = components.get(ItemTypeWearableComponent);

      // Translate the wearable slot to an equipment slot
      slot = this.translateWearableSlot(component.slot);
    } else {
      // Find the equipment slot
      slot = this.findEquipmentSlot(this.item);
    }

    // Check if the slot is not valid
    if (slot === -1) return;

    // Get the player's equipment trait
    const equipment = player.getTrait(EntityEquipmentTrait);

    // Swap the item from the player's inventory to the equipment slot
    equipment.swapFromInventory(this.item.slot, slot);

    // Create a new LevelSoundEventPacket
    const packet = new LevelSoundEventPacket();

    // Get the item tags
    const tags = this.item.type.tags;

    // Assign the packet properties
    if (tags.includes("minecraft:leather_tier")) {
      packet.event = LevelSoundEvent.EquipLeather;
    } else if (tags.includes("minecraft:chainmail_tier")) {
      packet.event = LevelSoundEvent.EquipChain;
    } else if (tags.includes("minecraft:iron_tier")) {
      packet.event = LevelSoundEvent.EquipIron;
    } else if (tags.includes("minecraft:gold_tier")) {
      packet.event = LevelSoundEvent.EquipGold;
    } else if (tags.includes("minecraft:diamond_tier")) {
      packet.event = LevelSoundEvent.EquipDiamond;
    } else if (tags.includes("minecraft:netherite_tier")) {
      packet.event = LevelSoundEvent.EquipNetherite;
    } else {
      packet.event = LevelSoundEvent.EquipGeneric;
    }

    // Assign the packet properties
    packet.position = player.position;
    packet.actorIdentifier = player.type.identifier;
    packet.data = -1;
    packet.isBabyMob = false;
    packet.isGlobal = false;

    // Send the packet to the player
    player.send(packet);

    // Return the item use method
    return ItemUseMethod.EquipArmor;
  }

  private translateWearableSlot(slot: WearableSlot): EquipmentSlot | -1 {
    // Switch the wearable slot
    switch (slot) {
      case WearableSlot.Head:
        return EquipmentSlot.Head;

      case WearableSlot.Chest:
        return EquipmentSlot.Chest;

      case WearableSlot.Legs:
        return EquipmentSlot.Legs;

      case WearableSlot.Feet:
        return EquipmentSlot.Feet;
    }

    // Return -1 if the slot is not valid
    return -1;
  }

  private findEquipmentSlot(item: ItemStack): EquipmentSlot | -1 {
    // Switch the item identifier
    switch (item.identifier) {
      case ItemIdentifier.LeatherHelmet:
      case ItemIdentifier.ChainmailHelmet:
      case ItemIdentifier.IronHelmet:
      case ItemIdentifier.GoldenHelmet:
      case ItemIdentifier.DiamondHelmet:
      case ItemIdentifier.NetheriteHelmet:
        return EquipmentSlot.Head;

      case ItemIdentifier.LeatherChestplate:
      case ItemIdentifier.ChainmailChestplate:
      case ItemIdentifier.IronChestplate:
      case ItemIdentifier.GoldenChestplate:
      case ItemIdentifier.DiamondChestplate:
      case ItemIdentifier.NetheriteChestplate:
        return EquipmentSlot.Chest;

      case ItemIdentifier.LeatherLeggings:
      case ItemIdentifier.ChainmailLeggings:
      case ItemIdentifier.IronLeggings:
      case ItemIdentifier.GoldenLeggings:
      case ItemIdentifier.DiamondLeggings:
      case ItemIdentifier.NetheriteLeggings:
        return EquipmentSlot.Legs;

      case ItemIdentifier.LeatherBoots:
      case ItemIdentifier.ChainmailBoots:
      case ItemIdentifier.IronBoots:
      case ItemIdentifier.GoldenBoots:
      case ItemIdentifier.DiamondBoots:
      case ItemIdentifier.NetheriteBoots:
        return EquipmentSlot.Feet;
    }

    // Return -1 if the item is not equippable
    return -1;
  }
}

export { ItemEquippableTrait };
