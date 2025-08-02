import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8, VarLong } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ShowCredits)
class ShowCreditsPacket extends DataPacket {
  @Serialize(VarLong)
  public playerRuntimeId!: bigint;

  @Serialize(Uint8)
  public creditsState!: number;
}

export { ShowCreditsPacket };
