import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint64, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.CreatePhoto)
class CreatePhotoPacket extends DataPacket {
  @Serialize(Uint64) public rawId!: bigint;
  @Serialize(VarString) public photoName!: string;
  @Serialize(VarString) public photoItemName!: string;
}

export { CreatePhotoPacket };
