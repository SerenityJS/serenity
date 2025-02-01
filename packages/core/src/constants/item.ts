import { ItemIdentifier } from "../enums";
import { ItemStackEntry, ItemStackProperties } from "../types";

/**
 * The default item stack properties.
 */
const DefaultItemStackProperties: ItemStackProperties = {
  amount: 1,
  metadata: 0
};

/**
 * The default item stack entry.
 */
const DefaultItemStackEntry: ItemStackEntry = {
  identifier: ItemIdentifier.Air,
  amount: 1,
  metadata: 0,
  traits: [],
  dynamicProperties: [],
  nbtProperties: ""
};

export { DefaultItemStackProperties, DefaultItemStackEntry };
