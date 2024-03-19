import { DataType } from "@serenityjs/raknet";

import { InteractActions } from "../../enums";

import { Vector3f } from "./vector3f";

import type { BinaryStream, Endianness } from "@serenityjs/binaryutils";

class InteractPosition extends DataType {
	public static read(
		stream: BinaryStream,
		endian: Endianness,
		action: InteractActions
	): Vector3f | null {
		return action === InteractActions.MouseOverEntity ||
			action === InteractActions.LeaveVehicle
			? Vector3f.read(stream)
			: null;
	}

	public static write(
		stream: BinaryStream,
		value: Vector3f,
		endian: Endianness,
		action: InteractActions
	): void {
		if (
			action === InteractActions.MouseOverEntity ||
			action === InteractActions.LeaveVehicle
		) {
			Vector3f.write(stream, value);
		}
	}
}

export { InteractPosition };
