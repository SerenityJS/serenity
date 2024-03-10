import { VarLong } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { EntityProperties, MetadataDictionary } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetEntityData)
class SetEntityData extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(MetadataDictionary) public metadata!: Array<MetadataDictionary>;
	@Serialize(EntityProperties) public properties!: EntityProperties;
	@Serialize(VarLong) public tick!: bigint;
}

export { SetEntityData };
