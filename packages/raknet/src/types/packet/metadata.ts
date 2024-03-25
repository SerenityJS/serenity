import { Endianness } from "@serenityjs/binaryutils";

import { ValidTypes } from "./valid";

interface PacketMetadata {
	endian: Endianness;
	name: string;
	parameter: string;
	type: ValidTypes;
}

export type { PacketMetadata };
