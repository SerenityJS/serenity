import { Endianness } from "@serenityjs/binarystream";

import type { ValidTypes } from "../types";
import type { BasePacket } from "../proto";

function Serialize(
	type: ValidTypes,
	endian = Endianness.Big,
	parameter?: string
) {
	// Check if the wasnt a type provided.
	if (!type) throw new Error("@Serialize() failed, no type provided.");

	// Return the serialize decorator.
	return function (target: BasePacket, name: string) {
		// Get the properties of the target.
		const properties = Reflect.getMetadata("properties", target) || [];

		// Push the property to the properties array.
		properties.push({ name, type, endian, parameter });

		// Set the properties metadata.
		Reflect.defineMetadata("properties", properties, target);
	};
}

export { Serialize };
