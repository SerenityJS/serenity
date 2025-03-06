import { CompoundTag, Tag } from "@serenityjs/nbt";
import { BlockActorDataPacket } from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";

import { Block } from "../block";
import { Player } from "../../entity";

class NbtMap extends Map<string, Tag> {
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

  public get<T extends Tag>(key: string): T {
    return super.get(key) as T;
  }

  public add(value: Tag): this {
    // Call the super method
    super.set(value.name, value);

    // Update the block with the new NBT data
    this.update();

    // Return the instance
    return this;
  }

  public set(key: string, value: Tag): this {
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

  /**
   * Converts the nbt map to a compound tag.
   * @returns
   */
  public toCompound(name: string = ""): CompoundTag<unknown> {
    // Create a new compound tag
    const root = new CompoundTag({ name, value: {} });

    // Iterate over the map
    for (const [_, value] of this) {
      // Add the tag to the compound
      root.addTag(value);
    }

    // Return the compound
    return root;
  }

  /**
   * Adds the tags from a compound to the map.
   * @param root The compound tag to add the tags from.
   */
  public fromCompound(root: CompoundTag<unknown>): void {
    // Iterate over the tags in the compound
    for (const tag of root.getTags()) {
      // Set the tag in the map
      this.set(tag.name, tag);
    }
  }

  public serialize(): Buffer {
    // Get the compound tag from the map
    const root = this.toCompound();

    // Create a new BinaryStream to write the data
    const stream = new BinaryStream();

    // Write the compound tag to the stream
    CompoundTag.write(stream, root);

    // Return the buffer
    return stream.getBuffer();
  }

  public deserialize(buffer: Buffer): void {
    // Create a new BinaryStream to read the data
    const stream = new BinaryStream(buffer);

    // Read the compound tag from the stream
    const root = CompoundTag.read(stream);

    // Add the tags from the compound to the map
    this.fromCompound(root);
  }

  public update(player?: Player): void {
    // Create a new BlockActorData packet
    const packet = new BlockActorDataPacket();

    // Assign the packet values
    packet.position = this.block.position;
    packet.nbt = this.toCompound();

    // Broadcast the packet to the player or dimension
    if (player) player.send(packet);
    else this.block.dimension.broadcast(packet);
  }
}

export { NbtMap };
