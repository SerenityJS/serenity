import { BinaryStream, DataType } from "@serenityjs/binarystream";

class CameraAttachEntityInstruction extends DataType {
  public runtimeId: bigint;

  public constructor(runtimeId: bigint) {
    super();
    this.runtimeId = runtimeId;
  }

  public static write(
    stream: BinaryStream,
    value: CameraAttachEntityInstruction
  ): void {
    stream.writeZigZong(value.runtimeId);
  }
}

export { CameraAttachEntityInstruction };
