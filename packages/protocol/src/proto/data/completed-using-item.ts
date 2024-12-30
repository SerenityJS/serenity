import { Proto, Serialize } from "@serenityjs/raknet";
import { Endianness, Int32, Short } from "@serenityjs/binarystream";

import { type ItemUseMethod, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.CompletedUsingItem)
class CompletedUsingItemPacket extends DataPacket {
  @Serialize(Short, Endianness.Little)
  public itemNetworkId!: number;

  @Serialize(Int32, Endianness.Little)
  public useMethod!: ItemUseMethod;
}

export { CompletedUsingItemPacket };
