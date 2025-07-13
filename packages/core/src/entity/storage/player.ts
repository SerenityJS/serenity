import {
  ByteTag,
  CompoundTag,
  IntTag,
  ListTag,
  StringTag
} from "@serenityjs/nbt";
import { AbilityIndex } from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";

import { EntityLevelStorage } from "./entity";

class PlayerLevelStorage extends EntityLevelStorage {
  public constructor(source?: CompoundTag | PlayerLevelStorage) {
    super(source);
  }

  public getUsername(): string {
    // Get the username from the storage
    const username = this.get<StringTag>("username");

    // If the username exists, return its value
    return username ? username.valueOf() : "";
  }

  public setUsername(username: string): void {
    // Set the username in the storage
    this.set("username", new StringTag(username, "username"));
  }

  public getXuid(): string {
    // Get the xuid from the storage
    const xuid = this.get<StringTag>("xuid");

    // If the xuid exists, return its value
    return xuid ? xuid.valueOf() : "";
  }

  public setXuid(xuid: string): void {
    // Set the xuid in the storage
    this.set("xuid", new StringTag(xuid, "xuid"));
  }

  public getUuid(): string {
    // Get the uuid from the storage
    const uuid = this.get<StringTag>("uuid");

    // If the uuid exists, return its value
    return uuid ? uuid.valueOf() : "";
  }

  public setUuid(uuid: string): void {
    // Set the uuid in the storage
    this.set("uuid", new StringTag(uuid, "uuid"));
  }

  public getAbilities(): Array<[AbilityIndex, boolean]> {
    // Get the abilities list from the storage
    const abilities = this.get<ListTag<CompoundTag>>("abilities");

    // If the abilities list does not exist, return an empty array
    if (!abilities) return [];

    // Prepare an array to hold the ability tuples
    const abilityTuples: Array<[AbilityIndex, boolean]> = [];

    // Iterate through each ability in the list
    for (const ability of abilities) {
      // Get the ability index and value from the ability tag
      const index = ability.get<IntTag>("index");
      const value = ability.get<ByteTag>("value");

      // If both index and value exist, add them as a tuple to the array
      if (index && value) {
        abilityTuples.push([index.valueOf(), value.valueOf() === 1]);
      }
    }

    // Return the array of ability tuples
    return abilityTuples;
  }

  public setAbilities(abilities: Array<[AbilityIndex, boolean]>): void {
    // Create a new list tag for abilities
    const abilityList = new ListTag<CompoundTag>([], "abilities");

    // Iterate through each ability tuple
    for (const [index, value] of abilities) {
      // Create a new compound tag for the ability
      const abilityTag = new CompoundTag();

      // Set the index and value in the ability tag
      abilityTag.set("index", new IntTag(index, "index"));
      abilityTag.set("value", new ByteTag(value ? 1 : 0, "value"));

      // Add the ability tag to the list
      abilityList.push(abilityTag);
    }

    // Set the abilities list in the storage
    this.set("abilities", abilityList);
  }

  /**
   * Initialize the PlayerLevelStorage from a buffer.
   * @param buffer The buffer containing the serialized PlayerLevelStorage data.
   * @returns A new PlayerLevelStorage instance initialized from the buffer.
   */
  public static fromBuffer(buffer: Buffer): PlayerLevelStorage {
    // Create a new BinaryStream from the buffer
    const stream = new BinaryStream(buffer);

    // Read the CompoundTag from the stream
    const tag = CompoundTag.read(stream);

    // Return a new PlayerLevelStorage instance with the read tag
    return new this(tag);
  }

  /**
   * Convert the PlayerLevelStorage to a buffer.
   * @param storage The PlayerLevelStorage or CompoundTag to convert.
   * @returns A Buffer containing the serialized PlayerLevelStorage data.
   */
  public static toBuffer(storage: PlayerLevelStorage | CompoundTag): Buffer {
    // Create a new BinaryStream to write the storage
    const stream = new BinaryStream();

    // Write the storage to the stream
    this.write(stream, storage);

    // Return the buffer from the stream
    return stream.getBuffer();
  }
}

export { PlayerLevelStorage };
