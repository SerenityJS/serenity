import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { PurchaseReceipts } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.PurchaseReceipt)
class PurchaseReceiptPacket extends DataPacket {
  @Serialize(PurchaseReceipts) public receipts!: PurchaseReceipts;
}

export { PurchaseReceiptPacket };
