import { DataType } from "@serenityjs/raknet";
import { Endianness, type BinaryStream } from "@serenityjs/binarystream";

/**
 * Represents a tint piece of a persona skin.
 */
class SkinPersonaTintPiece extends DataType {
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
    // Read the type and colors of the tint piece.
    const type = stream.readVarString();

    // Read the amount of colors of the tint piece.
    const colorsLength = stream.readUint32(Endianness.Little);

    // Create a new array to store the colors of the tint piece.
    const colors = [];

    // Read the colors of the tint piece.
    for (let index = 0; index < colorsLength; index++) {
      colors.push(stream.readVarString());
    }

    // Return the new tint piece.
    return new SkinPersonaTintPiece(type, colors);
  }

  public static write(
    stream: BinaryStream,
    tintPiece: SkinPersonaTintPiece
  ): void {
    // Write the type of the tint piece.
    stream.writeVarString(tintPiece.type);

    // Write the amount of colors of the tint piece.
    stream.writeUint32(tintPiece.colors.length, Endianness.Little);

    // Write the colors of the tint piece.
    for (const color of tintPiece.colors) {
      stream.writeVarString(color);
    }
  }
}

export { SkinPersonaTintPiece };
