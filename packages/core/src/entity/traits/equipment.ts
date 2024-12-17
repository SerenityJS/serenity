import {
  ContainerId,
  ContainerType,
  EquipmentSlot
} from "@serenityjs/protocol";

import { EntityContainer } from "../container";
import { Entity } from "../entity";
import { ItemStack } from "../../item";
import { ItemStackEntry, JSONLikeObject } from "../../types";
import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

interface EquipmentEntry extends JSONLikeObject {
  [x: number]: ItemStackEntry;
}

class EntityEquipmentTrait extends EntityTrait {
  public static readonly identifier = "equipment";

  public static readonly types = [EntityIdentifier.Player];

  public readonly container: EntityContainer;

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

  public onSpawn(): void {
    if (!this.entity.components.has("equipment")) return;
    const equipment = this.entity.components.get("equipment") as EquipmentEntry;

    for (const slot in equipment) {
      const entry = equipment[slot] as ItemStackEntry;

      const itemStack = new ItemStack(entry.identifier, {
        amount: entry.amount,
        auxillary: entry.auxillary,
        world: this.entity.world,
        entry
      });
      this.setEquipment(Number.parseInt(slot), itemStack);
    }
  }

  public onDespawn(): void {
    const equipment: EquipmentEntry = {};

    for (const itemStack of this.container.storage) {
      if (!itemStack) continue;
      equipment[this.container.storage.indexOf(itemStack)] =
        itemStack.getDataEntry();
    }
    this.entity.components.set("equipment", equipment);
    console.dir(this.entity.components.get("equipment"), {
      depth: Infinity,
      colors: true
    });
  }
}

export { EntityEquipmentTrait };
