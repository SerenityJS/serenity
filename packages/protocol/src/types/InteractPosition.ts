import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { InteractActions } from '../enums';
import type { Vec3f } from './Vector3f';
import { Vector3f } from './Vector3f';

class InteractPosition extends DataType {
	public static read(stream: BinaryStream, endian: Endianness, action: InteractActions): Vec3f | null {
		if (action === InteractActions.MouseOverEntity || action === InteractActions.LeaveVehicle) {
			return Vector3f.read(stream);
		} else {
			return null;
		}
	}
	public static write(stream: BinaryStream, value: Vec3f, endian: Endianness, action: InteractActions): void {
		if (action === InteractActions.MouseOverEntity || action === InteractActions.LeaveVehicle) {
			Vector3f.write(stream, value);
		}
	}
}

export { InteractPosition };
