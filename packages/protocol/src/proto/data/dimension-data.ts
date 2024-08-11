import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { DimensionDefinitionGroup } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.DimensionData)
class DimensionDataPacket extends DataPacket {
	@Serialize(DimensionDefinitionGroup)
	public definitionGroup!: DimensionDefinitionGroup;
}

export { DimensionDataPacket };
