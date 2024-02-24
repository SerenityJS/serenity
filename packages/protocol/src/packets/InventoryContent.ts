import { VarInt } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, WindowsIds } from '../enums/index.js';
import type { Item } from '../types/Item.js';
import { ItemStacks } from '../types/ItemStacks.js';

@Packet(PacketId.InventoryContent)
class InventoryContent extends DataPacket {
	@Serialize(VarInt) public windowId!: WindowsIds;
	@Serialize(ItemStacks) public items!: Item[];
}

export { InventoryContent };
