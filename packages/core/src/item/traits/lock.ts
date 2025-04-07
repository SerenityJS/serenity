import { ByteTag } from "@serenityjs/nbt";

import { ItemIdentifier, ItemLockMode } from "../../enums";

import { ItemTrait } from "./trait";

class ItemLockTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "lock";

  /**
   * Get the current lock mode of the item stack.
   * @returns The current lock mode of the item stack.
   */
  public getMode(): ItemLockMode {
    // Check if the item stack has a lock mode
    if (!this.item.nbt.has("minecraft:item_lock")) return ItemLockMode.None;

    // Get the lock mode from the item stack's nbt.
    const mode = this.item.nbt.get<ByteTag>("minecraft:item_lock");

    // Return the lock mode value.
    return mode.value;
  }

  /**
   * Set the lock mode of the item stack.
   * @param mode The lock mode to set.
   */
  public setMode(mode: ItemLockMode): void {
    // Check if the mode is none, if so remove the lock trait.
    if (mode === ItemLockMode.None)
      return this.item.removeTrait(this.identifier);

    // Check if the item stack already has a lock mode
    if (this.item.nbt.has("minecraft:item_lock")) {
      // Update the lock mode value
      const lockTag = this.item.nbt.get<ByteTag>("minecraft:item_lock");
      lockTag.value = mode;

      // Set the updated lock mode in the item stack's nbt.
      this.item.nbt.set(lockTag.name, lockTag);
    } else {
      // Create a new byte nbt tag for the lock mode.
      const lockTag = new ByteTag({
        name: "minecraft:item_lock",
        value: mode
      });

      // Add the lock mode to the item stack's nbt.
      this.item.nbt.add(lockTag);
    }
  }

  public onAdd(): void {
    // Check if the item stack already has a lock mode
    if (this.item.nbt.has("minecraft:item_lock")) return;

    // Create a new byte nbt tag for the lock mode.
    const mode = new ByteTag({
      name: "minecraft:item_lock",
      value: ItemLockMode.LockToSlot
    });

    // Add the lock mode to the item stack's nbt.
    this.item.nbt.add(mode);
  }

  public onRemove(): void {
    // Check if the item stack has a lock mode
    if (!this.item.nbt.has("minecraft:item_lock")) return;

    // Remove the lock mode from the item stack's nbt.
    this.item.nbt.delete("minecraft:item_lock");
  }
}

export { ItemLockTrait };
