import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { CreativeItems } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.CreativeContent)
class CreativeContentPacket extends DataPacket {
	@Serialize(CreativeItems) public items!: Array<CreativeItems>;
}

export { CreativeContentPacket };
