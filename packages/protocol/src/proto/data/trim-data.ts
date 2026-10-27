import { Proto, Serialize } from "../../decorators";
import { Patterns, Materials } from "../types";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.TrimData)
class TrimDataPacket extends DataPacket {
  @Serialize(Patterns) public patterns!: Patterns;
  @Serialize(Materials) public materials!: Materials;
}

export { TrimDataPacket };
