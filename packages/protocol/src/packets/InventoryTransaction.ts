import { Endianness, VarInt } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, TransactionType } from '../enums/index.js';
import { TransactionActions, TransactionData, TransactionLegacy } from '../types/index.js';

@Packet(PacketId.InventoryTransaction)
class InventoryTransaction extends DataPacket {
	@Serialize(TransactionLegacy) public legacy!: TransactionLegacy;
	@Serialize(VarInt) public type!: TransactionType;
	@Serialize(TransactionActions) public actions!: TransactionActions[];
	@Serialize(TransactionData, Endianness.Little, 'type') public data!: TransactionData;
}

export { InventoryTransaction };
