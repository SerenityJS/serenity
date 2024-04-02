import { VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { EntityProperties, MetadataDictionary } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetEntityData)
class SetEntityDataPacket extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(MetadataDictionary) public metadata!: Array<MetadataDictionary>;
	@Serialize(EntityProperties) public properties!: EntityProperties;
	@Serialize(VarLong) public tick!: bigint;
}

export { SetEntityDataPacket };
