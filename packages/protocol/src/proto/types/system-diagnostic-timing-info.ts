import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

class SystemDiagnosticTimingInfo extends DataType {
  public displayName: string;
  public systemIndex: bigint;
  public durationNanos: bigint;
  public percentOfTotal: number;

  public constructor(
    displayName: string,
    systemIndex: bigint,
    durationNanos: bigint,
    percentOfTotal: number
  ) {
    super();
    this.displayName = displayName;
    this.systemIndex = systemIndex;
    this.durationNanos = durationNanos;
    this.percentOfTotal = percentOfTotal;
  }

  public static read(stream: BinaryStream): SystemDiagnosticTimingInfo {
    return new this(
      stream.readVarString(),
      stream.readUint64(Endianness.Little),
      stream.readUint64(Endianness.Little),
      stream.readUint8()
    );
  }

  public static write(
    stream: BinaryStream,
    value: SystemDiagnosticTimingInfo
  ): void {
    stream.writeVarString(value.displayName);
    stream.writeUint64(value.systemIndex, Endianness.Little);
    stream.writeUint64(value.durationNanos, Endianness.Little);
    stream.writeUint8(value.percentOfTotal);
  }
}

export { SystemDiagnosticTimingInfo };
