import { Endianness, VarInt, VarString } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId, TransactionType } from '../enums';
import type { TransactionAction } from '../types';
import {
	TransactionActions,
	TransactionData,
	TransactionLegacy,
	TransactionLegacyEntry,
	TransactionDataEntry,
} from '../types';

@Packet(PacketId.InventoryTransaction)
class InventoryTransaction extends DataPacket {
	@Serialize(TransactionLegacy) public legacy!: TransactionLegacyEntry;
	@Serialize(VarInt) public type!: TransactionType;
	@Serialize(TransactionActions) public actions!: TransactionAction[];
	@Serialize(TransactionData, Endianness.Little, 'type') public data!: TransactionDataEntry;
}

export { InventoryTransaction };
