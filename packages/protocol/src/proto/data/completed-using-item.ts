import { Proto, Serialize } from "@serenityjs/raknet";
import { Endianness, Int32, Int16 } from "@serenityjs/binarystream";

import { type ItemUseMethod, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.CompletedUsingItem)
class CompletedUsingItemPacket extends DataPacket {
  @Serialize(Int16, { endian: Endianness.Little })
  public itemNetworkId!: number;

  @Serialize(Int32, { endian: Endianness.Little })
  public useMethod!: ItemUseMethod;
}

export { CompletedUsingItemPacket };
