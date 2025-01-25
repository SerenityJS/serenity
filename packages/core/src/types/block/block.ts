import { BlockFace, Vector3f } from "@serenityjs/protocol";

import { BlockEntry } from "../world";
import { BlockPermutation, ItemDrop } from "../../block";
import { ItemCategory, ItemGroup } from "../../enums";
import { Entity, Player } from "../../entity";

interface BlockTypeProperties {
  loggable: boolean;
  air: boolean;
  liquid: boolean;
  solid: boolean;
  components: Array<string>;
  tags: Array<string>;
  drops: Array<ItemDrop>;
  permutations: Array<BlockPermutation>;
}

interface CustomBlockProperties extends BlockTypeProperties {
  creativeCategory: ItemCategory;
  creativeGroup: ItemGroup;
}

interface BlockProperties {
  entry?: BlockEntry;
}

interface BlockPlacementOptions {
  /**
   * Whether the block placement should be cancelled.
   */
  cancel: boolean;

  /**
   * The pemutation of the block that was placed.
   */
  permutation: BlockPermutation;

  /**
   * The entity that placed the block.
   */
  origin?: Entity;

  /**
   * The relative position of the block that was placed.
   */
  clickedPosition?: Vector3f;

  /**
   * The face of the block that was placed.
   */
  clickedFace?: BlockFace;
}

interface BlockInteractionOptions {
  /**
   * Whether the block interaction should be cancelled.
   */
  cancel: boolean;

  /**
   * The player that interacted with the block.
   */
  origin?: Player;

  /**
   * The relative position of the block that was interacted with.
   */
  clickedPosition?: Vector3f;

  /**
   * The face of the block that was interacted with.
   */
  clickedFace?: BlockFace;
}

interface BlockDestroyOptions {
  /**
   * Whether the block destruction should be cancelled.
   */
  cancel: boolean;

  /**
   * The entity that destroyed the block.
   */
  origin?: Entity;

  /**
   * Whether the block should drop loot.
   */
  dropLoot?: boolean;
}

export {
  BlockProperties,
  CustomBlockProperties,
  BlockPlacementOptions,
  BlockInteractionOptions,
  BlockTypeProperties,
  BlockDestroyOptions
};
