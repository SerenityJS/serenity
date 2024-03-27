import { Bool, VarInt, VarString, ZigZag } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { LevelSoundEvent, Packet } from "../../enums";
import { Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.LevelSoundEvent)
class LevelSoundEventPacket extends DataPacket {
	@Serialize(VarInt) public event!: LevelSoundEvent;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(ZigZag) public data!: number;
	@Serialize(VarString) public actorIdentifier!: string;
	@Serialize(Bool) public isBabyMob!: boolean;
	@Serialize(Bool) public isGlobal!: boolean;
}

export { LevelSoundEventPacket };
