import { VarString, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type TitleType } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetTitle)
class SetTitlePacket extends DataPacket {
  @Serialize(ZigZag) public type!: TitleType;
  @Serialize(VarString) public text!: string;
  @Serialize(ZigZag) public fadeInTime!: number;
  @Serialize(ZigZag) public stayTime!: number;
  @Serialize(ZigZag) public fadeOutTime!: number;
  @Serialize(VarString) public xuid!: string;
  @Serialize(VarString) public platformOnlineId!: string;
  @Serialize(VarString) public filteredText!: string;
}

export { SetTitlePacket };
