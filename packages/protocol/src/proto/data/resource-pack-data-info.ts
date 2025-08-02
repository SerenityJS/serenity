import { Endianness } from "@serenityjs/binarystream";
import { Proto } from "@serenityjs/raknet";

import { Packet, type PackType } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePackDataInfo)
class ResourcePackDataInfoPacket extends DataPacket {
  public packId!: string;
  public maxChunkSize!: number;
  public chunkCount!: number;
  public fileSize!: bigint;
  public fileHash!: Buffer;
  public isPremium!: boolean;
  public packType!: PackType;

  public override serialize(): Buffer {
    this.writeVarInt(Packet.ResourcePackDataInfo);

    this.writeVarString(this.packId);
    this.writeUint32(this.maxChunkSize, Endianness.Little);
    this.writeUint32(this.chunkCount, Endianness.Little);
    this.writeUint64(this.fileSize, Endianness.Little);

    this.writeVarInt(this.fileHash.byteLength);
    this.write(this.fileHash);

    this.writeBool(this.isPremium);
    this.writeUint8(this.packType);

    return this.getBuffer();
  }

  public override deserialize(): this {
    this.readVarInt();

    this.packId = this.readVarString();
    this.maxChunkSize = this.readUint32(Endianness.Little);
    this.chunkCount = this.readUint32(Endianness.Little);
    this.fileSize = this.readUint64(Endianness.Little);

    const hashLength = this.readVarInt();
    this.fileHash = this.read(hashLength);

    this.isPremium = this.readBool();
    this.packType = this.readUint8();

    return this;
  }
}

export { ResourcePackDataInfoPacket };
