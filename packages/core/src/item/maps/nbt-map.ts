import { CompoundTag, NBTTag } from "@serenityjs/nbt";

import { ItemStack } from "../stack";

class ItemStackNbtMap extends Map<string, NBTTag> {
  /**
   * The item stack that the nbt map is attached to.
   */
  protected readonly itemStack: ItemStack;

  /**
   * Creates a new instance of the item stack nbt map.
   * @param itemStack The item stack that the nbt map will be attached to.
   */
  public constructor(itemStack: ItemStack) {
    super();
    this.itemStack = itemStack;
  }

  public set(key: string, value: NBTTag<unknown>): this {
    // Call the original set method
    const result = super.set(key, value);

    // Update the nbt data when a new value is added
    this.update();

    // Return the result
    return result;
  }

  public delete(key: string): boolean {
    // Call the original delete method
    const result = super.delete(key);

    // Update the nbt data when a value is removed
    this.update();

    // Return the result
    return result;
  }

  public clear(): void {
    // Call the original clear method
    super.clear();

    // Update the nbt data when the map is cleared
    this.update();
  }

  /**
   * Converts the nbt map to a compound tag.
   * @returns
   */
  public toCompound(): CompoundTag {
    // Create a new compound tag
    const root = new CompoundTag("");

    // Iterate over the map
    for (const [_, value] of this) {
      // Add the tag to the compound
      root.addTag(value);
    }

    // Return the compound
    return root;
  }

  /**
   * Adds the tags from a compound to the map.
   * @param root The compound tag to add the tags from.
   */
  public fromCompound(root: CompoundTag): void {
    // Iterate over the tags in the compound
    for (const tag of root.getTags()) {
      // Set the tag in the map
      this.set(tag.name, tag);
    }
  }

  protected update(): void {
    // Check if the item is in a container.
    if (!this.itemStack.container) return;

    // Get the slot of the item in the container.
    const slot = this.itemStack.container.storage.indexOf(this.itemStack);

    // Check if the item is 0 or less.
    if (this.itemStack.amount <= 0) {
      // Remove the item from the container.
      this.itemStack.container.clearSlot(slot);
    }

    // Set the item in the container.
    else this.itemStack.container.setItem(slot, this.itemStack);
  }
}

export { ItemStackNbtMap };
