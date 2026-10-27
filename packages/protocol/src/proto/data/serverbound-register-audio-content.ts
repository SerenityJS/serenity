import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { AudioContentRegistrationEntry } from "../types";

import { DataPacket } from "./data-packet";

/**
 * Registers signed audio content for the sending player.
 */
@Proto(Packet.ServerboundRegisterAudioContent)
class ServerboundRegisterAudioContentPacket extends DataPacket {
  /**
   * The audio content registrations of the player.
   */
  @Serialize(AudioContentRegistrationEntry)
  public registrations!: Array<AudioContentRegistrationEntry>;
}

export { ServerboundRegisterAudioContentPacket };
