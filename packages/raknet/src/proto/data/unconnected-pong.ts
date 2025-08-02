import { Int64, String16 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Magic } from "../types";

import { BasePacket } from "./base";

/**
 * Represents an unconnected pong packet.
 */
@Proto(Packet.UnconnectedPong)
class UnconnectedPong extends BasePacket {
  /**
   * The timestamp of the pong.
   */
  @Serialize(Int64) public timestamp!: bigint;

  /**
   * The server guid of the pong.
   */
  @Serialize(Int64) public guid!: bigint;

  /**
   * The magic bytes of the pong.
   */
  @Serialize(Magic) public magic!: Buffer;

  /**
   * The server message of the pong.
   */
  @Serialize(String16) public message!: string;
}

export { UnconnectedPong };
