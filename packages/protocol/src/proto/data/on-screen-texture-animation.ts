import { Proto, Serialize } from "@serenityjs/raknet";
import { Endianness, Uint32 } from "@serenityjs/binarystream";

import { EffectType, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.OnScreenTextureAnimation)
class OnScreenTextureAnimationPacket extends DataPacket {
	@Serialize(Uint32, Endianness.Little) public effectId!: EffectType;
}

export { OnScreenTextureAnimationPacket };
