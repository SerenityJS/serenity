import { DataType } from "@serenityjs/raknet";
import { Endianness, type BinaryStream } from "@serenityjs/binarystream";

import { type BossEventColor, BossEventUpdateType } from "../../enums";

class BossEventUpdate extends DataType {
  public readonly playerUniqueId?: bigint | null;

  public readonly percent?: number | null;

  public readonly title?: string | null;

  public readonly darkenScreen?: number | null;

  public readonly color?: BossEventColor | null;

  public readonly overlay?: number | null;

  public constructor(
    playerUniqueId?: bigint | null,
    percent?: number | null,
    title?: string | null,
    darkenScreen?: number | null,
    color?: BossEventColor | null,
    overlay?: number | null
  ) {
    super();
    this.playerUniqueId = playerUniqueId;
    this.percent = percent;
    this.title = title;
    this.darkenScreen = darkenScreen;
    this.color = color;
    this.overlay = overlay;
  }

  public static override read(
    stream: BinaryStream,
    _endian: Endianness,
    type: BossEventUpdateType
  ): BossEventUpdate | null {
    // Switch on the event type.
    switch (type) {
      case BossEventUpdateType.Add:
      case BossEventUpdateType.Remove: {
        return null;
      }

      case BossEventUpdateType.PlayerAdded:
      case BossEventUpdateType.PlayerRemoved: {
        // Read the player unique id.
        const playerUniqueId = stream.readZigZong();

        // Return the player event.
        return new this(playerUniqueId);
      }

      case BossEventUpdateType.UpdatePercent: {
        // Read the percent.
        const percent = stream.readFloat32(Endianness.Little);

        // Return the percent event.
        return new this(null, percent);
      }

      case BossEventUpdateType.UpdateName: {
        // Read the title.
        const title = stream.readVarString();

        // Return the title event.
        return new this(null, null, title);
      }

      case BossEventUpdateType.UpdateProperties: {
        // Read the darken screen, color, and overlay.
        const darkenScreen = stream.readInt16(Endianness.Little);
        const color = stream.readVarInt();
        const overlay = stream.readVarInt();

        // Return the properties event.
        return new this(null, null, null, darkenScreen, color, overlay);
      }

      case BossEventUpdateType.UpdateStyle: {
        // Read the color and overlay.
        const color = stream.readVarInt();
        const overlay = stream.readVarInt();

        // Return the style event.
        return new this(null, null, null, null, color, overlay);
      }

      case BossEventUpdateType.Query: {
        // Read the player unique id.
        const playerUniqueId = stream.readZigZong();

        // Return the query event.
        return new this(playerUniqueId);
      }
    }
  }

  public static override write(
    stream: BinaryStream,
    value: BossEventUpdate,
    _endian: Endianness,
    type: BossEventUpdateType
  ): void {
    // Switch on the event type.
    switch (type) {
      // Handled elsewhere
      case BossEventUpdateType.Add:
      case BossEventUpdateType.Remove: {
        break;
      }

      case BossEventUpdateType.PlayerAdded:
      case BossEventUpdateType.PlayerRemoved: {
        // Write the player unique id.
        stream.writeZigZong(value.playerUniqueId ?? BigInt(0));
        break;
      }

      case BossEventUpdateType.UpdatePercent: {
        // Write the percent.
        stream.writeFloat32(value.percent ?? 0, Endianness.Little);
        break;
      }

      case BossEventUpdateType.UpdateName: {
        // Write the title.
        stream.writeVarString(value.title ?? String());
        break;
      }

      case BossEventUpdateType.UpdateProperties: {
        // Write the darken screen, color, and overlay.
        stream.writeInt16(value.darkenScreen ?? 0, Endianness.Little);
        stream.writeVarInt(value.color ?? 0);
        stream.writeVarInt(value.overlay ?? 0);
        break;
      }

      case BossEventUpdateType.UpdateStyle: {
        // Write the color and overlay.
        stream.writeVarInt(value.color ?? 0);
        stream.writeVarInt(value.overlay ?? 0);
        break;
      }

      case BossEventUpdateType.Query: {
        // Write the player unique id.
        stream.writeZigZong(value.playerUniqueId ?? BigInt(0));
        break;
      }
    }
  }
}

export { BossEventUpdate };
