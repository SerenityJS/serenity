import { Proto, Serialize } from "@serenityjs/raknet";
import { Byte, ZigZong, VarString } from "@serenityjs/binarystream";

import { Optional, Vector3f } from "../types";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SpawnParticleEffect)
class SpawnParticleEffectPacket extends DataPacket {
	@Serialize(Byte)
	public dimensionId!: number;

	@Serialize(ZigZong)
	public uniqueId!: bigint;

	@Serialize(Vector3f)
	public position!: Vector3f;

	@Serialize(VarString)
	public effectName!: string;

	// ! Unknown value, if the value is invalid, the client exits because the packet is broken, in mostly cases this can be not defined
	@Serialize(Optional)
	public molangVariables!: string | null;
}

export { SpawnParticleEffectPacket };
