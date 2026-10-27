import {
  Endianness,
  Float32,
  VarInt,
  VarLong,
  Uint8,
  VarString
} from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import {
  AnimateSwingSourceType,
  type AnimateType,
  type HandSlot,
  Packet
} from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.Animate)
class AnimatePacket extends DataPacket {
  /**
   * The type of the animation.
   */
  @Serialize(Uint8) public type!: AnimateType;

  /**
   * The runtime ID of the entity.
   */
  @Serialize(VarLong) public actorRuntimeId!: bigint;

  /**
   * The data of the animation.
   */
  @Serialize(Float32, { endian: Endianness.Little })
  public data!: number;

  /**
   * The swing source type of the animation.
   */
  @Serialize(VarString, { optional: true })
  public swingSourceType!: AnimateSwingSourceType | null;

  /**
   * The hand that is animating.
   * The client defaults to the main hand when this is not provided.
   */
  @Serialize(VarInt, { optional: true })
  public hand?: HandSlot;
}

export { AnimatePacket };
