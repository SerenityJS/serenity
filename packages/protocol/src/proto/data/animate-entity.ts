import { Proto, Serialize } from "@serenityjs/raknet";
import {
  Endianness,
  Float32,
  Int32,
  VarString
} from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { AnimateEntity } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.AnimateEntity)
class AnimateEntityPacket extends DataPacket {
  /**
   * The name of the animation to play at the specified entities.
   */
  @Serialize(VarString) public animation!: string;

  /**
   * The next state to transition to after the animation is complete.
   */
  @Serialize(VarString) public nextState!: string;

  /**
   * The stop expression, the condition that determines when to transition to the next state.
   */
  @Serialize(VarString) public stopExpression!: string;

  /**
   * TODO: Find out what this field does.
   */
  @Serialize(Int32, { endian: Endianness.Little })
  public stopExpressionVersion!: number;

  /**
   * The name of the animation controller to use for this animation.
   */
  @Serialize(VarString) public controller!: string;

  /**
   * The time it takes to blend out of the animation.
   */
  @Serialize(Float32, { endian: Endianness.Little })
  public blendOutTime!: number;

  /**
   * The runtime IDs of the entities to animate.
   */
  @Serialize(AnimateEntity) public actorRuntimeIds!: Array<bigint>;
}

export { AnimateEntityPacket };
