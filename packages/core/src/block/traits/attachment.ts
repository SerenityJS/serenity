import { BlockFace, BlockPosition, ChunkCoords } from "@serenityjs/protocol";
import { BLOCK_TYPES } from "@serenityjs/data";

import { BlockIdentifier, CardinalDirection } from "../../enums";
import { BlockPlacementOptions } from "../../types";

import { BlockTrait } from "./trait";
import { BlockSignTrait } from "./sign";

import type { Block } from "../block";

/**
 * How a block is held up by the block it is placed against:
 * - `face`: attached to the face it was placed on, facing away from it.
 * - `wall`: attached to the side of a block it was placed on, facing away from it.
 * - `lever`: attached to the face its lever direction names.
 * - `floor`: resting on the block below.
 * - `door`: the lower half rests on the block below, and the upper half on the lower half.
 * - `lantern`: hanging from the block above, or standing on the block below.
 * - `crop`: planted in the farmland below.
 * - `hanging_sign`: hanging from the block above, or sticking out of a wall on either of its sides.
 */
type AttachmentKind =
  | "face"
  | "wall"
  | "lever"
  | "floor"
  | "door"
  | "lantern"
  | "crop"
  | "hanging_sign";

/**
 * The crops, which are only planted in farmland.
 */
const CropBlocks = new Set<string>([
  BlockIdentifier.Wheat,
  BlockIdentifier.PumpkinStem,
  BlockIdentifier.MelonStem,
  BlockIdentifier.Beetroot,
  BlockIdentifier.TorchflowerCrop,
  BlockIdentifier.PitcherCrop,
  BlockIdentifier.Potatoes,
  BlockIdentifier.Carrots
]);

/**
 * Gets how a block is held up, if it needs to be.
 * @param identifier The identifier of the block type.
 * @param states The states of the block type.
 */
function getAttachmentKind(
  identifier: string,
  states: Array<string>
): AttachmentKind | null {
  if (identifier === BlockIdentifier.Lever) return "lever";

  if (
    identifier === BlockIdentifier.Ladder ||
    identifier === BlockIdentifier.WallBanner ||
    identifier.endsWith("wall_sign")
  )
    return "wall";

  if (
    identifier.endsWith("_button") ||
    identifier === BlockIdentifier.Frame ||
    identifier === BlockIdentifier.GlowFrame
  )
    return "face";

  if (identifier.endsWith("_door")) return "door";

  if (identifier.endsWith("_hanging_sign")) return "hanging_sign";

  if (CropBlocks.has(identifier)) return "crop";

  if (identifier.endsWith("lantern") && states.includes("hanging"))
    return "lantern";

  if (
    identifier.endsWith("_pressure_plate") ||
    identifier.endsWith("carpet") ||
    identifier.endsWith("standing_sign") ||
    identifier.endsWith("candle") ||
    identifier.endsWith("_repeater") ||
    identifier.endsWith("_comparator") ||
    identifier.endsWith("_rail") ||
    identifier === BlockIdentifier.Rail ||
    identifier === BlockIdentifier.RedstoneWire ||
    identifier === BlockIdentifier.StandingBanner
  )
    return "floor";

  return null;
}

/**
 * The faces opposite each face of a block.
 */
const OppositeFaces: Record<BlockFace, BlockFace> = {
  [BlockFace.Bottom]: BlockFace.Top,
  [BlockFace.Top]: BlockFace.Bottom,
  [BlockFace.North]: BlockFace.South,
  [BlockFace.South]: BlockFace.North,
  [BlockFace.West]: BlockFace.East,
  [BlockFace.East]: BlockFace.West
};

/**
 * The offsets of the block on each face of a block.
 */
const FaceOffsets: Record<BlockFace, [number, number, number]> = {
  [BlockFace.Bottom]: [0, -1, 0],
  [BlockFace.Top]: [0, 1, 0],
  [BlockFace.North]: [0, 0, -1],
  [BlockFace.South]: [0, 0, 1],
  [BlockFace.West]: [-1, 0, 0],
  [BlockFace.East]: [1, 0, 0]
};

/**
 * The lever directions of levers placed on each side of a block.
 */
const LeverWallDirections: Partial<Record<BlockFace, string>> = {
  [BlockFace.North]: "north",
  [BlockFace.South]: "south",
  [BlockFace.West]: "west",
  [BlockFace.East]: "east"
};

