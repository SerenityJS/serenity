import { Proto, Serialize } from "@serenityjs/raknet";
import { Float32, Uint8 } from "@serenityjs/binarystream";

import { Packet, ShakeAction, ShakeType } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.CameraShake)
class CameraShakePacket extends DataPacket {
	@Serialize(Float32)
	public intensity!: number;

	@Serialize(Float32)
	public duration!: number;

	@Serialize(Uint8)
	public shakeType!: ShakeType;

	@Serialize(Uint8)
	public shakeAction!: ShakeAction;
}

export { CameraShakePacket };
