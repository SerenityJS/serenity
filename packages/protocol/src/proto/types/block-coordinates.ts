import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binaryutils";

class BlockCoordinates extends DataType {
	public x: number;
	public y: number;
	public z: number;

	public constructor(x: number, y: number, z: number) {
		super();
		this.x = x;
		this.y = y;
		this.z = z;
	}

	public static override read(stream: BinaryStream): BlockCoordinates {
		// Reads a x, y, z float from the stream
		const x = stream.readZigZag();
		const y = stream.readVarInt();
		const z = stream.readZigZag();

		// Returns the x, y, z float
		return new BlockCoordinates(x, y, z);
	}

	public static override write(
		stream: BinaryStream,
		value: BlockCoordinates
	): void {
		// Writes a x, y, z float to the stream
		stream.writeZigZag(value.x);
		stream.writeVarInt(value.y);
		stream.writeZigZag(value.z);
	}
}

export { BlockCoordinates };
