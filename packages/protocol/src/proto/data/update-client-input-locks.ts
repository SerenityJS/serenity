import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateClientInputLocks)
class UpdateClientInputLocksPacket extends DataPacket {
	@Serialize(VarInt) public flags!: number;
	@Serialize(Vector3f) public position!: Vector3f;
}

export { UpdateClientInputLocksPacket };
