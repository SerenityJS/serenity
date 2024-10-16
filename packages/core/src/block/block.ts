import {
  BlockPosition,
  UpdateBlockFlagsType,
  UpdateBlockLayerType,
  UpdateBlockPacket
} from "@serenityjs/protocol";

import { Dimension } from "../world";
import { JSONLikeValue } from "../types";
import { Chunk } from "../world/chunk";

import { BlockPermutation } from "./identity";

class Block {
  public readonly dimension: Dimension;

  public readonly position: BlockPosition;

  public readonly components = new Map<string, JSONLikeValue>();

  public readonly traits = new Map<string, unknown>();

  public permutation: BlockPermutation;

  public constructor(
    dimension: Dimension,
    position: BlockPosition,
    permutation: BlockPermutation
  ) {
    this.dimension = dimension;
    this.position = position;
    this.permutation = permutation;
  }

  /**
   * Whether or not the block is air.
   */
  public isAir(): boolean {
    return this.permutation.type.air;
  }

  /**
   * Whether or not the block is liquid.
   */
  public isLiquid(): boolean {
    return this.permutation.type.liquid;
  }

  /**
   * Whether or not the block is solid.
   */
  public isSolid(): boolean {
    return this.permutation.type.solid;
  }

  /**
   * Gets the chunk the block is in.
   * @returns The chunk the block is in.
   */
  public getChunk(): Chunk {
    // Calculate the chunk coordinates.
    const cx = this.position.x >> 4;
    const cz = this.position.z >> 4;

    // Get the chunk from the dimension.
    return this.dimension.getChunk(cx, cz);
  }

  public setPermutation(permutation: BlockPermutation): void {
    // Check if the type of the permutation has changed.
    if (this.permutation.type !== permutation.type) {
      // Clear the components and traits if the type has changed.
      this.traits.clear();
      this.components.clear();
    }

    // Get the chunk the block is in.
    const chunk = this.getChunk();

    // Set the permutation of the block.
    chunk.setPermutation(this.position, permutation);

    // Create a new UpdateBlockPacket to broadcast the change.
    const packet = new UpdateBlockPacket();

    // Assign the block position and permutation to the packet.
    packet.networkBlockId = permutation.network;
    packet.position = this.position;
    packet.flags = UpdateBlockFlagsType.Network;
    packet.layer = UpdateBlockLayerType.Normal;

    // Broadcast the packet to the dimension.
    this.dimension.broadcast(packet);

    // Update the permutation of the block.
    this.permutation = permutation;
  }
}

export { Block };
