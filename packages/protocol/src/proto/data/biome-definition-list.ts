import { Buffer } from "node:buffer";

import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.BiomeDefinitionList)
class BiomeDefinitionListPacket extends DataPacket {
  public biomes!: Buffer;

  public serialize(): Buffer {
    this.writeVarInt(Packet.BiomeDefinitionList);
    this.write(this.biomes);

    return this.getBuffer();
  }

  public deserialize(): this {
    this.readVarInt();

    // Get the remaining length of the buffer after reading the packet ID
    const remainingLength = Buffer.byteLength(this.buffer) - this.offset;

    this.biomes = this.read(remainingLength);

    return this;
  }
}

export { BiomeDefinitionListPacket };
