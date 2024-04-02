import {
	Bool,
	Endianness,
	Float32,
	Short,
	Uint8
} from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { CompressionMethod, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.NetworkSettings)
class NetworkSettingsPacket extends DataPacket {
	@Serialize(Short, Endianness.Little) public compressionThreshold!: number;
	@Serialize(Short, Endianness.Little)
	public compressionMethod!: CompressionMethod;

	@Serialize(Bool) public clientThrottle!: boolean;
	@Serialize(Uint8) public clientThreshold!: number;
	@Serialize(Float32, Endianness.Little) public clientScalar!: number;
}

export { NetworkSettingsPacket };
