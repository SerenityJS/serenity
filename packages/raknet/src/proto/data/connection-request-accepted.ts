import { Int64, Int16 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Address, SystemAddress } from "../types";

import { BasePacket } from "./base";

/**
 * Represents an connection request accepted packet.
 */
@Proto(Packet.ConnectionRequestAccepted)
class ConnectionRequestAccepted extends BasePacket {
  /**
   * The client address of the request.
   */
  @Serialize(Address) public address!: Address;

  /**
   * The system index of the request.
   */
  @Serialize(Int16) public systemIndex!: number;

  /**
   * The system address of the request.
   */
  @Serialize(SystemAddress) public systemAddress!: Array<Address>;

  /**
   * The request timestamp of the request.
   */
  @Serialize(Int64) public requestTimestamp!: bigint;

  /**
   * The timestamp of the request.
   */
  @Serialize(Int64) public timestamp!: bigint;
}

export { ConnectionRequestAccepted };
