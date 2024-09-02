import { type CommandArgumentPointer, ValidEnum } from "@serenityjs/command";
import { Vector3f } from "@serenityjs/protocol";

import { Entity } from "../../entity";

class PositionEnum extends ValidEnum {
	/**
	 * The type of the enum.
	 */
	public static readonly name = "position";

	/**
	 * The symbol of the enum.
	 */
	public static readonly symbol = (this.type << 16) | 0x40;

	public readonly result: Vector3f | null;

	public constructor(result: Vector3f | null) {
		super();
		this.result = result;
	}

	public validate(error?: boolean): boolean {
		// Check if the result is a valid option.
		if (!this.result && error)
			throw new Error("Uxpected input to be formatted as a position.");

		if (!this.result) return false;

		return true;
	}

	public static extract(pointer: CommandArgumentPointer): PositionEnum | null {
		// Peek the next value from the pointer.
		const x = pointer.next() as string;

		// Check if the x value is null.
		if (!x) return new PositionEnum(null);

		// Check if the x value is number or starts with ~.
		// If it is not, return null.
		if (Number.isNaN(+x) && !x.startsWith("~")) return new PositionEnum(null);

		// Peek the next value from the pointer.
		const y = pointer.next() as string;

		// Check if the y value is null.
		if (!y) return new PositionEnum(null);

		// Check if the y value is number or starts with ~.
		// If it is not, return null.
		if (Number.isNaN(+y) && !y.startsWith("~")) return new PositionEnum(null);

		// Peek the next value from the pointer.
		const z = pointer.next() as string;

		// Check if the z value is null.
		if (!z) return new PositionEnum(null);

		// Check if the z value is number or starts with ~.
		// If it is not, return null.
		if (Number.isNaN(+z) && !z.startsWith("~")) return new PositionEnum(null);

		// Get the steps for each direction.
		const xsteps = x.startsWith("~") ? +x.slice(1) : 0;
		const ysteps = y.startsWith("~") ? +y.slice(1) : 0;
		const zsteps = z.startsWith("~") ? +z.slice(1) : 0;

		// Check if the origin is an entity or a dimension.
		if (pointer.state.origin instanceof Entity) {
			// Get the entity from the pointer.
			const entity = pointer.state.origin;

			// Get the position of the entity and create a new position with the steps.
			const { x: ex, y: ey, z: ez } = entity.position;

			// Create a new position with the steps.
			const nx = x === "~" ? ex : x.startsWith("~") ? ex + xsteps : +x;
			const ny = y === "~" ? ey : y.startsWith("~") ? ey + ysteps : +y;
			const nz = z === "~" ? ez : z.startsWith("~") ? ez + zsteps : +z;

			// Create a new position.
			const position = new Vector3f(nx, ny, nz);

			// Return the new position enum.
			return new PositionEnum(position);
		} else {
			// Create a new position with the steps.
			const nx = x === "~" ? 0 : x.startsWith("~") ? xsteps : +x;
			const ny = y === "~" ? 0 : y.startsWith("~") ? ysteps : +y;
			const nz = z === "~" ? 0 : z.startsWith("~") ? zsteps : +z;

			// Create a new position.
			const position = new Vector3f(nx, ny, nz);

			// Return the new position enum.
			return new PositionEnum(position);
		}
	}
}

export { PositionEnum };
