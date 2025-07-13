import { ItemStackLevelStorage } from "../storage";

import type { World } from "../../world";

/**
 * The default item stack options.
 */
const DefaultItemStackOptions: ItemStackOptions = {
  stackSize: 1,
  metadata: 0
};

interface ItemStackOptions {
  /**
   * The amount of items in the stack.
   */
  stackSize: number;

  /**
   * The metadata of the item stack.
   */
  metadata: number;

  /**
   * The world that the item stack is in.
   */
  world?: World;

  /**
   * The level storage for the item stack.
   */
  storage?: ItemStackLevelStorage;
}

export { ItemStackOptions, DefaultItemStackOptions };
