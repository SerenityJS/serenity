import { Proto, Serialize } from "@serenityjs/raknet";
import {
  Bool,
  Endianness,
  Float32,
  VarString,
  Uint64,
  ZigZag
} from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { BlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlaySound)
class PlaySoundPacket extends DataPacket {
  @Serialize(VarString) public name!: string;
  @Serialize(BlockPosition) public position!: BlockPosition;
  @Serialize(Float32, { endian: Endianness.Little }) public volume!: number;
  @Serialize(Float32, { endian: Endianness.Little }) public pitch!: number;
  @Serialize(ZigZag) public loopCount!: number;
  @Serialize(Bool) public bypassListenerRangeCheck!: boolean;

  @Serialize(Uint64, { endian: Endianness.Little, optional: true })
  public serverSoundHandle?: bigint;

  @Serialize(Float32, { endian: Endianness.Little, optional: true })
  public playbackPositionSeconds?: number;
}

export { PlaySoundPacket };
