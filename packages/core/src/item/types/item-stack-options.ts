import { CompoundTag } from "@serenityjs/nbt";

import type { World } from "../../world";

/**
 * The default item stack options.
 */
const DefaultItemStackOptions: ItemStackOptions = {
  stackSize: 1,
  auxiliary: 0
};

interface ItemStackOptions {
  /**
   * The amount of items in the stack.
   */
  stackSize: number;

  /**
   * The auxiliary value of the item stack.
   */
  auxiliary: number;

  /**
   * The world that the item stack is in.
   */
  world?: World;

  /**
   * The strorage of the item stack, to persist data across level loads.
   */
  storage?: CompoundTag | null;
}

export { ItemStackOptions, DefaultItemStackOptions };
