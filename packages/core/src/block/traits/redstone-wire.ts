import { BlockFace } from "@serenityjs/protocol";

import { BlockIdentifier } from "../../enums";
import { BlockState } from "../types";

import { BlockConnectionTrait, type BlockSide } from "./connection";
import { BlockTrait } from "./trait";

import type { Block } from "../block";

/**
 * How redstone dust connects on a side.
 */
type RedstoneSide = "none" | "side" | "up";

/**
 * The blocks redstone dust connects to from any side, as they give out power.
 * Repeaters and observers only give out power on one side, so they are checked separately.
 */
const SIGNAL_SOURCES = new Set<string>([
  "minecraft:redstone_torch",
  "minecraft:unlit_redstone_torch",
  "minecraft:lever",
  "minecraft:redstone_block",
  "minecraft:daylight_detector",
  "minecraft:daylight_detector_inverted",
  "minecraft:target",
  "minecraft:trapped_chest",
  "minecraft:tripwire_hook",
  "minecraft:detector_rail",
  "minecraft:powered_comparator",
  "minecraft:unpowered_comparator",
  "minecraft:lectern",
  "minecraft:sculk_sensor",
  "minecraft:calibrated_sculk_sensor"
]);

/**
 * Solid blocks that do not conduct power, so redstone dust can climb past them.
 */
const NON_CONDUCTORS = new Set<string>([
  "minecraft:redstone_block",
  "minecraft:observer",
  "minecraft:piston",
  "minecraft:sticky_piston",
  "minecraft:glowstone"
]);

/**
 * Shapes redstone dust towards the blocks it connects to, as vanilla does.
 * Since 1.26.60 the shape is made of block states the server sets,
 * rather than something the client works out.
 */
class BlockRedstoneWireTrait extends BlockTrait {
  public static readonly identifier = "redstone_wire";
  public static readonly types = [BlockIdentifier.RedstoneWire];

  /**
   * The horizontal sides of redstone dust.
   */
  protected static readonly sides: Array<BlockSide> = [
    { face: BlockFace.North, opposite: BlockFace.South, name: "north" },
    { face: BlockFace.East, opposite: BlockFace.West, name: "east" },
    { face: BlockFace.South, opposite: BlockFace.North, name: "south" },
    { face: BlockFace.West, opposite: BlockFace.East, name: "west" }
  ];

  public onUpdate(): void {
    // Dust only climbs up the sides when nothing conducting is above it.
    const canClimb = !this.isConductor(this.block.above());

    // Work out how the dust connects on each side.
    const sides = {} as Record<BlockSide["name"], RedstoneSide>;
    for (const side of BlockRedstoneWireTrait.sides)
      sides[side.name] = this.getConnection(side, canClimb);

    // Dust that points only one way also points the opposite way,
    // and dust that points nowhere is a cross, as in vanilla.
    const northSouth = sides.north !== "none" || sides.south !== "none";
    const eastWest = sides.east !== "none" || sides.west !== "none";
    if (!northSouth) {
      if (sides.east === "none") sides.east = "side";
      if (sides.west === "none") sides.west = "side";
    }
    if (!eastWest) {
      if (sides.north === "none") sides.north = "side";
      if (sides.south === "none") sides.south = "side";
    }

    // Set the shape of the dust.
    const state: BlockState = {};
    for (const [name, connection] of Object.entries(sides))
      state[`redstone_${name}`] = connection;

    // Dust diagonally above and below connects up to this dust,
    // so it is updated whenever the shape of this dust changes.
    if (this.setStates(state)) this.updateDiagonalDust();
  }

  public onBreak(): void {
    // Update the dust diagonally above and below once this dust is gone.
    queueMicrotask(() => this.updateDiagonalDust());
  }

  /**
   * Works out how the dust connects on a side.
   * @param side The side to check.
   * @param canClimb Whether the dust can climb up the sides.
   * @returns How the dust connects on the side.
   */
  protected getConnection(side: BlockSide, canClimb: boolean): RedstoneSide {
    // Get the block on the side.
    const neighbor = this.block.face(side.face);

    // Dust climbs up a block that has dust on top of it.
    if (
      canClimb &&
      this.canHoldDust(neighbor) &&
      this.isDust(neighbor.above())
    ) {
      // It only runs up the face of the block when the face is full.
      return BlockConnectionTrait.isFaceSturdy(neighbor, side.opposite)
        ? "up"
        : "side";
    }

    // Dust connects to more dust, and to blocks that give out power towards it.
    if (this.connectsTo(neighbor, side)) return "side";

    // Dust also runs down the side of a block that does not conduct, to dust below it.
    if (!this.isConductor(neighbor) && this.isDust(neighbor.below()))
      return "side";

    return "none";
  }

  /**
   * Whether the dust connects to a block next to it.
   * @param block The block next to the dust.
   * @param side The side of the dust the block is on.
   */
  protected connectsTo(block: Block, side: BlockSide): boolean {
    const { identifier } = block;

    // Dust connects to more dust.
    if (this.isDust(block)) return true;

    // Repeaters only connect at their front and back.
    if (identifier.endsWith("_repeater")) {
      const facing = block.getState<string>("minecraft:cardinal_direction");
      const facesNorthSouth = facing === "north" || facing === "south";
      const sideNorthSouth = side.name === "north" || side.name === "south";

      return facesNorthSouth === sideNorthSouth;
    }

    // Observers only connect at their back, where they give out power.
    if (identifier === "minecraft:observer")
      return block.getState<string>("minecraft:facing_direction") === side.name;

    // Other blocks that give out power connect from any side.
    return (
      SIGNAL_SOURCES.has(identifier) ||
      identifier.endsWith("_button") ||
      identifier.endsWith("_pressure_plate")
    );
  }

  /**
   * Whether a block is redstone dust.
   * @param block The block to check.
   */
  protected isDust(block: Block): boolean {
    return block.identifier === BlockIdentifier.RedstoneWire;
  }

  /**
   * Whether a block conducts power, which stops dust from climbing past it.
   * @param block The block to check.
   */
  protected isConductor(block: Block): boolean {
    return block.type.solid && !NON_CONDUCTORS.has(block.identifier);
  }

  /**
   * Whether dust can be placed on top of a block.
   * @param block The block to check.
   */
  protected canHoldDust(block: Block): boolean {
    return (
      block.identifier === "minecraft:hopper" ||
      BlockConnectionTrait.isFaceSturdy(block, BlockFace.Top)
    );
  }

  /**
   * Updates the dust diagonally above and below this dust, which may connect up or down to it.
   */
  protected updateDiagonalDust(): void {
    for (const side of BlockRedstoneWireTrait.sides) {
      // Get the block on the side, and the blocks above and below it.
      const neighbor = this.block.face(side.face);

      for (const diagonal of [neighbor.above(), neighbor.below()])
        if (this.isDust(diagonal)) diagonal.update();
    }
  }
}

export { BlockRedstoneWireTrait };
