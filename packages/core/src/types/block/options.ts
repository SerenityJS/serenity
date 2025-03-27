import {
  BlockFace,
  ContainerId,
  ContainerType,
  Vector3f
} from "@serenityjs/protocol";

import { Entity, Player } from "../../entity";
import { BlockPermutation } from "../../block";

interface BlockInventoryTraitOptions {
  /**
   * The size of the container.
   */
  size: number;

  /**
   * The type of the container.
   */
  type: ContainerType;

  /**
   * The identifier of the container.
   */
  identifier: ContainerId;
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
   * This property can be modified to cancel the interaction with the block.
   */
  cancel: boolean;

  /**
   * The player that interacted with the block.
   * This property can be modified to change the player that is interacting with the block.
   */
  origin?: Player;

  /**
   * The relative position of the block that was interacted with.
   * This property can be modified to change the position of the block that is interacted with.
   */
  clickedPosition?: Vector3f;

  /**
   * The face of the block that was interacted with.
   * This property can be modified to change the face that the block is interacted with.
   */
  clickedFace?: BlockFace;

  /**
   * Whether the interaction will result in a block being placed.
   * The position of the block will be relative to the `clickedFace` property.
   * This property can be modified to cancel the placement of a block when interacting with it.
   */
  placingBlock?: boolean;
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
  BlockInventoryTraitOptions,
  BlockPlacementOptions,
  BlockInteractionOptions,
  BlockDestroyOptions
};
