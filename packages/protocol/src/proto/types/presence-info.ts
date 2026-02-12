import { BinaryStream, DataType } from "@serenityjs/binarystream";

class PresenceInfo extends DataType {
  public experienceName: string;

  public worldName: string;

  public constructor(experienceName: string, worldName: string) {
    super();
    this.experienceName = experienceName;
    this.worldName = worldName;
  }

  public static read(stream: BinaryStream): PresenceInfo {
    const experienceName = stream.readVarString();
    const worldName = stream.readVarString();

    return new this(experienceName, worldName);
  }

  public static write(stream: BinaryStream, value: PresenceInfo): void {
    stream.writeVarString(value.experienceName);
    stream.writeVarString(value.worldName);
  }
}

export { PresenceInfo };
