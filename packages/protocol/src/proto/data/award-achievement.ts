import { Int32, Endianness } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.AwardAchievement)
class AwardAchievementPacket extends DataPacket {
  @Serialize(Int32, { endian: Endianness.Little }) public identifier!: number;
}

export { AwardAchievementPacket };
