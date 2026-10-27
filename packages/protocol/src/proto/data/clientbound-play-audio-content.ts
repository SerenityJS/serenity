import {
  Bool,
  Endianness,
  Float32,
  Uint64,
  VarString,
  ZigZag
} from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { type AudioContentPlaybackType, Packet } from "../../enums";
import { BlockPosition } from "../types";

import { DataPacket } from "./data-packet";

/**
 * Provides signed audio content to the client and requests its playback.
 * Each signed audio content is serialized as a compact JWT string.
 */
@Proto(Packet.ClientboundPlayAudioContent)
class ClientboundPlayAudioContentPacket extends DataPacket {
  /**
   * The signed shared metadata of the audio content, as a compact JWT.
   */
  @Serialize(VarString) public sharedMetadata!: string;

  /**
   * The signed playback content of the audio content, as a compact JWT.
   */
  @Serialize(VarString) public playbackContent!: string;

  /**
   * The playback type of the audio content, serialized by its name.
   */
  @Serialize(VarString) public playbackType!: AudioContentPlaybackType;

  /**
   * The name of the sound to play.
   * This and the following properties make up the play sound payload of the packet.
   */
  @Serialize(VarString) public name!: string;

  /**
   * The position to play the sound at.
   */
  @Serialize(BlockPosition) public position!: BlockPosition;

  /**
   * The volume of the sound.
   */
  @Serialize(Float32, { endian: Endianness.Little }) public volume!: number;

  /**
   * The pitch of the sound.
   */
  @Serialize(Float32, { endian: Endianness.Little }) public pitch!: number;

  /**
   * The amount of times the sound loops.
   */
  @Serialize(ZigZag) public loopCount!: number;

  /**
   * Whether the sound bypasses the listener range check.
   */
  @Serialize(Bool) public bypassListenerRangeCheck!: boolean;

  /**
   * The server sound handle of the sound, if any.
   */
  @Serialize(Uint64, { endian: Endianness.Little, optional: true })
  public serverSoundHandle?: bigint;

  /**
   * The playback position of the sound in seconds, if any.
   */
  @Serialize(Float32, { endian: Endianness.Little, optional: true })
  public playbackPositionSeconds?: number;
}

export { ClientboundPlayAudioContentPacket };
