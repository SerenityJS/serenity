import { Endianness, VarInt } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, TransactionType } from "../../enums";
import {
	TransactionActions,
	TransactionData,
	TransactionLegacy
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.InventoryTransaction)
class InventoryTransactionPacket extends DataPacket {
	@Serialize(TransactionLegacy) public legacy!: TransactionLegacy;
	@Serialize(VarInt) public type!: TransactionType;
	@Serialize(TransactionActions) public actions!: Array<TransactionActions>;
	@Serialize(TransactionData, Endianness.Little, "type")
	public data!: TransactionData;
}

export { InventoryTransactionPacket };
