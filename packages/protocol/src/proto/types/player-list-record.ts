import { DataType } from "@serenityjs/raknet";
import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { PlayerListAction } from "../../enums";

import { SerializedSkin } from "./serialized-skin";

class PlayerListRecord extends DataType {
  /**
   * The uuid of the player.
   */
  public readonly uuid: string;

  /**
   * The unique actor id of the player.
   */
  public readonly uniqueId: bigint | null;

  /**
   * The username of the player.
   */
  public readonly username: string | null;

  /**
   * The xbox user id of the player.
   */
  public readonly xuid: string | null;

  /**
   * The platform chat identifier of the player.
   */
  public readonly platformChatIdentifier: string | null;

  /**
   * The platform build of the player.
   */
  public readonly platformBuild: number | null;

  /**
   * The skin of the player.
   */
  public readonly skin: SerializedSkin | null;

  /**
   * Whether the player is a teacher.
   */
  public readonly isTeacher: boolean | null;

  /**
   * Whether the player is a host.
   */
  public readonly isHost: boolean | null;

  /**
   * Whether the player is a visitor.
   */
  public readonly isVisitor: boolean | null;

  /**
   * Creates a new player record.
   *
   * @param uuid The uuid of the player.
   * @param uniqueId The unique actor id of the player.
   * @param username The username of the player.
   * @param xuid The xbox user id of the player.
   * @param platformChatIdentifier The platform chat identifier of the player.
   * @param platformBuild The platform build of the player.
   * @param skin The skin of the player.
   * @param isTeacher Whether the player is a teacher.
   * @param isHost Whether the player is a host.
   * @param isVisitor Whether the player is a visitor.
   */
  public constructor(
    uuid: string,
    uniqueId?: bigint | null,
    username?: string | null,
    xuid?: string | null,
    platformChatIdentifier?: string | null,
    platformBuild?: number | null,
    skin?: SerializedSkin | null,
    isTeacher?: boolean | null,
    isHost?: boolean | null,
    isVisitor?: boolean | null
  ) {
    super();
    this.uuid = uuid;
    this.uniqueId = uniqueId ?? null;
    this.username = username ?? null;
    this.xuid = xuid ?? null;
    this.platformChatIdentifier = platformChatIdentifier ?? null;
    this.platformBuild = platformBuild ?? null;
    this.skin = skin ?? null;
    this.isTeacher = isTeacher ?? null;
    this.isHost = isHost ?? null;
    this.isVisitor = isVisitor ?? null;
  }

  public static read(
    stream: BinaryStream,
    _endian: Endianness,
    action: PlayerListAction
  ): Array<PlayerListRecord> {
    // Check if the action is to remove a player.
    if (action === PlayerListAction.Remove) {
      // Read the amount of uuids of the players to remove.
      const uuidsLength = stream.readVarInt();

      // Create a new array to store the players to remove.
      const playersToRemove = [];

      // Read the uuids of the players to remove.
      for (let index = 0; index < uuidsLength; index++) {
        playersToRemove.push(new PlayerListRecord(stream.readUuid()));
      }

      // Return the players to remove.
      return playersToRemove;
    }

    // Read the amount of records.
    const recordsLength = stream.readVarInt();

    // Create a new array to store the records.
    const records = [];

    // Read the records.
    for (let index = 0; index < recordsLength; index++) {
      // Read the uuid of the player.
      const uuid = stream.readUuid();

      // Read the unique actor id of the player.
      const uniqueId = stream.readZigZong();

      // Read the username of the player.
      const username = stream.readVarString();

      // Read the xbox user id of the player.
      const xuid = stream.readVarString();

      // Read the platform chat identifier of the player.
      const platformChatIdentifier = stream.readVarString();

      // Read the platform build of the player.
      const platformBuild = stream.readInt32(Endianness.Little);

      // Read the skin of the player.
      const skin = SerializedSkin.read(stream);

      // Read whether the player is a teacher.
      const isTeacher = stream.readBool();

      // Read whether the player is a host.
      const isHost = stream.readBool();

      // Read whether the player is a visitor.
      const isVisitor = stream.readBool();

      // Add the record to the array.
      records.push(
        new PlayerListRecord(
          uuid,
          uniqueId,
          username,
          xuid,
          platformChatIdentifier,
          platformBuild,
          skin,
          isTeacher,
          isHost,
          isVisitor
        )
      );
    }

    // Read the verification data.
    for (let index = 0; index < recordsLength; index++) {
      // We won't use this data, so we'll just read it and discard it.
      stream.readBool();
    }

    // Return the records.
    return records;
  }

  public static write(
    stream: BinaryStream,
    records: Array<PlayerListRecord>,
    _endian: Endianness,
    action: PlayerListAction
  ): void {
    // Write the amount of records.
    stream.writeVarInt(records.length);

    // Check if the action is to remove a player.
    if (action === PlayerListAction.Remove) {
      // Write the uuids of the players to remove.
      for (const record of records) {
        stream.writeUuid(record.uuid);
      }

      // We are done here.
      return;
    }

    // Write the records.
    for (const record of records) {
      // Write the uuid of the player.
      stream.writeUuid(record.uuid);

      // Write the unique actor id of the player.
      stream.writeZigZong(record.uniqueId as bigint);

      // Write the username of the player.
      stream.writeVarString(record.username as string);

      // Write the xbox user id of the player.
      stream.writeVarString(record.xuid as string);

      // Write the platform chat identifier of the player.
      stream.writeVarString(record.platformChatIdentifier as string);

      // Write the platform build of the player.
      stream.writeInt32(record.platformBuild as number, Endianness.Little);

      // Write the skin of the player.
      SerializedSkin.write(stream, record.skin as SerializedSkin);

      // Write whether the player is a teacher.
      stream.writeBool(record.isTeacher as boolean);

      // Write whether the player is a host.
      stream.writeBool(record.isHost as boolean);

      // Write whether the player is a visitor.
      stream.writeBool(record.isVisitor as boolean);
    }

    // Write the verification data.
    for (let index = 0; index < records.length; index++) {
      // Write the verification data.
      stream.writeBool(true);
    }
  }
}

export { PlayerListRecord };
