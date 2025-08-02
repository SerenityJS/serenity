import { Int64 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { BasePacket } from "./base";

/**
 * Represents an connection request packet.
 */
@Proto(Packet.ConnectionRequest)
class ConnectionRequest extends BasePacket {
  /**
   * The client guid of the request.
   */
  @Serialize(Int64) public client!: bigint;

  /**
   * The timestamp of the request.
   */
  @Serialize(Int64) public timestamp!: bigint;
}

export { ConnectionRequest };
