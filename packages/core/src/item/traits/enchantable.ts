import { CompoundTag, ListTag, ShortTag } from "@serenityjs/nbt";
import { Enchantment } from "@serenityjs/protocol";

import { ItemStackTrait } from "./trait";

class ItemStackEnchantableTrait extends ItemStackTrait {
  public static readonly identifier = "enchantable";

  /**
   * Gets the enchantments on the item stack.
   * @returns The map of enchantments.
   */
  public getEnchantments(): Map<Enchantment, number> {
    // Get the enchantment list tag from the item stack's NBT
    const ench = this.item.nbt.get<ListTag<CompoundTag>>("ench");

    // Create a new map to store the enchantments
    const enchantments = new Map<Enchantment, number>();

    // Check if the enchantment list tag exists
    if (ench) {
      // Iterate over each enchantment in the list tag
      for (const element of ench) {
        // Get the enchantment id and level from the compound tag
        const id: Enchantment = element.get<ShortTag>("id")?.valueOf() ?? 0;
        const level: number = element.get<ShortTag>("lvl")?.valueOf() ?? 0;

        // Add the enchantment id and level to the map
        enchantments.set(id, level);
      }
    }

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
    const ench = this.item.nbt.get<ListTag<CompoundTag>>("ench");

    // Check if the enchantment list tag exists
    if (ench) {
      // Create a new enchantment value
      const value = new CompoundTag();

      // Set the enchantment value's id and level
      value.add(new ShortTag(id, "id"));
      value.add(new ShortTag(level, "lvl"));

      // Add the enchantment value to the list tag
      ench.push(value);

      // Set the nbt's enchantment list tag
      this.item.nbt.set("ench", ench);
    }
  }

  /**
   * Removes an enchantment from the item stack.
   * @param id The enchantment id.
   */
  public removeEnchantment(id: Enchantment): void {
    // Get the enchantment list tag from the item stack's NBT
    const ench = this.item.nbt.get<ListTag<CompoundTag>>("ench");

    // Check if the enchantment list tag exists
    if (ench) {
      // Filter out the enchantment with the specified id
      const filtered = ench.filter(
        (element) => element.get<ShortTag>("id")?.valueOf() !== id
      );

      // Set the filtered enchantment list tag back to the item stack's NBT
      this.item.nbt.set("ench", new ListTag(filtered, "ench"));
    }
  }

  /**
   * Sets an enchantment on the item stack.
   * @param id The enchantment id.
   * @param level The enchantment level.
   */
  public setEnchantment(id: Enchantment, level: number): void {
    // Check if the enchantment already exists
    if (this.hasEnchantment(id)) this.removeEnchantment(id);

    // Add the enchantment to the item stack
    this.addEnchantment(id, level);
  }

  /**
   * Gets the enchantment list tag from the item stack's NBT.
   * @returns The enchantment list tag.
   */
  public getNbt(): ListTag<CompoundTag> {
    return this.item.nbt.get<ListTag<CompoundTag>>("ench")!;
  }

  public onAdd(): void {
    // Check if the item has the enchantment list tag
    if (!this.item.nbt.has("ench")) {
      // Create the enchantment list tag
      const ench = new ListTag([], "ench");

      // Add the enchantment list tag to the item stack's NBT
      this.item.nbt.add(ench);
    }
  }

  public onRemove(): void {
    // Remove the enchantment list tag from the item stack's NBT
    this.item.nbt.delete("ench");
  }
}

export { ItemStackEnchantableTrait };
