import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { SkinColor } from "./skin-color";

/**
 * Represents a tint piece of a persona skin.
 */
class SkinPersonaTintPiece extends DataType {
  /**
   * The amount of colors a tint piece always has on the wire.
   */
  public static readonly COLOR_COUNT = 4;

  /**
   * The identifier of the tint piece.
   */
  public readonly type: string;

  /**
   * The colors of the tint piece.
   */
  public readonly colors: Array<string>;

  /**
   * Creates a new tint piece of a persona skin.
   *
   * @param type The identifier of the tint piece.
   * @param colors The colors of the tint piece.
   */
  public constructor(type: string, colors: Array<string>) {
    super();
    this.type = type;
    this.colors = colors;
  }

  public static read(stream: BinaryStream): SkinPersonaTintPiece {
    // Read the type of the tint piece, and convert it to the login data name.
    const type = SkinPersonaTintPiece.toLoginType(stream.readVarString());

    // Create a new array to store the colors of the tint piece.
    const colors = [];

    // Read the colors of the tint piece.
    for (let index = 0; index < SkinPersonaTintPiece.COLOR_COUNT; index++) {
      colors.push(SkinColor.read(stream));
    }

    // Return the new tint piece.
    return new SkinPersonaTintPiece(type, colors);
  }

  public static write(
    stream: BinaryStream,
    tintPiece: SkinPersonaTintPiece
  ): void {
    // Write the type of the tint piece, using the wire name.
    stream.writeVarString(SkinPersonaTintPiece.toWireType(tintPiece.type));

    // Write the colors of the tint piece, padding missing colors with "#0".
    for (let index = 0; index < SkinPersonaTintPiece.COLOR_COUNT; index++) {
      SkinColor.write(stream, tintPiece.colors[index] ?? "#0");
    }
  }

  /**
   * Converts a login data tint type (e.g. `persona_eyes`) to its wire name (e.g. `eyes`).
   * The hands type is singular in login data, but plural on the wire.
   * @param type The login data tint type.
   * @returns The wire name of the tint type.
   */
  public static toWireType(type: string): string {
    if (type === "persona_hand") return "hands";
    return type.startsWith("persona_") ? type.slice(8) : type;
  }

  /**
   * Converts a wire tint type (e.g. `eyes`) to its login data name (e.g. `persona_eyes`).
   * @param type The wire name of the tint type.
   * @returns The login data tint type.
   */
  public static toLoginType(type: string): string {
    if (type === "hands") return "persona_hand";
    if (type === "unsupported") return type;
    return `persona_${type}`;
  }
}

export { SkinPersonaTintPiece };
