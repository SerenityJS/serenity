import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { InventoryTransaction, LegacyTransaction } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.InventoryTransaction)
class InventoryTransactionPacket extends DataPacket {
  @Serialize(LegacyTransaction) public legacy!: LegacyTransaction;
  @Serialize(InventoryTransaction) public transaction!: InventoryTransaction;
}

export { InventoryTransactionPacket };
