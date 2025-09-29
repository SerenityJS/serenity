import { BinaryStream, DataType } from "@serenityjs/binarystream";

class BiomeStringList extends DataType {
  public static read(stream: BinaryStream): Array<string> {
    // Read the number of strings
    const amount = stream.readVarInt();

    // Prepare an array to hold the strings
    const strings: Array<string> = [];

    // Read each string
    for (let i = 0; i < amount; i++) {
      // Push the read string into the array
      strings.push(stream.readVarString());
    }

    // Return the array of strings
    return strings;
  }

  public static write(stream: BinaryStream, value: Array<string>): void {
    // Write the number of strings
    stream.writeVarInt(value.length);

    // Write each string
    for (const str of value) {
      stream.writeVarString(str);
    }
  }
}

export { BiomeStringList };
