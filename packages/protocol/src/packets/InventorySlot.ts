import { VarInt } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, WindowsIds } from '../enums/index.js';
import { Item } from '../types/index.js';

@Packet(PacketId.InventorySlot)
class InventorySlot extends DataPacket {
	@Serialize(VarInt) public windowId!: WindowsIds;
	@Serialize(VarInt) public slot!: number;
	@Serialize(Item) public item!: Item;
}

export { InventorySlot };

const string = 'welcome to the jungle';

// get the amount of "e's" in the string

const eCount = string.split('').filter((char) => char === 'e').length;
