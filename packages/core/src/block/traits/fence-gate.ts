import { BlockFace } from "@serenityjs/protocol";

import { BlockConnectionTrait } from "./connection";

/**
 * Lowers fence gates in walls: a fence gate sits lower when a wall is on either of its sides,
 * which are at right angles to the way it faces.
 */
class BlockFenceGateTrait extends BlockConnectionTrait {
  public static readonly identifier = "fence_gate";
  public static readonly state = "in_wall_bit";

  public onUpdate(): void {
    // Get the direction the fence gate faces
    const facing = this.block.getState<string>("minecraft:cardinal_direction");

    // Get the sides of the fence gate, at right angles to the way it faces
    const sides =
      facing === "north" || facing === "south"
        ? [BlockFace.East, BlockFace.West]
        : [BlockFace.North, BlockFace.South];

    // Check if a wall is on either side of the fence gate
    const inWall = sides.some((side) => this.isWall(this.block.face(side)));

    // Set whether the fence gate sits lower in the wall
    this.setStates({ in_wall_bit: inWall });
  }
}

export { BlockFenceGateTrait };
