import { Proto, Serialize } from "@serenityjs/raknet";
import {
  VarInt,
  VarString,
  Uint16,
  Endianness
} from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { SerializableVoxelShape, TypeArray } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.VoxelShapesPacket)
class VoxelShapesPacket extends DataPacket {
  /**
   * Voxel shape structural data
   */
  @Serialize(TypeArray(SerializableVoxelShape, VarInt))
  public shapes!: Array<SerializableVoxelShape>;

  @Serialize(VarString) public hashString!: string;

  @Serialize(Uint16, { endian: Endianness.Little })
  public registryHandle!: number;
}

export { VoxelShapesPacket };
