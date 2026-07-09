import { BinaryStream, DataType } from "@serenityjs/binarystream";

class PresenceInfo extends DataType {
  public experienceName: string | null;

  public worldName: string | null;

  public richPresenceId: string;

  public constructor(
    experienceName: string | null,
    worldName: string | null,
    richPresenceId: string
  ) {
    super();
    this.experienceName = experienceName;
    this.worldName = worldName;
    this.richPresenceId = richPresenceId;
  }

  public static read(stream: BinaryStream): PresenceInfo {
    const experienceName = stream.readBool() ? stream.readVarString() : null;
    const worldName = stream.readBool() ? stream.readVarString() : null;
    const richPresenceId = stream.readVarString();

    return new this(experienceName, worldName, richPresenceId);
  }

  public static write(stream: BinaryStream, value: PresenceInfo): void {
    stream.writeBool(value.experienceName !== null);
    if (value.experienceName !== null) {
      stream.writeVarString(value.experienceName);
    }

    stream.writeBool(value.worldName !== null);
    if (value.worldName !== null) {
      stream.writeVarString(value.worldName);
    }

    stream.writeVarString(value.richPresenceId);
  }
}

export { PresenceInfo };
