import { BinaryStream, DataType } from "@serenityjs/binarystream";

class ResourceIdVersions extends DataType {
  public name: string;
  public uuid: string;
  public version: string;

  public constructor(name: string, uuid: string, version: string) {
    super();
    this.name = name;
    this.uuid = uuid;
    this.version = version;
  }

  public static read(stream: BinaryStream): Array<ResourceIdVersions> {
    // Prepare an array to store the packs.
    const packs: Array<ResourceIdVersions> = [];

    // Read the number of packs.
    const amount = stream.readVarInt();

    // We then loop through the amount of packs.
    // Reading the individual fields in the stream.
    for (let index = 0; index < amount; index++) {
      // Read all the fields for the pack.
      const uuid = stream.readVarString();
      const version = stream.readVarString();
      const name = stream.readVarString();

      // Push the pack to the array.
      packs.push(new ResourceIdVersions(name, uuid, version));
    }

    // Return the packs.
    return packs;
  }

  public static write(
    stream: BinaryStream,
    value: Array<ResourceIdVersions>
  ): void {
    // Write the number of packs given in the array.
    stream.writeVarInt(value.length);

    // Loop through the packs.
    for (const pack of value) {
      // Write the fields for the pack.
      stream.writeVarString(pack.uuid);
      stream.writeVarString(pack.version);
      stream.writeVarString(pack.name);
    }
  }
}

export { ResourceIdVersions };
