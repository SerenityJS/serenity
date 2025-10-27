import { Int64 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Address } from "../types";

import { BasePacket } from "./base";

/**
 * Represents an open connection reply 1 packet.
 */
@Proto(Packet.NewIncomingConnection)
class NewIncomingConnection extends BasePacket {
  /**
   * the server adress of the reply.
   */
  @Serialize(Address) public serverAddress!: Address;

  /**
   * unknown what this is used for.
   */
  @Serialize(Address) public internalAddress!: Address;

  /**
   * The incoming timestamp of the reply.
   */
  @Serialize(Int64) public incomingTimestamp!: bigint;

  /**
   * The server timestamp of the reply.
   */
  @Serialize(Int64) public serverTimestamp!: bigint;
}

export { NewIncomingConnection };
