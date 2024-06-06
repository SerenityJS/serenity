import { ValidEnum } from "./valid";
import { StringEnum } from "./string";

import type { CommandExecutionState } from "../../execution-state";

class BlockPositionEnum extends ValidEnum {
	/**
	 * The type of the enum.
	 */
	public static readonly name = "string";

	/**
	 * The symbol of the enum.
	 */
	public static readonly symbol = (this.type << 16) | 0x40;

	/**
	 * The options of the enum.
	 */
	public static readonly options: Array<string> = [];

	/**
	 * The result of the enum.
	 */
	public readonly x: number | string;

	/**
	 * The result of the enum.
	 */
	public readonly y: number | string;

	/**
	 * The result of the enum.
	 */
	public readonly z: number | string;

	/**
	 * The amount of steps to move in the x direction.
	 */
	public readonly xSteps: number = 0;

	/**
	 * The amount of steps to move in the y direction.
	 */
	public readonly ySteps: number = 0;

	/**
	 * The amount of steps to move in the z direction.
	 */
	public readonly zSteps: number = 0;

	public constructor(
		x: number | string,
		y: number | string,
		z: number | string,
		xSteps: number = 0,
		ySteps: number = 0,
		zSteps: number = 0
	) {
		super();
		this.x = x;
		this.y = y;
		this.z = z;
		this.xSteps = xSteps;
		this.ySteps = ySteps;
		this.zSteps = zSteps;
	}

	public static extract<O>(
		state: CommandExecutionState<O>
	): BlockPositionEnum | undefined {
		const x = StringEnum.extract(state);
		const y = StringEnum.extract(state);
		const z = StringEnum.extract(state);

		// Check if all values are defined.
		if (!x || !y || !z) {
			// Return new BlockPositionEnum with the values.
			throw new Error("Invalid block position ");
		}

		if (
			Number.isNaN(+x.result) &&
			!x.result.startsWith("~") &&
			!x.result.startsWith("^")
		)
			throw new TypeError(
				"Invalid block position at x, expected number, ~ or ^"
			);

		if (
			Number.isNaN(+y.result) &&
			!y.result.startsWith("~") &&
			!y.result.startsWith("^")
		)
			throw new TypeError(
				"Invalid block position at y, expected number, ~ or ^"
			);

		if (
			Number.isNaN(+z.result) &&
			!z.result.startsWith("~") &&
			!z.result.startsWith("^")
		)
			throw new TypeError(
				"Invalid block position at z, expected number, ~ or ^"
			);

		// Check if all values are numbers, or if they are ~ or ^.
		const nx = x.result.startsWith("~")
			? "~"
			: x.result.startsWith("^")
				? "^"
				: +x.result;

		const xSteps = x.result.startsWith("~") ? +x.result.slice(1) : 0;

		// Check if all values are numbers, or if they are ~ or ^.
		const ny = y.result.startsWith("~")
			? "~"
			: y.result.startsWith("^")
				? "^"
				: +y.result;

		const ySteps = y.result.startsWith("~") ? +y.result.slice(1) : 0;

		// Check if all values are numbers, or if they are ~ or ^.
		const nz = z.result.startsWith("~")
			? "~"
			: z.result.startsWith("^")
				? "^"
				: +z.result;

		const zSteps = z.result.startsWith("~") ? +z.result.slice(1) : 0;

		// Return new BlockPositionEnum with the values.
		return new BlockPositionEnum(nx, ny, nz, xSteps, ySteps, zSteps);
	}
}

export { BlockPositionEnum };
