import type { JSONLikeObject } from "../../types";
import type { ItemStackDataEntry } from "./item-stack-data-entry";

/**
 * Used to store item stacks in a JSON-like format.
 * This is mainly used for the traits that need to store item stacks.
 */
interface ItemStackStorage extends JSONLikeObject {
  /**
   * The max amount of item slots in the storage.
   */
  size: number;

  /**
   * The items stack data entries in the storage.
   */
  items: Array<[number, ItemStackDataEntry]>;
}

export { ItemStackStorage };
