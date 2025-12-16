import { BinaryStream } from "@serenityjs/binarystream";

class OptionalIO {
  public static write<T>(
    stream: BinaryStream,
    writeFunction: (stream: BinaryStream, value: T) => void,
    value?: T
  ) {
    const hasValue = value != undefined || value != null;

    stream.writeBool(hasValue);
    if (!hasValue) return;
    writeFunction(stream, value);
  }

  public static read<T>(
    stream: BinaryStream,
    readFunction: (stream: BinaryStream) => T
  ): T | undefined {
    const hasValue = stream.readBool();

    if (!hasValue) return;
    return readFunction(stream);
  }
}

export { OptionalIO };
