import { BinaryStream, DataType } from "@serenityjs/binarystream";

class PresenceInfo extends DataType {
  /**
   * The rich presence id that overrides the client-driven rich presence.
   */
  public richPresenceId: string | null;

  public constructor(richPresenceId: string | null = null) {
    super();
    this.richPresenceId = richPresenceId;
  }

  public static read(stream: BinaryStream): PresenceInfo {
    const richPresenceId = stream.readBool() ? stream.readVarString() : null;

    return new this(richPresenceId);
  }

  public static write(stream: BinaryStream, value: PresenceInfo): void {
    stream.writeBool(value.richPresenceId !== null);
    if (value.richPresenceId !== null) {
      stream.writeVarString(value.richPresenceId);
    }
  }
}

export { PresenceInfo };
