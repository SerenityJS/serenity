import { CompoundTag, IntTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

interface ItemTypeDurabilityDamageChance {
  /**
   * The maximum chance of damage occurring when using the item.
   */
  max: number;

  /**
   * The minimum chance of damage occurring when using the item.
   */
  min: number;
}

interface ItemTypeDurabilityComponentOptions {
  /**
   * The chance of the item taking damage when used.
   */
  damage_chance: ItemTypeDurabilityDamageChance;

  /**
   * The maximum durability of the item type.
   */
  max_durability: number;
}

class ItemTypeDurabilityComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:durability";

  /**
   * Create a new item type durability component.
   * @param type The item type of the component.
   * @param options The options for the component.
   */
  public constructor(
    type: ItemType,
    options?: Partial<ItemTypeDurabilityComponentOptions>
  ) {
    super(type);

    // Set the default values.
    this.setDamageChance(options?.damage_chance ?? { max: 1, min: 1 });
    this.setMaxDurability(options?.max_durability ?? 25);
  }

  /**
   * Get the damage chance of the durability component.
   * @returns The damage chance of the durability component.
   */
  public getDamageChance(): ItemTypeDurabilityDamageChance {
    // Get the damage chance tag from the component.
    const damageChance = this.component.get<CompoundTag>("damage_chance");

    // Get the max and min values from the damage chance tag.
    const max = damageChance?.get<IntTag>("max")?.valueOf() ?? 0;
    const min = damageChance?.get<IntTag>("min")?.valueOf() ?? 0;

    // Return the damage chance.
    return { max, min };
  }

  /**
   * Set the damage chance of the durability component.
   * @param value The damage chance of the durability component.
   */
  public setDamageChance(value: ItemTypeDurabilityDamageChance): void {
    // Create a new damage chance tag.
    const damageChance = new CompoundTag("damage_chance");

    // Set the max and min values.
    damageChance.add(new IntTag(value.max, "max"));
    damageChance.add(new IntTag(value.min, "min"));

    // Add the damage chance tag to the component.
    this.component.add(damageChance);
  }

  /**
   * Get the maximum durability of the item type.
   * @returns The maximum durability of the item type.
   */
  public getMaxDurability(): number {
    // Get the max durability tag from the component.
    const maxDurability = this.component.get<IntTag>("max_durability");

    // Return the max durability value.
    return maxDurability?.valueOf() ?? 0;
  }

  /**
   * Set the maximum durability of the item type.
   * @param value The maximum durability of the item type.
   */
  public setMaxDurability(value: number): void {
    // Add the max durability tag to the component.
    this.component.add(new IntTag(value, "max_durability"));
  }
}

export {
  ItemTypeDurabilityComponent,
  ItemTypeDurabilityDamageChance,
  ItemTypeDurabilityComponentOptions
};
