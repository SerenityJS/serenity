import {
  EquipmentSlot,
  LevelSoundEvent,
  LevelSoundEventPacket
} from "@serenityjs/protocol";

import { ItemIdentifier, ItemUseMethod } from "../../enums";
import {
  EntityEquipmentTrait,
  EntityInventoryTrait,
  Player
} from "../../entity";
import { ItemUseOptions } from "../../types";

import { ItemTrait } from "./trait";

class ItemEquippableTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "equippable";
  public slot?: EquipmentSlot = EquipmentSlot.Chest;
  public static types: Array<ItemIdentifier> = [
    ItemIdentifier.DiamondChestplate
  ];

  public onUse(
    player: Player,
    options: Partial<ItemUseOptions>
  ): boolean | void {
    if (options.method != ItemUseMethod.Click || this.slot == undefined)
      return false;
    const playerEquipment = player.getTrait(EntityEquipmentTrait);

    if (!playerEquipment) return false;
    const playerInventory = player.getTrait(EntityInventoryTrait);
    const soundPacket = new LevelSoundEventPacket();
    soundPacket.event = LevelSoundEvent.EquipGeneric;
    soundPacket.position = player.position;
    soundPacket.actorIdentifier = player.type.identifier;
    soundPacket.data = -1;
    soundPacket.isBabyMob = false;
    soundPacket.isGlobal = false;

    player.send(soundPacket);

    playerInventory.container.swapItems(
      playerInventory.selectedSlot,
      this.slot,
      playerEquipment.container
    );
    return true;
  }
}

export { ItemEquippableTrait };
