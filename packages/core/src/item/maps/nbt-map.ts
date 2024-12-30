import { CompoundTag, Tag } from "@serenityjs/nbt";
import { BinaryStream } from "@serenityjs/binarystream";

import { ItemStack } from "../stack";

class ItemStackNbtMap extends Map<string, Tag> {
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

  public get<T extends Tag>(key: string): T {
    return super.get(key) as T;
  }

  public add(value: Tag<unknown>): this {
    // Call the original set method
    const result = super.set(value.name, value);

    // Update the nbt data when a new value is added
    this.update();

    // Return the result
    return result;
  }

  public set(key: string, value: Tag<unknown>): this {
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
  public toCompound(name: string = ""): CompoundTag<unknown> {
    // Create a new compound tag
    const root = new CompoundTag({ name, value: {} });

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
  public fromCompound(root: CompoundTag<unknown>): void {
    // Iterate over the tags in the compound
    for (const tag of root.getTags()) {
      // Set the tag in the map
      this.set(tag.name, tag);
    }
  }

  public serialize(): Buffer {
    // Get the compound tag from the map
    const root = this.toCompound();

    // Create a new BinaryStream to write the data
    const stream = new BinaryStream();

    // Write the compound tag to the stream
    CompoundTag.write(stream, root);

    // Return the buffer
    return stream.getBuffer();
  }

  public deserialize(buffer: Buffer): void {
    // Create a new BinaryStream to read the data
    const stream = new BinaryStream(buffer);

    // Read the compound tag from the stream
    const root = CompoundTag.read(stream);

    // Add the tags from the compound to the map
    this.fromCompound(root);
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
