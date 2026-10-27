import { Bool, VarInt } from "@serenityjs/binarystream";

import {
  type InventoryLayout,
  type InventoryLeftTab,
  type InventoryRightTab,
  Packet
} from "../../enums";
import { Proto, Serialize } from "../../decorators";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetPlayerInventoryOptions)
class SetPlayerInventoryOptionsPacket extends DataPacket {
  @Serialize(VarInt) public leftTab!: InventoryLeftTab;
  @Serialize(VarInt) public rightTab!: InventoryRightTab;
  @Serialize(Bool) public filtering!: boolean;
  @Serialize(VarInt) public layout!: InventoryLayout;
  @Serialize(VarInt) public craftingLayout!: InventoryLayout;
}

export { SetPlayerInventoryOptionsPacket };
