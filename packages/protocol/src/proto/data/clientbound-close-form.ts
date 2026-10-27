import { Proto } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientboundCloseForm)
class ClientboundCloseFormPacket extends DataPacket {}

export { ClientboundCloseFormPacket };
