import type { World } from "../../world";
import type { ItemStackDataEntry } from "./item-stack-data-entry";

/**
 * The default item stack options.
 */
const DefaultItemStackOptions: ItemStackOptions = {
  amount: 1,
  metadata: 0
};

interface ItemStackOptions {
  /**
   * The amount of items in the stack.
   */
  amount: number;

  /**
   * The metadata of the item stack.
   */
  metadata: number;

  /**
   * The world that the item stack is in.
   */
  world?: World;

  /**
   * The item stack data entry, used for serialization and deserialization.
   */
  dataEntry?: ItemStackDataEntry;
}

export { ItemStackOptions, DefaultItemStackOptions };
