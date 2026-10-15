import { BlockFace } from "@serenityjs/protocol";

import { BlockState } from "../types";

import { BlockConnectionTrait } from "./connection";

import type { Block } from "../block";
import type { BlockSide } from "./connection";

/**
 * Connects walls to the blocks next to them, and raises their posts.
 */
class BlockWallConnectionTrait extends BlockConnectionTrait {
  public static readonly identifier = "wall_connection";
  public static readonly state = "wall_post_bit";

  public onUpdate(): void {
    // Get the block above the wall, which decides how tall it is.
    const above = this.block.above();

    // Prepare the connection states of the wall.
    const state: BlockState = {};

    // Check which sides the wall connects to, and how tall each side is.
    for (const side of BlockConnectionTrait.sides) {
      state[`wall_connection_type_${side.name}`] = this.wallConnects(side)
        ? this.coversSide(above, side)
          ? "tall"
          : "short"
        : "none";
    }

    // Check whether the wall has a post.
    state.wall_post_bit = this.hasPost(above, state);

    // Set the connection states of the wall.
    this.setStates(state);
  }

  /**
   * Whether the wall connects to the block on a side.
   * @param side The side to check.
   * @returns Whether the wall connects to the block on the side.
   */
  private wallConnects(side: BlockSide): boolean {
    // Get the block on the side.
    const neighbor = this.block.face(side.face);

    // Walls connect to walls, glass panes, bars and fence gates in line with them.
    return (
      this.isWall(neighbor) ||
      this.isThin(neighbor.identifier) ||
      this.isFenceGateInLine(neighbor, side) ||
      this.isSturdy(neighbor, side.opposite)
    );
  }

  /**
   * Whether the block above the wall covers a side of it, making that side tall.
   * @param above The block above the wall.
   * @param side The side of the wall.
   */
  private coversSide(above: Block, side: BlockSide): boolean {
    // A full bottom face covers every side.
    if (this.isSturdy(above, BlockFace.Bottom)) return true;

    // A wall covers the sides it connects to.
    return (
      this.isWall(above) &&
      above.getState<string>(`wall_connection_type_${side.name}`) !== "none"
    );
  }

  /**
   * Whether the wall has a post.
   * @param above The block above the wall.
   * @param state The connection states of the wall.
   */
  private hasPost(above: Block, state: BlockState): boolean {
    // A wall under a wall post, or under a block that stands on the post, has one too.
    if (this.isWall(above) && above.getState<boolean>("wall_post_bit"))
      return true;
    if (this.standsOnPost(above)) return true;

    // Get the sides the wall connects to.
    const north = state.wall_connection_type_north !== "none";
    const east = state.wall_connection_type_east !== "none";
    const south = state.wall_connection_type_south !== "none";
    const west = state.wall_connection_type_west !== "none";

    // Straight walls have no post; ends, corners and junctions do.
    if (north && south && !east && !west) return false;
    if (east && west && !north && !south) return false;
    return true;
  }

  /**
   * Whether a block stands on the post of the wall below it.
   * @param block The block to check.
   */
  private standsOnPost(block: Block): boolean {
    // Get the identifier of the block.
    const identifier = block.identifier;

    // Lanterns that do not hang stand on the post.
    if (identifier.endsWith("lantern") && block.hasState("hanging"))
      return !block.getState<boolean>("hanging");

    // Torches placed on top of the wall stand on the post.
    if (block.hasState("torch_facing_direction"))
      return block.getState<string>("torch_facing_direction") === "top";

    // Standing signs stand on the post.
    return identifier.endsWith("standing_sign");
  }
}

export { BlockWallConnectionTrait };
