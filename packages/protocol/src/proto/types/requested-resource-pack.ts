import { Endianness, BinaryStream, DataType } from "@serenityjs/binarystream";

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

  public static read(stream: BinaryStream): Array<RequestedResourcePack> {
    // Prepare an array to store the packs.
    const packs: Array<RequestedResourcePack> = [];

    // Read the number of packs.
    const amount = stream.readUint16(Endianness.Little);

    // We then loop through the amount of packs.
    // Reading the individual fields in the stream.
    for (let index = 0; index < amount; index++) {
      // Read the pack entry from the stream.
      const entry = stream.readVarString();

      // Split the entry into uuid and version.
      const [uuid, version] = entry.split("_") as [string, string];

      // Push the pack to the array.
      packs.push(new this(uuid, version));
    }

    // Return the packs.
    return packs;
  }

  public static write(
    stream: BinaryStream,
    value: Array<RequestedResourcePack>
  ): void {
    // Write the number of packs given in the array.
    stream.writeUint16(value.length, Endianness.Little);

    // Loop through each pack and write its data to the stream.
    for (const pack of value) {
      // Create the entry string.
      const entry = `${pack.uuid}_${pack.version}`;

      // Write the entry to the stream.
      stream.writeVarString(entry);
    }
  }
}

export { RequestedResourcePack };
