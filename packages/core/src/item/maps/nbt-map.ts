import { BaseTag, CompoundTag } from "@serenityjs/nbt";
import { BinaryStream } from "@serenityjs/binarystream";

import { ItemStack } from "../stack";

class ItemStackNbtMap extends CompoundTag {
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

  public set<T extends BaseTag>(key: string, value: T): this {
    // Call the original set method
    super.set(key, value);

    // Update the nbt data when a new value is set
    this.update();

    // Return the result
    return this;
  }

  public push<T extends BaseTag>(...tags: Array<T>): this {
    // Call the original add method
    super.push(...tags);

    // Update the nbt data when a new tag is added
    this.update();

    // Return the result
    return this;
  }

  public add<T extends BaseTag>(tag: T): T {
    // Call the original add method
    const result = super.add(tag);

    // Update the nbt data when a new tag is added
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

  public serialize(): Buffer {
    // Create a new BinaryStream to write the data
    const stream = new BinaryStream();

    // Write the compound tag to the stream
    CompoundTag.write(stream, this);

    // Return the buffer
    return stream.getBuffer();
  }

  public deserialize(buffer: Buffer): void {
    // Create a new BinaryStream to read the data
    const stream = new BinaryStream(buffer);

    // Read the compound tag from the stream
    const root = CompoundTag.read(stream);

    // Add all the values from the root compound tag to this map.
    this.push(...root.values());
  }

  protected update(): void {
    // Check if the item is in a container.
    if (!this.itemStack.container) return;

    // Get the slot of the item in the container.
    const slot = this.itemStack.container.storage.indexOf(this.itemStack);

    // Check if the item is 0 or less.
    if (this.itemStack.stackSize <= 0) {
      // Remove the item from the container.
      this.itemStack.container.clearSlot(slot);
    }

    // Set the item in the container.
    else this.itemStack.container.setItem(slot, this.itemStack);
  }
}

export { ItemStackNbtMap };
