import { ItemIdentifier } from "../../enums";

import type { JSONLikeObject, JSONLikeValue } from "../../types";

/**
 * The default item stack data entry.
 */
const DefaultItemStackDataEntry: ItemStackDataEntry = {
  identifier: ItemIdentifier.Air,
  stackSize: 1,
  metadata: 0,
  traits: [],
  dynamicProperties: [],
  nbtProperties: ""
};

interface ItemStackDataEntry extends JSONLikeObject {
  /**
   * The identifier of the item stack.
   */
  identifier: ItemIdentifier | string;

  /**
   * The amount of the item stack.
   */
  stackSize: number;

  /**
   * The metadata value of the item stack.
   */
  metadata: number;

  /**
   * The traits attached to the item stack.
   */
  traits: Array<string>;

  /**
   * The dynamic properties attached to the item stack.
   */
  dynamicProperties: Array<[string, JSONLikeValue]>;

  /**
   * The nbt data serialized as a base64 string.
   */
  nbtProperties: string;
}

export { ItemStackDataEntry, DefaultItemStackDataEntry };
