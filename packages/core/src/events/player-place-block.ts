import { WorldEvent } from "../enums";
import { Player } from "../entity";
import { ItemStack } from "../item";

import { BlockUpdateSignal } from "./block-update";

import type { Block, BlockPermutation } from "../block";
import type { BlockFace, Vector3f } from "@serenityjs/protocol";

class PlayerPlaceBlockSignal extends BlockUpdateSignal {
  public static readonly identifier = WorldEvent.PlayerPlaceBlock;

  /**
   * The face of the block the new block is being placed on.
   */
  public readonly face: BlockFace;

  /**
   * Location relative to the bottom north-west corner of the block where the new block is being placed onto.
   */
  public readonly faceLocation: Vector3f;

  /**
   * The permutation of the block being placed.
   */
  public readonly permutationBeingPlaced: BlockPermutation;

  /**
   * The item stack used to place the block.
   */
  public readonly itemStackUsed: ItemStack;

  /**
   * The player placing the block.
   */
  public readonly player: Player;

  /**
   * Creates a new player place block signal.
   * @param block The block being placed.
   * @param player The player placing the block.
   * @param permutationBeingPlaced The permutation of the block being placed.
   * @param face The face of the block the new block is being placed on.
   * @param faceLocation Location relative to the bottom north-west corner of the block where the new block is being placed onto.
   * @param itemStackUsed The item stack used to place the block.
   */
  public constructor(
    block: Block,
    player: Player,
    permutationBeingPlaced: BlockPermutation,
    face: BlockFace,
    faceLocation: Vector3f,
    itemStackUsed: ItemStack
  ) {
    super(block);
    this.player = player;
    this.permutationBeingPlaced = permutationBeingPlaced;
    this.face = face;
    this.faceLocation = faceLocation;
    this.itemStackUsed = itemStackUsed;
  }
}

export { PlayerPlaceBlockSignal };
