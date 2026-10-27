import { Bool, Uint8 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { BlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.GuiDataPickItem)
class PlayerToggleCrafterRequestPacket extends DataPacket {
  @Serialize(BlockPosition) public position!: BlockPosition;
  @Serialize(Uint8) public slotIndex!: number;
  @Serialize(Bool) public isDisabled!: boolean;
}

export { PlayerToggleCrafterRequestPacket };
