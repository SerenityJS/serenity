import { ByteTag } from "@serenityjs/nbt";

import { BlockIdentifier, CardinalDirection } from "../../enums";
import { BlockPlacementOptions } from "../../types";

import { BlockTrait } from "./trait";

import type { Block } from "../block";

/**
 * The directions beds point from their foot to their head, in the order their direction state numbers them.
 */
const BedDirections = [
  CardinalDirection.South,
  CardinalDirection.West,
  CardinalDirection.North,
  CardinalDirection.East
];

/**
 * Places beds as vanilla does: the foot goes where the bed is placed, and the head in the space beyond it,
 * the way the player faces, which needs a floor too. Both halves keep the colour of the bed item,
 * and breaking either half breaks the other.
 */
class BlockBedTrait extends BlockTrait {
  public static readonly identifier = "bed";
  public static readonly types = [BlockIdentifier.Bed];

  /**
   * Whether the block is the head of the bed.
   */
  public get isHead(): boolean {
    return this.block.getState<boolean>("head_piece_bit");
  }

  public onPlace({ cancel, origin }: BlockPlacementOptions): boolean | void {
    // Check if the placement was cancelled, or if this is the head, which the foot places
    if (cancel || !origin || !origin.isPlayer()) return;

    // A bed is placed as its foot, unoccupied, pointing the way the player faces
    // The item's auxiliary value is its colour rather than a block state, so these are set here
    this.block.setPermutation(
      this.block.type.getPermutation({
        ...this.block.permutation.state,
        direction: BedDirections.indexOf(origin.getCardinalDirection()),
        head_piece_bit: false,
        occupied_bit: false
      })
    );

    // The head goes in the space beyond the foot, which needs to be free and have a floor
    const head = this.getOtherHalf();
    if (!head.isReplaceable || head.below().isReplaceable) return false;

    // Place the head of the bed
    head.setPermutation(
      this.block.type.getPermutation({
        ...this.block.permutation.state,
        head_piece_bit: true
      })
    );

    // Both halves keep the colour of the bed item
    const color = origin.getHeldItem()?.getAuxiliaryValue() ?? 0;
    this.setColor(color);
    if (head.hasTrait(BlockBedTrait))
      head.getTrait(BlockBedTrait).setColor(color);
  }

  public onBreak(): void {
    // Get the other half of the bed
    const other = this.getOtherHalf();

    // Break the other half, if it is the other half of this bed
    if (
      other.identifier === this.block.identifier &&
      other.getState<boolean>("head_piece_bit") !== this.isHead
    )
      other.identifier = BlockIdentifier.Air;
  }

  /**
   * Sets the colour of the bed.
   * @param color The colour of the bed, as the auxiliary value of its item.
   */
  public setColor(color: number): void {
    // Set the colour of the bed in its storage
    this.block.getStorage().set("color", new ByteTag(color, "color"));

    // Send the colour to the players
    this.block.sendStorageUpdate();
  }

  /**
   * Gets the other half of the bed: the head from the foot, or the foot from the head.
   */
  public getOtherHalf(): Block {
    // Get the direction the bed points from its foot to its head
    const direction =
      BedDirections[this.block.getState<number>("direction")] ??
      CardinalDirection.South;

    // The head is the way the bed points from the foot, and the foot the other way from the head
    const steps = this.isHead ? -1 : 1;

    switch (direction) {
      case CardinalDirection.North:
        return this.block.north(steps);
      case CardinalDirection.South:
        return this.block.south(steps);
      case CardinalDirection.East:
        return this.block.east(steps);
      case CardinalDirection.West:
        return this.block.west(steps);
    }
  }
}

export { BlockBedTrait };
