import { CompoundTag, ListTag, ShortTag, TagType } from "@serenityjs/nbt";
import { Enchantment } from "@serenityjs/protocol";

import { ItemIdentifier } from "../../enums";

import { ItemTrait } from "./trait";

interface EnchantmentValue {
  id: ShortTag;
  lvl: ShortTag;
}

class ItemEnchantableTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "enchantable";

  /**
   * Gets the enchantments on the item stack.
   * @returns The map of enchantments.
   */
  public getEnchantments(): Map<Enchantment, number> {
    // Get the enchantment list tag from the item stack's NBT
    const ench =
      this.item.nbt.get<ListTag<CompoundTag<EnchantmentValue>>>("ench");

    // Create a new map to store the enchantments
    const enchantments = new Map<Enchantment, number>();

    // Check if the enchantment list tag exists
    if (ench)
      // Iterate over each enchantment in the list tag
      for (const { value } of ench.value)
        enchantments.set(value.id.value, value.lvl.value);

    // Return the map of enchantments
    return enchantments;
  }

  /**
   * Gets an enchantment level from the item stack.
   * @param id The enchantment id.
   * @returns The enchantment level if it exists; otherwise, null.
   */
  public getEnchantment(id: Enchantment): number | null {
    // Get the enchantment list tag from the item stack's NBT
    const enchantments = this.getEnchantments();

    // Return the enchantment level if the enchantment exists
    return enchantments.get(id) ?? null;
  }

  /**
   * Checks if the item stack has an enchantment.
   * @param id The enchantment id.
   * @returns Whether the item stack has the enchantment.
   */
  public hasEnchantment(id: Enchantment): boolean {
    return this.getEnchantment(id) !== null;
  }

  /**
   * Adds an enchantment to the item stack.
   * @param id The enchantment id.
   * @param level The enchantment level.
   */
  public addEnchantment(id: Enchantment, level: number): void {
    // Get the enchantment list tag from the item stack's NBT
    const ench =
      this.item.nbt.get<ListTag<CompoundTag<EnchantmentValue>>>("ench");

    // Check if the enchantment list tag exists
    if (ench) {
      // Create a new enchantment value
      const value = new CompoundTag<EnchantmentValue>();

      // Set the enchantment value's id and level
      value.createShortTag({ name: "id", value: id });
      value.createShortTag({ name: "lvl", value: level });

      // Add the enchantment value to the list tag
      ench.push(value);
    }

    // Set the nbt's enchantment list tag
    this.item.nbt.set("ench", ench);
  }

  /**
   * Gets the enchantment list tag from the item stack's NBT.
   * @returns The enchantment list tag.
   */
  public getNbt(): ListTag<CompoundTag<EnchantmentValue>> {
    return this.item.nbt.get<ListTag<CompoundTag<EnchantmentValue>>>("ench");
  }

  public onAdd(): void {
    // Check if the item has the enchantment list tag
    if (!this.item.nbt.has("ench")) {
      // Create the enchantment list tag
      const ench = new ListTag({
        name: "ench",
        value: [],
        listType: TagType.Compound
      });

      // Add the enchantment list tag to the item stack's NBT
      this.item.nbt.add(ench);
    }
  }

  public onRemove(): void {
    // Remove the enchantment list tag from the item stack's NBT
    this.item.nbt.delete("ench");
  }
}

export { ItemEnchantableTrait };
