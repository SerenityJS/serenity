import { Long, Bool, Short } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Address, Magic } from "../types";

import { BasePacket } from "./base";
import { serialize } from "v8";

/**
 * Represents an open connection reply 1 packet.
 */
@Proto(Packet.NewIncomingConnection)
class NewIncomingConnection extends BasePacket {
  /**
   * the server adress of the reply.
   */
  @serialize(Address) public serverAddress!: string;

  /**
   * unknown what this is used for.
   */
  @serialize(Address) public internalAddress!: string;

  /**
   * The incoming timestamp of the reply.
   */
  @Serialize(Long) public incomingTimestamp!: bigint;

  /**
   * The server timestamp of the reply.
   */
  @Serialize(Long) public serverTimestamp!: bigint;
}

export { NewIncomingConnection };
