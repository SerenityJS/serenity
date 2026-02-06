import { Proto, Serialize } from "@serenityjs/raknet";
import { Endianness, Uint16, VarInt } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import {
  TypeArray,
  SerializableVoxelShape,
  SerializableVoxelRegistryHandle
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.VoxelShapesPacket)
class VoxelShapesPacket extends DataPacket {
  /**
   * Voxel shape structural data
   */
  @Serialize(TypeArray(SerializableVoxelShape, VarInt))
  public shapes!: Array<SerializableVoxelShape>;

  /**
   * Voxel shape registry names mapped to their shape indices
   */
  @Serialize(TypeArray(SerializableVoxelRegistryHandle, VarInt))
  public names!: Array<SerializableVoxelRegistryHandle>;

  /**
   * TODO: investigate what this field does
   */
  @Serialize(Uint16, { endian: Endianness.Little })
  private unknown = 0;
}

export { VoxelShapesPacket };
