import { ByteTag } from "@serenityjs/nbt";

import { ItemLockMode } from "../../enums";

import { ItemTrait } from "./trait";

class ItemLockTrait extends ItemTrait {
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
    return mode?.valueOf() ?? ItemLockMode.None;
  }

  /**
   * Set the lock mode of the item stack.
   * @param mode The lock mode to set.
   */
  public setMode(mode: ItemLockMode): void {
    // Check if the mode is none, if so remove the lock trait.
    if (mode === ItemLockMode.None)
      return this.item.removeTrait(this.identifier);

    // Set the lock mode in the item stack's nbt.
    this.item.nbt.add(new ByteTag(mode, "minecraft:item_lock"));
  }

  public onAdd(): void {
    // Check if the item stack already has a lock mode
    if (this.item.nbt.has("minecraft:item_lock")) return;

    // Add the lock mode to the item stack's nbt.
    this.item.nbt.add(new ByteTag(ItemLockMode.None, "minecraft:item_lock"));
  }

  public onRemove(): void {
    // Check if the item stack has a lock mode
    if (!this.item.nbt.has("minecraft:item_lock")) return;

    // Remove the lock mode from the item stack's nbt.
    this.item.nbt.delete("minecraft:item_lock");
  }
}

export { ItemLockTrait };
