import { Proto, Serialize } from "@serenityjs/raknet";
import { VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { DeathParameters } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.DeathInfo)
class DeathInfoPacket extends DataPacket {
  @Serialize(VarString) public cause!: string;
  @Serialize(DeathParameters) public deathParameters!: Array<DeathParameters>;
}

export { DeathInfoPacket };
