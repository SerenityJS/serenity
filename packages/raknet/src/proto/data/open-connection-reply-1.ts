import { Int64, Bool, Int16 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Magic } from "../types";

import { BasePacket } from "./base";

/**
 * Represents an open connection reply 1 packet.
 */
@Proto(Packet.OpenConnectionReply1)
class OpenConnectionReply1 extends BasePacket {
  /**
   * The magic bytes of the reply.
   */
  @Serialize(Magic) public magic!: Buffer;

  /**
   * The server guid of the reply.
   */
  @Serialize(Int64) public guid!: bigint;

  /**
   * If raknet is using security.
   */
  @Serialize(Bool) public security!: boolean;

  /**
   * The maximum transfer unit of the reply.
   */
  @Serialize(Int16) public mtu!: number;
}

export { OpenConnectionReply1 };
