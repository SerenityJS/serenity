import { Bool } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetCommandsEnabled)
class SetCommandsEnabledPacket extends DataPacket {
	@Serialize(Bool) public enabled!: boolean;
}

export { SetCommandsEnabledPacket };
