import { Endianness, Uint8 } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type PlayerListAction } from "../../enums";
import { PlayerListRecord } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerList)
class PlayerListPacket extends DataPacket {
  @Serialize(Uint8) public action!: PlayerListAction;
  @Serialize(PlayerListRecord, Endianness.Little, "action")
  public records!: Array<PlayerListRecord>;
}

export { PlayerListPacket };
