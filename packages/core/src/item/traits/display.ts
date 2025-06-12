import { CompoundTag, ListTag, StringTag } from "@serenityjs/nbt";

import { ItemTrait } from "./trait";

class ItemDisplayTrait extends ItemTrait {
  public static readonly identifier = "display";

  /**
   * Gets custom name from the item stack.
   * @returns The custom name if it exists; otherwise, null.
   */
  public getName(): string | null {
    // Get the display tag from the item stack
    const display = this.item.nbt.get<CompoundTag>("display");

    // Check if the display tag exists and has a Name tag
    if (!display || !display.has("Name")) return null;

    // Get the Name tag from the display tag
    const name = display.get<StringTag>("Name")!.valueOf();

    // Return the custom name
    return name;
  }

  /**
   * Adds custom name to the item stack.
   * @param name The item stack custom name.
   */
  public setName(name: string): void {
    // Get the display tag from the item stack
    let display = this.item.nbt.get<CompoundTag>("display");

    // If the display tag does not exist, create a new one
    if (!display) display = new CompoundTag("display");

    // Check if the name is empty
    if (name.length <= 0) display.delete("Name");
    else display.add(new StringTag(name, "Name"));

    // Set the display tag back to the item stack to update it
    this.item.nbt.set("display", display);
  }

  /**
   * Gets the lore list on the item stack.
   * @returns The map of lore texts.
   */
  public getLore(): Array<string> {
    // Get the display tag from the item stack
    const display = this.item.nbt.get<CompoundTag>("display");

    // Create an empty array to hold the lore texts
    const lore: Array<string> = [];

    // If the display tag does not exist, return the empty lore array
    if (!display) return lore;

    // Check if the display tag exists and has a Lore tag
    if (display.has("Lore")) {
      // Get the lore tag from the display tag
      const tags = display.get<ListTag<StringTag>>("Lore") ?? [];

      // Iterate through the lore tags and add their values to the lore array
      for (const tag of tags) lore.push(tag.valueOf());
    }

    // Return the lore array
    return lore;
  }

  /**
   * Adds lore to the item stack.
   * @param lore The lore array.
   */
  public setLore(lore: Array<string>): void {
    // Get the display tag from the item stack
    let display = this.item.nbt.get<CompoundTag>("display");

    // If the display tag does not exist, create a new one
    if (!display) display = new CompoundTag("display");

    // If the lore array is empty, remove the Lore tags
    if (lore.length <= 0) display.delete("Lore");
    else {
      // Create a new list tag for the lore
      const list = display.add(new ListTag<StringTag>([], "Lore"));

      // Iterate through the lore array and add each lore text as a StringTag
      for (const text of lore) list.push(new StringTag(text));
    }

    // Set the display tag back to the item stack to update it
    this.item.nbt.set("display", display);
  }

  public onAdd(): void {
    // Check if the item has the display tag
    if (!this.item.nbt.has("display")) {
      // Create the display tag
      const display = new CompoundTag("display");

      // Add the display tag to the item stack's NBT
      this.item.nbt.add(display);
    }
  }

  public onRemove(): void {
    // Remove the display tag from the item stack's NBT
    this.item.nbt.delete("display");
  }
}

export { ItemDisplayTrait };
