import { BlockFace, ItemUseMethod, Vector3f } from "@serenityjs/protocol";

import { Block } from "../../block";
import { Entity } from "../../entity";
// import { Entity } from "../../entity";

interface ItemUseOptions {
  /**
   * The use method of the item.
   */
  method: ItemUseMethod;

  /**
   * The predicted amount of durability used during the use of the item.
   */
  predictedDurability?: number | null;

  /**
   * Whether the use of the item was canceled.
   */
  canceled?: boolean;
}

interface ItemUseOnBlockOptions extends ItemUseOptions {
  /**
   * The target block that the item is being used on.
   */
  targetBlock: Block;

  /**
   * The position, relative to the target block, that the item is being used on.
   */
  clickPosition: Vector3f;

  /**
   * The face of the trget block that the item is being used on.
   */
  face: BlockFace;
}

interface ItemUseOnEntityOptions extends ItemUseOptions {
  /**
   * The target entity that the item is being used on.
   */
  targetEntity: Entity;
}

export { ItemUseOptions, ItemUseOnBlockOptions, ItemUseOnEntityOptions };
