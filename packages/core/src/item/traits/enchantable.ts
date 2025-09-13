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

    // Create a new list tag to filter out duplicates
    const filtered = new ListTag<CompoundTag>([], "ench");

    // Track the highest level instance of this enchantment on the item already.
    let high = 0

    // Check if the enchantment list tag exists
    if (ench) {

      // Check for duplicate enchantments.
      for (const tag of ench) {
        // Get the enchantment id from the tag
        const enchantmentId = tag.get<ShortTag>("id")?.valueOf();

        // If the enchantment id matches, remove the tag
        if (enchantmentId === id) {

          // Check if the enchantment has a higher level than the one we're adding.
          const enchantmentLevel = tag.get<ShortTag>("lvl")?.valueOf() ?? -1

          // Set the new highest level to the enchantment level.
          if (enchantmentLevel > high) {
            high = enchantmentLevel
          }

        } else {
          // Otherwise, add the tag to the filtered list
          filtered.push(tag);
        }
      }

      // No change, the enchantment already exists on the item with a value greater than or equal to as the current level.
      if (high >= level) throw new Error("Enchantment already exists on the item.")

      // Create a new enchantment value
      const value = new CompoundTag();

      // Set the enchantment value's id and level
      value.add(new ShortTag(id, "id"));
      value.add(new ShortTag(level, "lvl"));

      // Add the enchantment value to the list tag
      filtered.push(value);

      // Set the nbt's enchantment list tag
      this.item.nbt.set("ench", filtered);
    }
  }

  /**
   * Removes an enchantment from the item stack.
   * @param id The enchantment id.
   */
  public removeEnchantment(id: Enchantment): void {
    // Get the enchantment list tag from the item stack's NBT
    const ench = this.item.nbt.get<ListTag<CompoundTag>>("ench");

    // Create a new list tag to filter out the enchantment to remove
    const filtered = new ListTag<CompoundTag>([], "ench");

    // Check if the enchantment list tag exists
    if (ench) {
      // Iterate over the enchantments and filter out the one to remove
      for (const tag of ench) {
        // Get the enchantment id from the tag
        const enchantmentId = tag.get<ShortTag>("id")?.valueOf();

        // If the enchantment id matches, remove the tag
        if (enchantmentId === id) continue;

        // Otherwise, add the tag to the filtered list
        filtered.push(tag);
      }

      // Set the filtered enchantment list tag back to the item stack's NBT
      this.item.nbt.set("ench", filtered);
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
