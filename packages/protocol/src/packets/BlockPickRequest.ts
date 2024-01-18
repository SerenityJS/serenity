import { Bool, Uint8, ZigZag } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';

@Packet(PacketId.BlockPickRequest)
class BlockPickRequest extends DataPacket {
	@Serialize(ZigZag) public x!: number;
	@Serialize(ZigZag) public y!: number;
	@Serialize(ZigZag) public z!: number;
	@Serialize(Bool) public addData!: boolean;
	@Serialize(Uint8) public selectedSlot!: number;
}

export { BlockPickRequest };
