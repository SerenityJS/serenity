import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

class EntityDiagnosticTimingInfo extends DataType {
  public displayName: string;
  public entity: string;
  public durationNanos: bigint;
  public percentOfTotal: number;

  public constructor(
    displayName: string,
    entity: string,
    durationNanos: bigint,
    percentOfTotal: number
  ) {
    super();
    this.displayName = displayName;
    this.entity = entity;
    this.durationNanos = durationNanos;
    this.percentOfTotal = percentOfTotal;
  }

  public static read(stream: BinaryStream): EntityDiagnosticTimingInfo {
    return new this(
      stream.readVarString(),
      stream.readVarString(),
      stream.readUint64(Endianness.Little),
      stream.readUint8()
    );
  }

  public static write(
    stream: BinaryStream,
    value: EntityDiagnosticTimingInfo
  ): void {
    stream.writeVarString(value.displayName);
    stream.writeVarString(value.entity);
    stream.writeUint64(value.durationNanos, Endianness.Little);
    stream.writeUint8(value.percentOfTotal);
  }
}

export { EntityDiagnosticTimingInfo };
