import { Proto, Serialize } from "@serenityjs/raknet";
import { Fogs } from "../types";
import { DataPacket } from "./data-packet";
import { Packet } from "../../enums";

@Proto(Packet.PlayerFog)
class PlayerFogPacket extends DataPacket {
  @Serialize(Fogs) public fogs!: Fogs;
}

export { PlayerFogPacket };
