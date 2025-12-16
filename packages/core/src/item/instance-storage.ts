import { BaseTag, CompoundTag } from "@serenityjs/nbt";

import { ItemStack } from "./stack";

class ItemStackInstanceStorage extends CompoundTag {
  /**
   * The item stack associated with this level storage.
   */
  private readonly itemStack: ItemStack;

  /**
   * Create a new item stack instance storage.
   * @param itemStack The item stack to create the storage for.
   * @param source The source compound tag to copy data from.
   */
  public constructor(itemStack: ItemStack, source?: CompoundTag) {
    super(); // No tag name is needed for item stack storage

    // Assign the item stack to the private property
    this.itemStack = itemStack;

    // If a source is provided, copy its contents
    if (source) this.push(...source.values());
  }

  /**
   * Set a tag in the storage.
   * @param key The key of the tag to set.
   * @param value The value of the tag to set.
   * @returns The instance storage itself for chaining.
   */
  public set<T extends BaseTag>(key: string, value: T): this {
    // Call the original set method
    super.set(key, value);

    // Set the stack NBT in the item stack storage
    this.itemStack.getStorage().setStackNbt(this);

    // Return the instance for chaining
    return this;
  }

  /**
   * Push tags to the storage.
   * @param tags The tags to push.
   * @returns The instance storage itself for chaining.
   */
  public push<T extends BaseTag>(...tags: Array<T>): this {
    // Call the original push method
    super.push(...tags);

    // Set the stack NBT in the item stack storage
    this.itemStack.getStorage().setStackNbt(this);

    // Return the instance for chaining
    return this;
  }

  /**
   * Add a tag to the storage.
   * @param tag The tag to add.
   * @returns The added tag.
   */
  public add<T extends BaseTag>(tag: T): T {
    // Call the original add method
    const result = super.add(tag);

    // Set the stack NBT in the item stack storage
    this.itemStack.getStorage().setStackNbt(this);

    // Return the result
    return result;
  }

  /**
   * Delete a tag from the storage.
   * @param key The key of the tag to delete.
   * @returns True if the tag was deleted, false otherwise.
   */
  public delete(key: string): boolean {
    // Call the original delete method
    const result = super.delete(key);

    // Set the stack NBT in the item stack storage
    this.itemStack.getStorage().setStackNbt(this);

    // Return the result
    return result;
  }

  /**
   * Clear all tags from the storage.
   */
  public clear(): void {
    // Call the original clear method
    super.clear();

    // Set the stack NBT in the item stack storage
    this.itemStack.getStorage().setStackNbt(this);
  }
}

export { ItemStackInstanceStorage };
