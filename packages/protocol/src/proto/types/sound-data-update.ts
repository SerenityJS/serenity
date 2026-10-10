import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { SoundDataUpdateType } from "../../enums";

class SoundDataUpdate extends DataType {
  /**
   * The type of the sound data update.
   */
  public type: SoundDataUpdateType;

  /**
   * The new volume of the sound.
   * Only used if the type is `SoundDataUpdateType.SetVolume`.
   */
  public volume: number;

  /**
   * The new pitch of the sound.
   * Only used if the type is `SoundDataUpdateType.SetPitch`.
   */
  public pitch: number;

  /**
   * The duration of the fade in seconds.
   * Only used if the type is `SoundDataUpdateType.Fade`.
   */
  public duration: number;

  /**
   * The volume to fade to.
   * Only used if the type is `SoundDataUpdateType.Fade`.
   */
  public targetVolume: number;

  /**
   * The position in seconds to seek to.
   * Only used if the type is `SoundDataUpdateType.SeekTo`.
   */
  public seconds: number;

  public constructor(
    type: SoundDataUpdateType,
    volume = 0,
    pitch = 0,
    duration = 0,
    targetVolume = 0,
    seconds = 0
  ) {
    super();
    this.type = type;
    this.volume = volume;
    this.pitch = pitch;
    this.duration = duration;
    this.targetVolume = targetVolume;
    this.seconds = seconds;
  }

  public static read(stream: BinaryStream): SoundDataUpdate {
    // Read the type of the update
    const type = stream.readVarInt() as SoundDataUpdateType;

    // Read the payload based on the type of the update
    switch (type) {
      case SoundDataUpdateType.SetVolume: {
        const volume = stream.readFloat32(Endianness.Little);
        return new this(type, volume);
      }

      case SoundDataUpdateType.SetPitch: {
        const pitch = stream.readFloat32(Endianness.Little);
        return new this(type, 0, pitch);
      }

      case SoundDataUpdateType.Fade: {
        const duration = stream.readFloat32(Endianness.Little);
        const targetVolume = stream.readFloat32(Endianness.Little);
        return new this(type, 0, 0, duration, targetVolume);
      }

      case SoundDataUpdateType.SeekTo: {
        const seconds = stream.readFloat32(Endianness.Little);
        return new this(type, 0, 0, 0, 0, seconds);
      }

      // Stop, Pause, and Resume have no payload
      default:
        return new this(type);
    }
  }

  public static write(stream: BinaryStream, value: SoundDataUpdate): void {
    // Write the type of the update
    stream.writeVarInt(value.type);

    // Write the payload based on the type of the update
    switch (value.type) {
      case SoundDataUpdateType.SetVolume:
        stream.writeFloat32(value.volume, Endianness.Little);
        break;

      case SoundDataUpdateType.SetPitch:
        stream.writeFloat32(value.pitch, Endianness.Little);
        break;

      case SoundDataUpdateType.Fade:
        stream.writeFloat32(value.duration, Endianness.Little);
        stream.writeFloat32(value.targetVolume, Endianness.Little);
        break;

      case SoundDataUpdateType.SeekTo:
        stream.writeFloat32(value.seconds, Endianness.Little);
        break;
    }
  }
}

export { SoundDataUpdate };
