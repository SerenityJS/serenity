import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { CommandOutputData } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.CommandOutput)
class CommandOutputPacket extends DataPacket {
  @Serialize(CommandOutputData) public originData!: CommandOutputData;
}

export { CommandOutputPacket };
