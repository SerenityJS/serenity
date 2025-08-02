import { Proto, Serialize } from "@serenityjs/raknet";
import {
  Endianness,
  Float32,
  Uint32,
  Uint64,
  VarString
} from "@serenityjs/binarystream";

import { Vector3f } from "../types";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientBoundDebugRenderer)
class ClientBoundDebugRendererPacket extends DataPacket {
  @Serialize(Uint32, { endian: Endianness.Little }) public type!: number;
  @Serialize(VarString) public text!: string;
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(Float32, { endian: Endianness.Little }) public red!: number;
  @Serialize(Float32, { endian: Endianness.Little }) public green!: number;
  @Serialize(Float32, { endian: Endianness.Little }) public blue!: number;
  @Serialize(Float32, { endian: Endianness.Little }) public alpha!: number;
  @Serialize(Uint64, { endian: Endianness.Little }) public duration!: bigint;
}

export { ClientBoundDebugRendererPacket };
