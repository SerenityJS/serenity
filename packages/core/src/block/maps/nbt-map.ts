import { BaseTag, CompoundTag } from "@serenityjs/nbt";
import { BlockActorDataPacket } from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";

import { Block } from "../block";
import { Player } from "../../entity";

class NbtMap extends CompoundTag {
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

  public get<T extends BaseTag>(key: string): T | undefined {
    // Call the super method to get the tag
    const tag = super.get(key);

    // If the tag is not found, return undefined
    if (!tag) return undefined;

    // Return the tag as the correct type
    return tag as T;
  }

  public add<T extends BaseTag>(tag: T): T {
    // Call the super method to add the tag
    super.add(tag);

    // Update the block with the new NBT data
    this.update();

    // Return the tag
    return tag;
  }

  public set<T extends BaseTag>(key: string, value: T): this {
    // Call the super method to set the tag
    super.set(key, value);

    // Update the block with the new NBT data
    this.update();

    // Return this for chaining
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

  public serialize(): Buffer {
    // Create a new BinaryStream to write the data
    const stream = new BinaryStream();

    // Write the compound tag to the stream
    CompoundTag.write(stream, this);

    // Return the buffer
    return stream.getBuffer();
  }

  public deserialize(buffer: Buffer): void {
    // We cant deserialize a compound tag from an empty buffer.
    if (buffer.length == 0) return;

    // Create a new BinaryStream to read the data
    const stream = new BinaryStream(buffer);

    // Read the compound tag from the stream
    const root = CompoundTag.read(stream);

    // Add the tags from the compound to the map
    this.push(...root.values());
  }

  public update(player?: Player): void {
    // Create a new BlockActorData packet
    const packet = new BlockActorDataPacket();

    // Assign the packet values
    packet.position = this.block.position;
    packet.nbt = this;

    // Broadcast the packet to the player or dimension
    if (player) player.send(packet);
    else this.block.dimension.broadcast(packet);
  }
}

export { NbtMap };
