import { Int64, Bool, Int16 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Address, Magic } from "../types";

import { BasePacket } from "./base";

/**
 * Represents an open connection reply 2 packet.
 */
@Proto(Packet.OpenConnectionReply2)
class OpenConnectionReply2 extends BasePacket {
  /**
   * The magic bytes of the reply.
   */
  @Serialize(Magic) public magic!: Buffer;

  /**
   * The server guid of the reply.
   */
  @Serialize(Int64) public guid!: bigint;

  /**
   * Client adrress.
   */
  @Serialize(Address) public address!: Address;

  /**
   * The maximum transfer unit of the reply.
   */
  @Serialize(Int16) public mtu!: number;

  /**
   * If raknet is using encryption.
   */
  @Serialize(Bool) public encryption!: boolean;
}

export { OpenConnectionReply2 };
