import { BinaryStream, DataType } from "@serenityjs/binarystream";

class AnimateEntity extends DataType {
  public static read(stream: BinaryStream): Array<bigint> {
    // Prepare an array to hold the runtime IDs.
    const runtimeIds: Array<bigint> = [];

    // Read the number of runtime IDs to expect.
    const amount = stream.readVarInt();

    // Read each runtime ID and add it to the array.
    for (let index = 0; index < amount; index++) {
      runtimeIds.push(stream.readVarLong());
    }

    // Return the array of runtime IDs.
    return runtimeIds;
  }

  public static write(stream: BinaryStream, value: Array<bigint>): void {
    // Write the number of runtime IDs to the stream.
    stream.writeVarInt(value.length);

    // Write each runtime ID to the stream.
    for (const runtimeId of value) {
      stream.writeVarLong(runtimeId);
    }
  }
}

export { AnimateEntity };
