import { Bool, VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { CommandOriginData } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.CommandRequest)
class CommandRequestPacket extends DataPacket {
  @Serialize(VarString) public command!: string;
  @Serialize(CommandOriginData) public origin!: CommandOriginData;
  @Serialize(Bool) public isInternal!: boolean;
  @Serialize(VarString) public version!: string;
}

export { CommandRequestPacket };
