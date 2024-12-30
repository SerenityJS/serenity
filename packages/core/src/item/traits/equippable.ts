import {
  EquipmentSlot,
  ItemUseMethod,
  LevelSoundEvent,
  LevelSoundEventPacket
} from "@serenityjs/protocol";

import { ItemIdentifier } from "../../enums";
import { EntityEquipmentTrait, Player } from "../../entity";
import { ItemUseOptions } from "../../types";

import { ItemTrait } from "./trait";

class ItemEquippableTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "equippable";
  public static readonly tag = "minecraft:is_armor";
  public onUse(player: Player, options: ItemUseOptions): ItemUseMethod | void {
    // Check if the item use method is not a click or if the use was canceled
    if (options.method !== ItemUseMethod.Interact || options.canceled) return;

    // Get the player's equipment trait
    const equipment = player.getTrait(EntityEquipmentTrait);

    // Switch the item identifier
    switch (this.item.identifier) {
      case ItemIdentifier.LeatherHelmet:
      case ItemIdentifier.ChainmailHelmet:
      case ItemIdentifier.IronHelmet:
      case ItemIdentifier.GoldenHelmet:
      case ItemIdentifier.DiamondHelmet:
      case ItemIdentifier.NetheriteHelmet:
        equipment.swapFromInventory(this.item.slot, EquipmentSlot.Head);
        break;

      case ItemIdentifier.LeatherChestplate:
      case ItemIdentifier.ChainmailChestplate:
      case ItemIdentifier.IronChestplate:
      case ItemIdentifier.GoldenChestplate:
      case ItemIdentifier.DiamondChestplate:
      case ItemIdentifier.NetheriteChestplate:
        equipment.swapFromInventory(this.item.slot, EquipmentSlot.Chest);
        break;

      case ItemIdentifier.LeatherLeggings:
      case ItemIdentifier.ChainmailLeggings:
      case ItemIdentifier.IronLeggings:
      case ItemIdentifier.GoldenLeggings:
      case ItemIdentifier.DiamondLeggings:
      case ItemIdentifier.NetheriteLeggings:
        equipment.swapFromInventory(this.item.slot, EquipmentSlot.Legs);
        break;

      case ItemIdentifier.LeatherBoots:
      case ItemIdentifier.ChainmailBoots:
      case ItemIdentifier.IronBoots:
      case ItemIdentifier.GoldenBoots:
      case ItemIdentifier.DiamondBoots:
      case ItemIdentifier.NetheriteBoots:
        equipment.swapFromInventory(this.item.slot, EquipmentSlot.Feet);
        break;
    }

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
}

export { ItemEquippableTrait };
