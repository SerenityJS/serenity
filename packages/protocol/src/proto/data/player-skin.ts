import { Proto, Serialize } from "@serenityjs/raknet";
import { VarString, Bool } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { SerializedSkin, Uuid } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerSkin)
class PlayerSkinPacket extends DataPacket {
  @Serialize(Uuid) public uuid!: string;
  @Serialize(SerializedSkin) public skin!: SerializedSkin;
  @Serialize(VarString) public skinName!: string;
  @Serialize(VarString) public oldSkinName!: string;
  @Serialize(Bool) public isVerified!: boolean;
}

export { PlayerSkinPacket };
