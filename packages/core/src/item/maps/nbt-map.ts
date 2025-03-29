import { CompoundTag, Tag } from "@serenityjs/nbt";
import { BinaryStream } from "@serenityjs/binarystream";

import { ItemStack } from "../stack";
import { AsyncMap } from "../../utility";

class ItemStackNbtMap extends AsyncMap<string, Tag> {
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

  public async add(...tags: Array<Tag<unknown>>): Promise<this> {
    await Promise.all(
      tags.map(async (tag) => {
        // Call the original set method
        await super.set(tag.name, tag);

        // Update the nbt data when a new value is added
        return this.update();
      })
    );

    // Return the result
    return this;
  }

  public async set(key: string, value: Tag<unknown>): Promise<this> {
    // Call the original set method
    await super.set(key, value);

    // Update the nbt data when a new value is added
    await this.update();

    // Return the result
    return this;
  }

  public async delete(key: string): Promise<boolean> {
    // Call the original delete method
    const result = await super.delete(key);

    // Update the nbt data when a value is removed
    await this.update();

    // Return the result
    return result;
  }

  public async clear(): Promise<void> {
    // Call the original clear method
    await super.clear();

    // Update the nbt data when the map is cleared
    return this.update();
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
  public async fromCompound(root: CompoundTag<unknown>): Promise<void> {
    // Iterate over the tags in the compound
    await Promise.all(
      root.getTags().map(async (tag) => {
        // Set the tag in the map
        await this.set(tag.name, tag);
      })
    );
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

  public async deserialize(buffer: Buffer): Promise<void> {
    // Create a new BinaryStream to read the data
    const stream = new BinaryStream(buffer);

    // Read the compound tag from the stream
    const root = CompoundTag.read(stream);

    // Add the tags from the compound to the map
    return this.fromCompound(root);
  }

  public async update(): Promise<void> {
    // Check if the item is in a container.
    if (!this.itemStack.container) return;

    // Get the slot of the item in the container.
    const slot = this.itemStack.container.storage.indexOf(this.itemStack);

    // Check if the item is 0 or less.
    if (this.itemStack.amount <= 0) {
      // Remove the item from the container.
      await this.itemStack.container.clearSlot(slot);
    }

    // Set the item in the container.
    else await this.itemStack.container.setItem(slot, this.itemStack);
  }
}

export { ItemStackNbtMap };
