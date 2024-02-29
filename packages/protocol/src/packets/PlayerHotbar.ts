import { Int8, VarInt, Bool } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.PlayerHotbar)
class PlayerHotbar extends DataPacket {
	@Serialize(VarInt) public selectedSlot!: number;
	@Serialize(Int8) public windowId!: number;
	@Serialize(Bool) public selectSlot!: boolean;
}

export { PlayerHotbar };
