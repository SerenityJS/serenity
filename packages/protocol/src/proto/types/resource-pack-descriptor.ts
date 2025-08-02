import { Endianness, DataType, BinaryStream } from "@serenityjs/binarystream";

import { Uuid } from "./uuid";

class ResourcePackDescriptor extends DataType {
  /**
   * The uuid of the resource pack.
   */
  public uuid: string;

  /**
   * The version of the resource pack.
   */
  public version: string;

  /**
   * The size of the resource pack.
   */
  public size: bigint;

  /**
   * The content key of the resource pack.
   */
  public contentKey: string;

  /**
   * The name of the subpack if applicable.
   */
  public subpackName: string;

  /**
   * The content identity of the resource pack.
   */
  public contentIdentity: string;

  /**
   * Whether the resource pack has scripts.
   */
  public hasScripts: boolean;

  /**
   * Whether the resource pack is apart of an addon pack.
   */
  public isAddonPack: boolean;

  /**
   * Whether the resource pack has RTX capabilities enabled.
   */
  public hasRtxCapabilities: boolean;

  /**
   * The CDN link for the resource pack, if applicable.
   */
  public cdnUrl: string;

  /**
   * Creates a new instance of ResourcePackDescriptor.
   * @param uuid The UUID of the resource pack.
   * @param contentKey The content key of the resource pack.
   * @param hasScripts Whether the resource pack has scripts.
   * @param rtxEnabled Whether the resource pack has RTX capabilities enabled.
   * @param size The size of the resource pack.
   * @param subpackName The name of the subpack, if applicable.
   * @param contentIdentity The content identity of the resource pack.
   * @param version The version of the resource pack.
   * @param addonPack Whether the resource pack is part of an addon pack.
   * @param cdnLink The CDN link for the resource pack, if applicable.
   */
  public constructor(
    uuid: string,
    contentKey: string,
    hasScripts: boolean,
    rtxEnabled: boolean,
    size: bigint,
    subpackName: string,
    contentIdentity: string,
    version: string,
    addonPack: boolean,
    cdnLink: string
  ) {
    super();
    this.uuid = uuid;
    this.contentKey = contentKey;
    this.hasScripts = hasScripts;
    this.hasRtxCapabilities = rtxEnabled;
    this.size = size;
    this.subpackName = subpackName;
    this.contentIdentity = contentIdentity;
    this.version = version;
    this.isAddonPack = addonPack;
    this.cdnUrl = cdnLink;
  }

  public static read(stream: BinaryStream): Array<ResourcePackDescriptor> {
    // Prepare an array to store the packs.
    const packs: Array<ResourcePackDescriptor> = [];

    // Read the number of packs.
    const amount = stream.readInt16(Endianness.Little);

    // We then loop through the amount of packs.
    // Reading the individual fields in the stream.
    for (let index = 0; index < amount; index++) {
      // Read all the fields for the pack.
      const uuid = Uuid.read(stream);
      const version = stream.readVarString();
      const size = stream.readUint64(Endianness.Little);
      const contentKey = stream.readVarString();
      const subpackName = stream.readVarString();
      const contentIdentity = stream.readVarString();
      const hasScripts = stream.readBool();
      const addonPack = stream.readBool();
      const rtxEnabled = stream.readBool();
      const cdnLink = stream.readVarString();

      // Push the pack to the array.
      packs.push(
        new this(
          uuid,
          contentKey,
          hasScripts,
          rtxEnabled,
          size,
          subpackName,
          contentIdentity,
          version,
          addonPack,
          cdnLink
        )
      );
    }

    // Return the packs.
    return packs;
  }

  public static write(
    stream: BinaryStream,
    value: Array<ResourcePackDescriptor>
  ): void {
    // Write the number of packs given in the array.
    stream.writeInt16(value.length, Endianness.Little);

    // Loop through the packs.
    for (const pack of value) {
      // Write the fields for the pack.
      Uuid.write(stream, pack.uuid);
      stream.writeVarString(pack.version);
      stream.writeUint64(pack.size, Endianness.Little);
      stream.writeVarString(pack.contentKey);
      stream.writeVarString(pack.subpackName);
      stream.writeVarString(pack.contentIdentity);
      stream.writeBool(pack.hasScripts);
      stream.writeBool(pack.isAddonPack);
      stream.writeBool(pack.hasRtxCapabilities);
      stream.writeVarString(pack.cdnUrl);
    }
  }
}

export { ResourcePackDescriptor };
