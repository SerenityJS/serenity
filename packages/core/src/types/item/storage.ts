import { JSONLikeObject } from "../json";
import { ItemStackEntry } from "../world";

/**
 * Represents a component that stores a set size of items.
 */
interface ItemStorage extends JSONLikeObject {
  /**
   * The amount of slots in the storage.
   */
  size: number;

  /**
   * The items in the storage.
   */
  items: Array<[number, ItemStackEntry]>;
}

export { ItemStorage };
