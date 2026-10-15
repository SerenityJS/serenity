import { VarString, Uint16, Endianness, Bool } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { GatheringJoinInfo } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Transfer)
class TransferPacket extends DataPacket {
  @Serialize(VarString) public address!: string;
  @Serialize(Uint16, { endian: Endianness.Little }) public port!: number;
  @Serialize(Bool) public reloadWorld!: boolean;

  @Serialize(GatheringJoinInfo, { optional: true })
  public gatheringJoinInfo?: GatheringJoinInfo;
}

export { TransferPacket };
