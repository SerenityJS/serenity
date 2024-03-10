import { Bool, VarInt, VarString } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { CommandOriginData } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.CommandRequest)
class CommandRequest extends DataPacket {
	@Serialize(VarString) public rawCommand!: string;
	@Serialize(CommandOriginData) public originData!: CommandOriginData;
	@Serialize(Bool) public isInternal!: boolean;
	@Serialize(VarInt) public version!: number;
}

export { CommandRequest };
