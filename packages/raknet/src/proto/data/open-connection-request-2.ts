import { Int64, Int16 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Address, Magic } from "../types";

import { BasePacket } from "./base";

/**
 * Represents an open connection request 2 packet.
 */
@Proto(Packet.OpenConnectionRequest2)
class OpenConnectionRequest2 extends BasePacket {
  /**
   * The magic bytes of the request.
   */
  @Serialize(Magic) public magic!: Buffer;

  /**
   * The protocol version of the request.
   */
  @Serialize(Address) public address!: Address;

  /**
   * The mtu of the request.
   */
  @Serialize(Int16) public mtu!: number;

  /**
   * The client guid of the request.
   */
  @Serialize(Int64) public client!: bigint;
}

export { OpenConnectionRequest2 };
