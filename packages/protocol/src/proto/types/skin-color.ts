import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

/**
 * Represents a skin color, kept as a hex string (e.g. `#ffb37b62`) in memory.
 * On the wire the color is an ARGB integer written in little-endian order.
 */
class SkinColor extends DataType {
  public static read(stream: BinaryStream): string {
    // Read the ARGB value of the color
    const argb = stream.readUint32(Endianness.Little);

    // Convert the ARGB value to a hex string
    return `#${argb.toString(16).padStart(8, "0")}`;
  }

  public static write(stream: BinaryStream, value: string): void {
    // Convert the hex string to an ARGB value, and write it to the stream
    stream.writeUint32(SkinColor.toArgb(value), Endianness.Little);
  }

  /**
   * Converts a hex color string to an ARGB value.
   * Six digit colors (RGB, as used by the skin color in login data) are given full opacity.
   * @param value The hex color string to convert.
   * @returns The ARGB value of the color.
   */
  public static toArgb(value: string): number {
    // Remove the leading hash from the color
    const hex = value.startsWith("#") ? value.slice(1) : value;

    // Parse the hex string, defaulting to 0 for invalid colors
    const parsed = Number.parseInt(hex, 16) || 0;

    // Give six digit colors full opacity
    return (hex.length === 6 ? 0xff_00_00_00 | parsed : parsed) >>> 0;
  }
}

export { SkinColor };
