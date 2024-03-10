import { ZigZag, Bool } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { DimensionType, Packet } from "../../enums";
import { Vector3f } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.ChangeDimension)
class ChangeDimension extends DataPacket {
	@Serialize(ZigZag) public dimension!: DimensionType;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Bool) public respawn!: boolean;
}

export { ChangeDimension };
