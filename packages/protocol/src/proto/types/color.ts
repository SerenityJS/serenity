import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

/**
 * ARGB Color class that
 * Ranges from 0-255
 */
class Color extends DataType {
	/**
	 * The alpha value of the color
	 */
	public alpha: number;
	/**
	 * The red amount of the color
	 */
	public red: number;

	/**
	 * The red amount of the color
	 */
	public green: number;

	/**
	 * The blue amount of the color
	 */
	public blue: number;

	/**
	 * Creates a new ARGB color
	 * @param alpha number the alpha value of the color
	 * @param red number the red value of the color
	 * @param green number the green value of the color
	 * @param blue number the blue value of the color
	 */
	public constructor(alpha: number, red: number, green: number, blue: number) {
		super();
		this.alpha = alpha & 0xff;
		this.red = red & 0xff;
		this.green = green & 0xff;
		this.blue = blue & 0xff;
	}

	/**
	 * Creates a new color based on 2 colors
	 * @param color1 First color to mix
	 * @param color2 Second color to mix
	 * @returns Color The resulting color
	 */
	public static mix(color1: Color, color2: Color): Color {
		const a = Math.round((color1.alpha + color2.alpha) / 2);
		const r = Math.round((color1.red + color2.red) / 2);
		const g = Math.round((color1.green + color2.green) / 2);
		const b = Math.round((color1.blue + color2.blue) / 2);

		return new Color(a, r, g, b);
	}

	/**
	 * Returns the serialized color
	 * @returns number The serialzed color
	 */
	public toInt(): number {
		return (
			(this.alpha << 24) | (this.red << 16) | (this.green << 8) | this.blue
		);
	}

	/**
	 * Gets an color from the serialized color number
	 * @param color number The serialized color to deserialize
	 * @returns Color
	 */

	public static fromInt(color: number): Color {
		const alpha = (color >> 24) & 0xff;
		const red = (color >> 16) & 0xff;
		const green = (color >> 8) & 0xff;
		const blue = color & 0xff;
		return new Color(alpha, red, green, blue);
	}

	public static override write(stream: BinaryStream, value: Color): void {
		stream.writeUint32(value.toInt());
	}
}

export { Color };
