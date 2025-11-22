import { BinaryStream, DataType } from "@serenityjs/binarystream";

interface FeatureDataListEntry {
  featureName: string;
  binaryJsonOutput: string;
}

class FeatureDataList extends DataType {
  public entries: Array<FeatureDataListEntry>;

  public constructor(entries: Array<FeatureDataListEntry>) {
    super();
    this.entries = entries;
  }

  public static read(stream: BinaryStream): FeatureDataList {
    const entryCount = stream.readVarInt();
    const entries: Array<FeatureDataListEntry> = [];

    for (let i = 0; i < entryCount; i++) {
      const featureName = stream.readVarString();
      const binaryJsonOutput = stream.readVarString();
      entries.push({ featureName, binaryJsonOutput });
    }

    return new FeatureDataList(entries);
  }

  public static write(stream: BinaryStream, value: FeatureDataList): void {
    stream.writeVarInt(value.entries.length);

    for (const entry of value.entries) {
      stream.writeVarString(entry.featureName);
      stream.writeVarString(entry.binaryJsonOutput);
    }
  }
}

export { FeatureDataList, FeatureDataListEntry };
