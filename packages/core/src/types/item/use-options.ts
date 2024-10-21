import { Block } from "../../block";
import { Entity } from "../../entity";
import { ItemUseMethod } from "../../enums";

interface ItemUseOptions {
  /**
   * The use method of the item.
   */
  method: ItemUseMethod;

  /**
   * The target block that the item is being used on.
   */
  targetBlock: Block;

  /**
   * The target entity that the item is being used on.
   */
  targetEntity: Entity;

  /**
   * The predicted amount of durability used during the use of the item.
   */
  predictedDurability: number;
}

export { ItemUseOptions };
