import { Proto, Serialize } from "@serenityjs/raknet";
import { DataPacket } from "./data-packet";
import { ZigZag, ZigZong } from "@serenityjs/binarystream";
import { Packet } from "../../enums";

@Proto(Packet.HurtArmor)
class HurtArmorPacket extends DataPacket {
  @Serialize(ZigZag) public cause!: number;
  @Serialize(ZigZag) public damage!: number;
  @Serialize(ZigZong) public slots!: number;
} 

export { HurtArmorPacket }