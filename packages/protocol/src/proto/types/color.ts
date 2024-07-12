import { DataType } from "@serenityjs/raknet";

/**
 * A 3D vector with floating point precision.
 *
 */
class Color extends DataType {
	public alpha: number;
	/**
	 * The x coordinate of the vector.
	 */
	public red: number;

	/**
	 * The y coordinate of the vector.
	 */
	public green: number;

	/**
	 * The z coordinate of the vector.
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

	public static mix(color1: Color, color2: Color): Color {
		const a = Math.round((color1.alpha + color2.alpha) / 2);
		const r = Math.round((color1.red + color2.red) / 2);
		const g = Math.round((color1.green + color2.green) / 2);
		const b = Math.round((color1.blue + color2.blue) / 2);

		return new Color(a, r, g, b);
	}

	public toInt(): number {
		return (
			(this.alpha << 24) | (this.red << 16) | (this.green << 8) | this.blue
		);
	}

	public static fromInt(color: number): Color {
		const alpha = (color >> 24) & 0xff;
		const red = (color >> 16) & 0xff;
		const green = (color >> 8) & 0xff;
		const blue = color & 0xff;
		return new Color(alpha, red, green, blue);
	}
}

export { Color };