/**
 * The face of the block a lever is attached to, for each of its directions.
 */
const LeverSupportFaces: Record<string, BlockFace> = {
  down_east_west: BlockFace.Top,
  down_north_south: BlockFace.Top,
  up_east_west: BlockFace.Bottom,
  up_north_south: BlockFace.Bottom,
  north: BlockFace.South,
  south: BlockFace.North,
  west: BlockFace.East,
  east: BlockFace.West
};

/**
 * Breaks blocks, dropping them, when the block holding them up is removed:
 * buttons, levers, ladders, wall and standing signs, banners, item frames,
 * pressure plates, carpets, candles, rails, redstone dust, repeaters, comparators,
 * doors and lanterns. They also cannot be placed where nothing holds them up.
 */
class BlockAttachmentTrait extends BlockTrait {
  public static readonly identifier = "attachment";
  public static readonly types = BLOCK_TYPES.filter(
    (type) => getAttachmentKind(type.identifier, type.states) !== null
  ).map((type) => type.identifier);

  /**
   * How the block is held up.
   */
  protected get kind(): AttachmentKind | null {
    return getAttachmentKind(this.block.identifier, this.block.type.states);
  }

  public onPlace({
    origin,
    clickedFace
  }: BlockPlacementOptions): boolean | void {
    // Check if the block was placed against a face of another block
    if (clickedFace === undefined) return;

    switch (this.kind) {
      // Levers point away from the face they are placed on, and need the block they are placed against
      case "lever": {
        this.setLeverDirection(clickedFace, origin?.getCardinalDirection());
        if (!this.isSupported()) return false;
        break;
      }

      // Blocks mounted on walls are only placed on the sides of blocks
      case "wall": {
        if (clickedFace === BlockFace.Top || clickedFace === BlockFace.Bottom)
          return false;

        // The block placed against needs to hold the block up
        if (!this.isSupportedFrom(OppositeFaces[clickedFace])) return false;
        break;
      }

      // Blocks attached to a face need the block placed against to hold them up
      case "face": {
        if (!this.isSupportedFrom(OppositeFaces[clickedFace])) return false;
        break;
      }

      // Blocks resting on the block below are only placed on top of a block,
      // and crops only in farmland.
      // Doors are not checked, as their upper half is placed before this.
      case "floor":
      case "crop": {
        if (!this.isSupported()) return false;
        break;
      }
    }
  }

  public onUpdate(source?: Block): void {
    // Only check for support when another block changed
    if (!source || source === this.block) return;

    // Break the block on the next tick, dropping it, if nothing holds it up anymore
    if (!this.isSupported()) this.breakNextTick(() => this.isSupported());
  }

  /**
   * Whether the block holding this one up is still there.
   */
  public isSupported(): boolean {
    // A hanging sign on a wall is held up by a block on either of its sides
    if (
      this.kind === "hanging_sign" &&
      !this.block.getState<boolean>("hanging")
    ) {
      // Get the sides of the sign, at right angles to the way it faces
      const facing = this.block.getState<number>("facing_direction");
      const sides =
        facing === BlockFace.North || facing === BlockFace.South
          ? [BlockFace.West, BlockFace.East]
          : [BlockFace.North, BlockFace.South];

      // Check if either side holds the sign up
      return sides.some((side) => this.isHeldAlong(side));
    }

    // Get the face of the block holding this one up
    const face = this.getSupportFace();
    if (face === null) return true;

    // Check if the block on the face holds this one up
    return this.isSupportedFrom(face);
  }

  /**
   * Whether the block on a face of this block holds it up.
   * @param face The face of the block holding this one up.
   */
  protected isSupportedFrom(face: BlockFace): boolean {
    // Get the position of the block holding this one up
    const [dx, dy, dz] = FaceOffsets[face];
    const { x, y, z } = this.block.position;
    const position = new BlockPosition(x + dx, y + dy, z + dz);

    // Blocks in chunks that are not loaded are assumed to be there
    if (!this.isLoaded(position)) return true;

    // Crops are only held up by farmland
    const support = this.dimension.getBlock(position);
    if (this.kind === "crop")
      return support.identifier === BlockIdentifier.Farmland;

    // Hanging signs are not held up by other signs, but for hanging signs on a wall in line with them
    if (this.kind === "hanging_sign" && this.block.hasTrait(BlockSignTrait)) {
      const sign = this.block.getTrait(BlockSignTrait);
      return this.block.getState<boolean>("hanging")
        ? sign.canHoldUp(support)
        : sign.holdsUpOnWall(support);
    }

    // The block is held up by anything but air and liquids
    return !support.isAir && !support.isLiquid;
  }

