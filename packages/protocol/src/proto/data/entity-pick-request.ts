import { Bool, Uint64, Uint8 } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";
import { Packet } from "../../enums";
import { DataPacket } from "./data-packet";

@Proto(Packet.EntityPickRequest)
class EntityPickRequestPacket extends DataPacket {	
  @Serialize(Uint64) public runtimeEntityId!: bigint; // lu64
  @Serialize(Uint8) public slot!: number; //u8
  @Serialize(Bool) public hasData!: boolean;
}

export { EntityPickRequestPacket }