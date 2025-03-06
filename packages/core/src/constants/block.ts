import { BlockIdentifier } from "../enums";
import { BlockEntry } from "../types";

/**
 * The default block entry.
 */
const DefaultBlockEntry: BlockEntry = {
  identifier: BlockIdentifier.Air,
  permutation: 0,
  position: [0, 0, 0],
  traits: [],
  dynamicProperties: [],
  nbtProperties: ""
};

export { DefaultBlockEntry };
