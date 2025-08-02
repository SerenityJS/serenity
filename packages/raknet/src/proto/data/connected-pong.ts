import { Int64 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { BasePacket } from "./base";

/**
 * Represents an connected pong packet.
 */
@Proto(Packet.ConnectedPong)
class ConnectedPong extends BasePacket {
  /**
   * The timestamp of the ping.
   */
  @Serialize(Int64) public pingTimestamp!: bigint;

  /**
   * The timestamp of the pong.
   */
  @Serialize(Int64) public timestamp!: bigint;
}

export { ConnectedPong };
