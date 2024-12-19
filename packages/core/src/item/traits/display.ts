import NodeBuffer from "node:buffer";

import { CompoundTag, ListTag, StringTag, TagType } from "@serenityjs/nbt";

import { ItemIdentifier } from "../../enums";

import { ItemTrait } from "./trait";

interface DisplayValue {
  name?: StringTag;
  lore?: ListTag<StringTag>;
}

class ItemDisplayTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "display";

  /**
   * Gets custom name from the item stack.
   * @returns The custom name if it exists; otherwise, null.
   */
  public getName(): string | null {
    const display = this.item.nbt.get<CompoundTag<DisplayValue>>("display");

    if (!display || !display.value.name) {
      return null;
    }

    const name = display.value.name.value;

    // Return the custom name
    return name;
  }

  /**
   * Adds custom name to the item stack.
   * @param name The item stack custom name.
   */
  public setName(name: string): void {
    if (!NodeBuffer.isUtf8(Buffer.from(name))) {
      throw new Error("The given name is not a valid UTF-8 string.");
    }

    const display = this.item.nbt.get<CompoundTag<DisplayValue>>("display");

    if (display) {
      display.createStringTag(new StringTag({ name: "Name", value: name }));
    }

    this.item.nbt.set("display", display);
  }

  /**
   * Gets the lore list on the item stack.
   * @returns The map of lore texts.
   */
  public getLore(): Map<number, string> {
    const display = this.item.nbt.get<CompoundTag<DisplayValue>>("display");

    const lore = new Map<number, string>();

    if (display.hasTag("Lore")) {
      for (const [index, tag] of display
        .getTag<ListTag<StringTag>>("Lore")
        .value.entries()) {
        lore.set(index, tag.value);
      }
    }

    // Return the map of lore texts
    return lore;
  }

  /**
   * Adds lore to the item stack.
   * @param lore The lore array.
   */
  public setLore(lore: Array<string>): void {
    const display = this.item.nbt.get<CompoundTag<DisplayValue>>("display");

    const list = [...lore.values()].map((value) => new StringTag({ value }));

    display.createListTag(
      new ListTag({ name: "Lore", value: [...list], listType: TagType.String })
    );

    // Set the nbt's display tag
    this.item.nbt.set("display", display);
  }

  /**
   * Clears the custom name from item stack
   */
  public clearName(): void {
    const display = this.item.nbt.get<CompoundTag<DisplayValue>>("display");

    if (display.hasTag("Name")) {
      display.removeTag("Name");
    }

    this.item.nbt.set("display", display);
  }

  public onAdd(): void {
    // Check if the item has the display tag
    if (!this.item.nbt.has("display")) {
      // Create the display tag
      const display = new CompoundTag({
        name: "display",
        value: []
      });

      // Add the display tag to the item stack's NBT
      this.item.nbt.add(display);
    }
  }

  public onRemove(): void {
    // Remove the display tag from the item stack's NBT
    this.item.nbt.delete("display");
  }

  /**
   * Gets the display tag from the item stack's NBT.
   * @returns The display tag.
   */
  public getNbt(): CompoundTag<DisplayValue> {
    return this.item.nbt.get<CompoundTag<DisplayValue>>("display");
  }
}

export { ItemDisplayTrait };
