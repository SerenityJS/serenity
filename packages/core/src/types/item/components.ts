import { BlockIdentifier } from "../../enums";
import { JSONLikeObject } from "../json";

interface ItemTypeBlockPlacerComponentInterface extends JSONLikeObject {
  /**
   * Whether the block image should be used as the item icon.
   */
  useBlockAsIcon: boolean;

  /**
   * The block types that the item type can be used on.
   * If the query is empty, the item can be used on any block.
   */
  useOn: Array<BlockIdentifier | string>;
}

export { ItemTypeBlockPlacerComponentInterface };
