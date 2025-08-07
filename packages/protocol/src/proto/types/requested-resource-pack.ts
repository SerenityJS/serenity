import { BinaryStream, DataType } from "@serenityjs/binarystream";

class RequestedResourcePack extends DataType {
  /**
   * The uuid of the resource pack.
   */
  public uuid: string;

  /**
   * The version of the resource pack.
   */
  public version: string;

  /**
   * Create a new instance of RequestedResourcePack.
   * @param uuid The UUID of the resource pack.
   * @param version The version of the resource pack.
   */
  public constructor(uuid: string, version: string) {
    super();
    this.uuid = uuid;
    this.version = version;
  }

  public static read(stream: BinaryStream): RequestedResourcePack {
    // Read the pack entry from the stream.
    const entry = stream.readVarString();

    // Split the entry into uuid and version.
    const [uuid, version] = entry.split("_") as [string, string];

    // Return a new instance of RequestedResourcePack with the uuid and version.
    return new this(uuid, version);
  }

  public static write(
    stream: BinaryStream,
    value: RequestedResourcePack
  ): void {
    // Create the entry string.
    const entry = `${value.uuid}_${value.version}`;

    // Write the entry to the stream.
    stream.writeVarString(entry);
  }
}

export { RequestedResourcePack };
