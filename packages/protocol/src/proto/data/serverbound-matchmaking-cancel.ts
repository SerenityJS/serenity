import { Proto } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

/**
 * Requests cancellation of the matchmaking ticket of the sending player.
 * This packet has no payload.
 */
@Proto(Packet.ServerboundMatchmakingCancel)
class ServerboundMatchmakingCancelPacket extends DataPacket {}

export { ServerboundMatchmakingCancelPacket };
