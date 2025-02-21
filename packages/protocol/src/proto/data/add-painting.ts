import { DataPacket, Vector3f } from "@serenityjs/protocol";
import { ZigZong, ZigZag, VarString } from "@serenityjs/binarystream";
import { Serialize, Proto } from "@serenityjs/raknet";
import { Packet } from "../../enums";

@Proto(Packet.AddPainting)
class AddPaintingPacket extends DataPacket {
	@Serialize(ZigZong) public uniqueId!: number;
	@Serialize(ZigZong) public runtimeId!: number;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(ZigZag) public direction!: number;
	@Serialize(VarString) public name!: string;
}

export { AddPaintingPacket };