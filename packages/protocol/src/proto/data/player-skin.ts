import { Proto, Serialize } from "@serenityjs/raknet";
import { VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { SerializedSkin, Uuid } from "../types";

import { DataPacket } from "./data-packet";

/**
 * Updates the skin of a player.
 * The trusted skin flag is part of the serialized skin itself.
 */
@Proto(Packet.PlayerSkin)
class PlayerSkinPacket extends DataPacket {
  @Serialize(Uuid) public uuid!: string;
  @Serialize(SerializedSkin) public skin!: SerializedSkin;
  @Serialize(VarString) public skinName!: string;
  @Serialize(VarString) public oldSkinName!: string;
}

export { PlayerSkinPacket };
