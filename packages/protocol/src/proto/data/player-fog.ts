import { Proto, Serialize } from "../../decorators";
import { Fogs } from "../types";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerFog)
class PlayerFogPacket extends DataPacket {
  @Serialize(Fogs) public fogs!: Fogs;
}

export { PlayerFogPacket };
