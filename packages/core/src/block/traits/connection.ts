import { BlockFace } from "@serenityjs/protocol";

import { BlockState } from "../types";

import { BlockTrait } from "./trait";

import type { Block } from "../block";

/**
 * A horizontal side of a block.
 */
interface BlockSide {
  /**
   * The face of the block on this side.
   */
  face: BlockFace;

  /**
   * The face of the neighboring block that faces this side.
   */
  opposite: BlockFace;

  /**
   * The name of the side, as block states name it.
   */
  name: "north" | "east" | "south" | "west";
}

/**
 * Connects fences, glass panes, bars and tripwire to the blocks next to them.
 * Since 1.26.50 the connections are block states the server sets,
 * rather than something the client works out.
 */
class BlockConnectionTrait extends BlockTrait {
  public static readonly identifier: string = "connection";
  public static readonly state: string = "minecraft:connection_east";

  /**
   * The horizontal sides of a block.
   */
  protected static readonly sides: Array<BlockSide> = [
    { face: BlockFace.North, opposite: BlockFace.South, name: "north" },
    { face: BlockFace.East, opposite: BlockFace.West, name: "east" },
    { face: BlockFace.South, opposite: BlockFace.North, name: "south" },
    { face: BlockFace.West, opposite: BlockFace.East, name: "west" }
  ];

  public onUpdate(): void {
    // Prepare the connection states of the block.
    const state: BlockState = {};

    // Check which sides the block connects to.
    for (const side of BlockConnectionTrait.sides) {
      state[`minecraft:connection_${side.name}`] = this.connects(side);
    }

    // Set the connection states of the block.
    this.setStates(state);
  }

  /**
   * Whether the block connects to the block on a side.
   * @param side The side to check.
   * @returns Whether the block connects to the block on the side.
   */
  protected connects(side: BlockSide): boolean {
    // Get the identifier of the block, and the block on the side.
    const identifier = this.block.identifier;
    const neighbor = this.block.face(side.face);

    // Tripwire connects to more tripwire, and to tripwire hooks.
    if (identifier === "minecraft:trip_wire") {
      return (
        neighbor.identifier === "minecraft:trip_wire" ||
        neighbor.identifier === "minecraft:tripwire_hook"
      );
    }

    // Glass panes and bars connect to each other, and to walls.
    if (this.isThin(identifier)) {
      return (
        this.isThin(neighbor.identifier) ||
        this.isWall(neighbor) ||
        this.isSturdy(neighbor, side.opposite)
      );
    }

    // Wooden fences connect to wooden fences,
    // and nether brick fences to nether brick fences.
    if (this.isFence(neighbor.identifier)) {
      return (
        (identifier === "minecraft:nether_brick_fence") ===
        (neighbor.identifier === "minecraft:nether_brick_fence")
      );
    }

    // Fences also connect to fence gates in line with them.
    return (
      this.isFenceGateInLine(neighbor, side) ||
      this.isSturdy(neighbor, side.opposite)
    );
  }

  /**
   * Sets states of the block, if any of them changed.
   * @param changes The states to set.
   */
  protected setStates(changes: BlockState): void {
    // Get the current state of the block.
    const state = this.block.permutation.state;

    // Check if any of the states changed, as setting the permutation
    // updates the neighboring blocks, which would update this block again.
    const changed = Object.entries(changes).some(
      ([key, value]) => state[key] !== value
    );

    // Set the permutation of the block, if the states changed.
    if (changed) {
      const permutation = this.block.type.getPermutation({
        ...state,
        ...changes
      });

      // Set the permutation of the block, if it is a different one.
      if (permutation !== this.block.permutation)
        this.block.setPermutation(permutation);
    }
  }

  /**
   * Whether a block is a fence.
   * @param identifier The identifier of the block.
   */
  protected isFence(identifier: string): boolean {
    return identifier.endsWith("_fence");
  }

  /**
   * Whether a block is a glass pane or bars.
   * @param identifier The identifier of the block.
   */
  protected isThin(identifier: string): boolean {
    return identifier.endsWith("glass_pane") || identifier.endsWith("_bars");
  }

  /**
   * Whether a block is a wall.
   * @param block The block to check.
   */
  protected isWall(block: Block): boolean {
    return block.hasState("wall_post_bit");
  }

  /**
   * Whether a block is a fence gate whose sides face a side of this block.
   * @param block The block to check.
   * @param side The side of this block the block is on.
   */
  protected isFenceGateInLine(block: Block, side: BlockSide): boolean {
    // Check if the block is a fence gate.
    if (!block.identifier.endsWith("fence_gate")) return false;

    // Get the direction the fence gate faces.
    const facing = block.getState<string>("minecraft:cardinal_direction");

    // A fence gate's sides are at right angles to the direction it faces.
    const facesNorthSouth = facing === "north" || facing === "south";
    const sideNorthSouth = side.name === "north" || side.name === "south";

    // Return whether the fence gate is in line with this block.
    return facesNorthSouth !== sideNorthSouth;
  }

  /**
   * Whether a face of a block is a full, solid face that blocks can connect to.
   * @param block The block to check.
   * @param face The face of the block to check.
   */
  protected isSturdy(block: Block, face: BlockFace): boolean {
    // Get the identifier and type of the block.
    const { identifier, type } = block;

    // Air and liquids have no faces to connect to.
    if (type.air || type.liquid) return false;

    // Glass and ice are full blocks, though not solid ones.
    if (/(glass|:(\w+_)?ice)$/.test(identifier)) return true;

    // Slabs only have their top or bottom face.
    if (
      identifier.endsWith("_slab") &&
      block.hasState("minecraft:vertical_half")
    ) {
      // Get the half of the block the slab is in.
      const half = block.getState<string>("minecraft:vertical_half");

      // Return whether the face is the slab's full face.
      return face === (half === "top" ? BlockFace.Top : BlockFace.Bottom);
    }

    // Stairs have a full face on their back, and on their top or bottom.
    if (identifier.endsWith("_stairs") && block.hasState("weirdo_direction"))
      return this.isStairsFaceSturdy(block, face);

    // Return whether the block is solid.
    return type.solid;
  }

  /**
   * Whether a face of stairs is full.
   * @param block The stairs to check.
   * @param face The face of the stairs to check.
   */
  private isStairsFaceSturdy(block: Block, face: BlockFace): boolean {
    // Get the states of the stairs.
    const upsideDown = block.getState<boolean>("upside_down_bit");
    const direction = block.getState<number>("weirdo_direction");
    const corner = block.getState<string>("minecraft:corner") ?? "none";

    // The flat side of the stairs is full.
    if (face === BlockFace.Top) return upsideDown;
    if (face === BlockFace.Bottom) return !upsideDown;

    // Outer corners have no full sides.
    if (corner.startsWith("outer")) return false;

    // The sides in clockwise order, starting from the direction 0 faces.
    const clockwise = [
      BlockFace.East,
      BlockFace.South,
      BlockFace.West,
      BlockFace.North
    ];

    // The weirdo direction of the stairs as an index in the clockwise sides.
    const back = [0, 2, 1, 3][direction] ?? 0;

    // The back of the stairs is full.
    if (face === clockwise[back]) return true;

    // Inner corners also have a full side to the left or right of the back.
    if (corner === "inner_left") return face === clockwise[(back + 3) % 4];
    if (corner === "inner_right") return face === clockwise[(back + 1) % 4];

    // Return false, as the face is not full.
    return false;
  }
}

export { BlockConnectionTrait };
export type { BlockSide };
