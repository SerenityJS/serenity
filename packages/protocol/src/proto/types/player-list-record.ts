import { BinaryStream, Endianness, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { PlayerListAction } from "../../enums";

import { SerializedSkin } from "./serialized-skin";
import { Color } from "./color";
import { Uuid } from "./uuid";

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
   * The locator bar color of the player.
   */
  public readonly locatorColor: Color | null = null;

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
   * @param locatorColor The locator bar color of the player.
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
    isVisitor?: boolean | null,
    locatorColor?: Color | null
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
    this.locatorColor = locatorColor ?? null;
  }

  public static read(
    stream: BinaryStream,
    _options?: PacketDataTypeOptions<PlayerListAction>
  ): Array<PlayerListRecord> {
    // Read the amount of entries.
    const length = stream.readVarInt();

    // Create a new array to store the records.
    const records: Array<PlayerListRecord> = [];

    // Read each entry, discarding its action.
    for (let index = 0; index < length; index++)
      records.push(PlayerListRecord.readEntry(stream)[1]);

    // Return the records.
    return records;
  }

  public static write(
    stream: BinaryStream,
    records: Array<PlayerListRecord>,
    options: PacketDataTypeOptions<PlayerListAction>
  ): void {
    // Write the amount of entries.
    stream.writeVarInt(records.length);

    // Write each entry with the given action.
    for (const record of records)
      PlayerListRecord.writeEntry(
        stream,
        options.parameter ?? PlayerListAction.Add,
        record
      );
  }

  /**
   * Reads a single player list entry.
   * Since v2168, each entry is a variant of an add or remove entry.
   * @param stream The stream to read from.
   * @returns The action of the entry, and the record.
   */
  public static readEntry(
    stream: BinaryStream
  ): [PlayerListAction, PlayerListRecord] {
    // Read the variant index of the entry; 1 is add, 0 is remove.
    const variant = stream.readVarInt();
    const action =
      variant === 1 ? PlayerListAction.Add : PlayerListAction.Remove;

    // Read the legacy action byte, which is implied by the variant.
    stream.readUint8();

    // Read the uuid of the player.
    const uuid = Uuid.read(stream);

    // Remove entries only contain the uuid of the player.
    if (action === PlayerListAction.Remove) return [action, new this(uuid)];

    // Read the properties of the player.
    const uniqueId = stream.readZigZong();
    const username = stream.readVarString();
    const xuid = stream.readVarString();
    const platformChatIdentifier = stream.readVarString();
    const platformBuild = stream.readInt32(Endianness.Little);
    const skin = SerializedSkin.read(stream);
    const isTeacher = stream.readBool();
    const isHost = stream.readBool();
    const isVisitor = stream.readBool();

    // The color is an ARGB integer written in little-endian order.
    const argb = stream.readUint32(Endianness.Little);
    const locatorColor = new Color(
      (argb >>> 16) & 0xff,
      (argb >>> 8) & 0xff,
      argb & 0xff,
      (argb >>> 24) & 0xff
    );

    // Return the action and the record.
    return [
      action,
      new this(
        uuid,
        uniqueId,
        username,
        xuid,
        platformChatIdentifier,
        platformBuild,
        skin,
        isTeacher,
        isHost,
        isVisitor,
        locatorColor
      )
    ];
  }

  /**
   * Writes a single player list entry.
   * Since v2168, each entry is a variant of an add or remove entry.
   * @param stream The stream to write to.
   * @param action The action of the entry.
   * @param record The record to write.
   */
  public static writeEntry(
    stream: BinaryStream,
    action: PlayerListAction,
    record: PlayerListRecord
  ): void {
    // Write the variant index of the entry; 1 is add, 0 is remove.
    stream.writeVarInt(action === PlayerListAction.Add ? 1 : 0);

    // Write the legacy action byte.
    stream.writeUint8(action);

    // Write the uuid of the player.
    Uuid.write(stream, record.uuid);

    // Remove entries only contain the uuid of the player.
    if (action === PlayerListAction.Remove) return;

    // Write the properties of the player.
    stream.writeZigZong(record.uniqueId as bigint);
    stream.writeVarString(record.username as string);
    stream.writeVarString(record.xuid as string);
    stream.writeVarString(record.platformChatIdentifier as string);
    stream.writeInt32(record.platformBuild as number, Endianness.Little);
    SerializedSkin.write(stream, record.skin as SerializedSkin);
    stream.writeBool(record.isTeacher as boolean);
    stream.writeBool(record.isHost as boolean);
    stream.writeBool(record.isVisitor as boolean);

    // Write the color as an ARGB integer in little-endian order.
    const color = record.locatorColor ?? new Color(255, 255, 255, 255);
    const argb =
      ((color.alpha << 24) |
        (color.red << 16) |
        (color.green << 8) |
        color.blue) >>>
      0;
    stream.writeUint32(argb, Endianness.Little);
  }
}

export { PlayerListRecord };
