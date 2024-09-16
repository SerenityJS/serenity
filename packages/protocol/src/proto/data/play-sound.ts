import { Proto, Serialize } from "@serenityjs/raknet";
import { Endianness, Float32, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { BlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlaySound)
class PlaySoundPacket extends DataPacket {
	@Serialize(VarString) public name!: string;
	@Serialize(BlockPosition) public position!: BlockPosition;
	@Serialize(Float32, Endianness.Little) public volume!: number;
	@Serialize(Float32, Endianness.Little) public pitch!: number;
}

export { PlaySoundPacket };
