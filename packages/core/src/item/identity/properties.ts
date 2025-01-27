import { BinaryStream } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";

class ItemTypeVanillaProperties extends CompoundTag<unknown> {
  public constructor() {
    super({ name: "components" });
  }

  public static fromBase64(base64: string): ItemTypeVanillaProperties {
    // Create a new stream from the base64 string.
    const stream = new BinaryStream(Buffer.from(base64, "base64"));

    // Read the properties from the stream.
    return CompoundTag.read(stream) as ItemTypeVanillaProperties;
  }
}

export { ItemTypeVanillaProperties };
