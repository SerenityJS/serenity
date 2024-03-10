import { Endianness } from "@serenityjs/binaryutils";

import { ValidTypes } from "./valid";

interface PacketMetadata {
	endian: Endianness;
	name: string;
	paramater: string;
	type: ValidTypes;
}

export type { PacketMetadata };
