import { ZigZag } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { LevelEventId, Packet } from "../../enums";
import { Vector3f } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.LevelEvent)
class LevelEvent extends DataPacket {
	@Serialize(ZigZag) public event!: LevelEventId;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(ZigZag) public data!: number;
}

export { LevelEvent };
