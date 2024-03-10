import { Proto } from "../../decorators";
import { Packet } from "../../enums";

import { BasePacket } from "./base";

/**
 * Represents a disconnect packet.
 */
@Proto(Packet.Disconnect)
class Disconnect extends BasePacket {}

export { Disconnect };
