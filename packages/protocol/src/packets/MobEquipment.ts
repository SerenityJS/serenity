import { Int8, Uint8, VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { Item } from '../types/index.js';

@Packet(PacketId.MobEquipment)
class MobEquipment extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(Item) public item!: Item;
	@Serialize(Uint8) public slot!: number;
	@Serialize(Uint8) public selectedSlot!: number;
	@Serialize(Int8) public windowId!: number;
}

export { MobEquipment };
