import { Endianness } from "@serenityjs/binarystream";
import { Proto } from "@serenityjs/raknet";

import { DimensionType, Packet } from "../../enums";
import { SubChunkPosition, SubChunkRequestPositionOffset } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SubChunkRequest)
export class SubChunkRequestPacket extends DataPacket {
  public dimension!: DimensionType;
  public offsets!: Array<SubChunkRequestPositionOffset>;
  public position!: SubChunkPosition;

  public override serialize(): Buffer {
    this.writeVarInt(Packet.SubChunkRequest);
    this.writeZigZag(this.dimension);
    this.writeVarInt(this.offsets.length);

    for (const offset of this.offsets) {
      SubChunkRequestPositionOffset.write(this, offset);
    }

    this.writeInt32(this.position.x, Endianness.Little);
    this.writeInt32(this.position.y, Endianness.Little);
    this.writeInt32(this.position.z, Endianness.Little);

    return this.getBuffer();
  }

  public override deserialize(): this {
    this.readVarInt();
    this.dimension = this.readZigZag();

    const offsetCount = this.readVarInt();
    this.offsets = [];

    for (let i = 0; i < offsetCount; i++) {
      this.offsets.push(SubChunkRequestPositionOffset.read(this));
    }

    this.position = new SubChunkPosition(
      this.readInt32(Endianness.Little),
      this.readInt32(Endianness.Little),
      this.readInt32(Endianness.Little)
    );

    return this;
  }
}
