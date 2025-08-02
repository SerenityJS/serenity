import { BinaryStream, DataType } from "@serenityjs/binarystream";

class Uuid extends DataType {
  public static read(stream: BinaryStream): string {
    // Read the most significant bits and least significant bits of the UUID.
    const msb = stream.read(8).reverse(); // Reverse the bytes to match the UUID format
    const lsb = stream.read(8).reverse();

    // Convert the byte arrays to a hexadecimal string and format it as a UUID.
    const uuid = Buffer.concat([msb, lsb]).toString("hex");

    // Format the UUID string into the standard UUID format.
    return (
      uuid.slice(0, 8) +
      "-" +
      uuid.slice(8, 12) +
      "-" +
      uuid.slice(12, 16) +
      "-" +
      uuid.slice(16, 20) +
      "-" +
      uuid.slice(20)
    );
  }

  public static write(stream: BinaryStream, value: string): void {
    // Remove the dashes from the UUID string.
    const uuid = value.replace(/-/g, "");

    // Convert the UUID string to a byte array.
    const bytes = Buffer.from(uuid, "hex");

    // Split the byte array into most significant bits and least significant bits.
    const msb = bytes.subarray(0, 8); // First 8 bytes are the most significant bits
    const lsb = bytes.subarray(8, 16); // Last 8 bytes are the least significant bits

    // Write the most significant bits and least significant bits to the stream.
    stream.write(msb.reverse());
    stream.write(lsb.reverse());
  }
}

export { Uuid };
