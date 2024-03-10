import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { CreativeItems } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.CreativeContent)
class CreativeContent extends DataPacket {
	@Serialize(CreativeItems) public items!: Array<CreativeItems>;
}

export { CreativeContent };
