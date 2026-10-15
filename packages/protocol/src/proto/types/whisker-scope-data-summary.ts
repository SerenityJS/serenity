import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

class WhiskerScopeDataSummary extends DataType {
  public label: string;
  public indentation: string;
  public totalHighCostNs: bigint;
  public totalMidCostNs: bigint;
  public totalLowCostNs: bigint;

  public constructor(
    label: string,
    indentation: string,
    totalHighCostNs: bigint,
    totalMidCostNs: bigint,
    totalLowCostNs: bigint
  ) {
    super();
    this.label = label;
    this.indentation = indentation;
    this.totalHighCostNs = totalHighCostNs;
    this.totalMidCostNs = totalMidCostNs;
    this.totalLowCostNs = totalLowCostNs;
  }

  public static read(stream: BinaryStream): WhiskerScopeDataSummary {
    return new this(
      stream.readVarString(),
      stream.readVarString(),
      stream.readUint64(Endianness.Little),
      stream.readUint64(Endianness.Little),
      stream.readUint64(Endianness.Little)
    );
  }

  public static write(
    stream: BinaryStream,
    value: WhiskerScopeDataSummary
  ): void {
    stream.writeVarString(value.label);
    stream.writeVarString(value.indentation);
    stream.writeUint64(value.totalHighCostNs, Endianness.Little);
    stream.writeUint64(value.totalMidCostNs, Endianness.Little);
    stream.writeUint64(value.totalLowCostNs, Endianness.Little);
  }
}

export { WhiskerScopeDataSummary };
