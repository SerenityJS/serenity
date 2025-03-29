import { CompoundTag, Tag } from "@serenityjs/nbt";
import { BlockActorDataPacket } from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";

import { Block } from "../block";
import { Player } from "../../entity";
import { AsyncMap } from "../../utility";

class NbtMap extends AsyncMap<string, Tag> {
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

  public async add(value: Tag): Promise<this> {
    // Call the super method
    await super.set(value.name, value);

    // Update the block with the new NBT data
    await this.update();

    // Return the instance
    return this;
  }

  public async set(key: string, value: Tag): Promise<this> {
    // Call the super method
    await super.set(key, value);

    // Update the block with the new NBT data
    await this.update();

    // Return the instance
    return this;
  }

  public async delete(key: string): Promise<boolean> {
    // Call the super method
    const result = super.delete(key);

    // Update the block with the new NBT data
    await this.update();

    // Return the result
    return result;
  }

  public async clear(): Promise<void> {
    // Call the super method
    await super.clear();

    // Update the block with the new NBT data
    await this.update();
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
  public async fromCompound(root: CompoundTag<unknown>): Promise<void> {
    // Iterate over the tags in the compound
    await Promise.all(
      root.getTags().map(async (tag) => {
        // Set the tag in the map
        await this.set(tag.name, tag);
      })
    );
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

  public async deserialize(buffer: Buffer): Promise<void> {
    // Create a new BinaryStream to read the data
    const stream = new BinaryStream(buffer);

    // Read the compound tag from the stream
    const root = CompoundTag.read(stream);

    // Add the tags from the compound to the map
    await this.fromCompound(root);
  }

  public async update(player?: Player): Promise<void> {
    // Create a new BlockActorData packet
    const packet = new BlockActorDataPacket();

    // Assign the packet values
    packet.position = this.block.position;
    packet.nbt = this.toCompound();

    // Broadcast the packet to the player or dimension
    if (player) await player.send(packet);
    else return this.block.dimension.broadcast(packet);
  }
}

export { NbtMap };
