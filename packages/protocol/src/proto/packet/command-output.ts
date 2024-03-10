import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { CommandOutputData } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.CommandOutput)
class CommandOutput extends DataPacket {
	@Serialize(CommandOutputData) public originData!: CommandOutputData;
}

export { CommandOutput };
