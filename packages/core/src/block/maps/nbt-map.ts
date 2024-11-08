import { CompoundTag, NBTTag } from "@serenityjs/nbt";
import { BlockActorDataPacket } from "@serenityjs/protocol";

import { Block } from "../block";

class NbtMap extends Map<string, NBTTag> {
  /**
   * The block in which the NBT data is attached to.
   */
  protected readonly block: Block;

  /**
   * Create a new NBT map for a block.
   * @param block The block in which the NBT data is attached to.
   */
  public constructor(block: Block) {
    super();
    this.block = block;
  }

  public add(value: NBTTag): this {
    // Call the super method
    super.set(value.name, value);

    // Update the block with the new NBT data
    this.update();

    // Return the instance
    return this;
  }

  public set(key: string, value: NBTTag): this {
    // Call the super method
    super.set(key, value);

    // Update the block with the new NBT data
    this.update();

    // Return the instance
    return this;
  }

  public delete(key: string): boolean {
    // Call the super method
    const result = super.delete(key);

    // Update the block with the new NBT data
    this.update();

    // Return the result
    return result;
  }

  public clear(): void {
    // Call the super method
    super.clear();

    // Update the block with the new NBT data
    this.update();
  }

  public update(): void {
    // Create a new BlockActorData packet
    const packet = new BlockActorDataPacket();

    // Assign the packet values
    packet.position = this.block.position;
    packet.nbt = new CompoundTag();

    // Iterate over the NBT data
    for (const [key, value] of this) packet.nbt.setTag(key, value);

    // Broadcast the packet to the dimension
    this.block.dimension.broadcast(packet);
  }
}

export { NbtMap };
