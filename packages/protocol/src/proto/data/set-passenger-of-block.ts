import { ZigZong } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { PassengerOfBlockArguments } from "../types";

import { DataPacket } from "./data-packet";

/**
 * Sent by the server when an actor starts or stops riding a block.
 */
@Proto(Packet.SetPassengerOfBlock)
class SetPassengerOfBlockPacket extends DataPacket {
  /**
   * The unique actor id of the passenger.
   */
  @Serialize(ZigZong) public passengerUniqueId!: bigint;

  /**
   * The passenger of block state; undefined when the actor stops riding the block.
   */
  @Serialize(PassengerOfBlockArguments, { optional: true })
  public passengerBlockData?: PassengerOfBlockArguments;
}

export { SetPassengerOfBlockPacket };