  /**
   * Whether a hanging sign on a wall is held up from one of its sides: by the block on that side,
   * or, when that is another hanging sign in line with it, by what holds up the line of signs on that side.
   * Signs in a line do not hold each other up, so the line breaks when nothing at either end holds it.
   * @param face The side of the sign.
   */
  protected isHeldAlong(face: BlockFace): boolean {
    // Get the sign trait of the block
    if (!this.block.hasTrait(BlockSignTrait)) return true;
    const sign = this.block.getTrait(BlockSignTrait);

    // Walk along the line of signs on the side, up to the length of a chunk
    const [dx, , dz] = FaceOffsets[face];
    const { x, y, z } = this.block.position;
    for (let step = 1; step <= 16; step++) {
      // Get the position of the next block along the line
      const position = new BlockPosition(x + dx * step, y, z + dz * step);

      // Blocks in chunks that are not loaded are assumed to hold the sign up
      if (!this.isLoaded(position)) return true;

      // Check if the block holds up the sign, and if it is the end of the line of signs
      const block = this.dimension.getBlock(position);
      if (!sign.holdsUpOnWall(block)) return false;
      if (!block.identifier.endsWith("_hanging_sign")) return true;
    }

    // A line of signs longer than that is not held up
    return false;
  }

  /**
   * Whether the chunk holding a position is loaded.
   * @param position The position to check.
   */
  protected isLoaded(position: BlockPosition): boolean {
    const chunks = this.dimension.world.provider.chunks.get(this.dimension);
    const hash = ChunkCoords.hash({ x: position.x >> 4, z: position.z >> 4 });
    return chunks?.has(hash) ?? false;
  }

  /**
   * Gets the face of the block that the block holding this one up is on, if it needs one.
   */
  public getSupportFace(): BlockFace | null {
    switch (this.kind) {
      // Blocks attached to a face are held up by the block behind them
      case "face":
      case "wall": {
        const facing = this.block.getState<number>("facing_direction");
        return OppositeFaces[facing as BlockFace] ?? null;
      }

      // Levers are held up by the block their direction names
      case "lever": {
        const direction = this.block.getState<string>("lever_direction");
        return LeverSupportFaces[direction] ?? null;
      }

      // Blocks resting on the block below are held up by it
      case "floor":
        return BlockFace.Bottom;

      // The upper half of a door is held up by the lower half, which breaks it
      case "door":
        return this.block.getState<boolean>("upper_block_bit")
          ? null
          : BlockFace.Bottom;

      // Lanterns hang from the block above, or stand on the block below
      case "lantern":
        return this.block.getState<boolean>("hanging")
          ? BlockFace.Top
          : BlockFace.Bottom;

      // Crops are planted in the farmland below
      case "crop":
        return BlockFace.Bottom;

      // Hanging signs under a ceiling hang from the block above
      case "hanging_sign":
        return this.block.getState<boolean>("hanging") ? BlockFace.Top : null;

      default:
        return null;
    }
  }

  /**
   * Sets the direction of a lever from the face it was placed on.
   * Levers on the top or bottom of a block lie along the direction the player faces.
   * @param face The face the lever was placed on.
   * @param direction The direction the player placing the lever faces.
   */
  protected setLeverDirection(
    face: BlockFace,
    direction?: CardinalDirection
  ): void {
    // Check if the player faces north or south, rather than east or west
    const northSouth =
      direction === CardinalDirection.North ||
      direction === CardinalDirection.South;
    const axis = northSouth ? "north_south" : "east_west";

    // Get the lever direction of the face
    const leverDirection =
      face === BlockFace.Top
        ? `up_${axis}`
        : face === BlockFace.Bottom
          ? `down_${axis}`
          : LeverWallDirections[face];

    // Set the lever direction of the block
    if (leverDirection) this.block.setState("lever_direction", leverDirection);
  }
}

export { BlockAttachmentTrait };
