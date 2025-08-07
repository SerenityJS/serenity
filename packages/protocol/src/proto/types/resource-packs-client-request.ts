import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { RequestedResourcePack } from "./requested-resource-pack";

class ResourcePacksClientRequest extends DataType {
  public static read(stream: BinaryStream): Array<RequestedResourcePack> {
    // Prepare an array to store the packs.
    const packs: Array<RequestedResourcePack> = [];

    // Read the number of packs.
    const amount = stream.readUint16(Endianness.Little);

    // Iterate through the number of packs.
    for (let index = 0; index < amount; index++) {
      // Read each pack and push it to the packs array.
      packs.push(RequestedResourcePack.read(stream));
    }
    // Return the array of packs.
    return packs;
  }

  public static write(
    stream: BinaryStream,
    value: Array<RequestedResourcePack>
  ): void {
    // Write the number of packs given in the array.
    stream.writeUint16(value.length, Endianness.Little);

    // Iterate through each pack and write it to the stream.
    for (const pack of value) {
      RequestedResourcePack.write(stream, pack);
    }
  }
}

export { ResourcePacksClientRequest };
