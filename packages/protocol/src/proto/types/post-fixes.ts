import { BinaryStream, DataType } from "@serenityjs/binarystream";

/**
 * Represents the post fixes of a available command packet.
 */
class PostFixes extends DataType {
  public static read(stream: BinaryStream): Array<string> {
    // Prepare an array to store the post fix values.
    const postFixes: Array<string> = [];

    // Read the number of post fix values.
    const amount = stream.readVarInt();

    // We then loop through the amount of post fix values.
    // Reading the string from the stream.
    for (let index = 0; index < amount; index++) {
      postFixes.push(stream.readVarString());
    }

    // Return the post fix values.
    return postFixes;
  }

  public static write(stream: BinaryStream, postFixes: Array<string>): void {
    // Write the number of post fix values.
    stream.writeVarInt(postFixes.length);

    // We then loop through the post fix values.
    // Writing the string to the stream.
    for (const value of postFixes) {
      stream.writeVarString(value);
    }
  }
}

export { PostFixes };
