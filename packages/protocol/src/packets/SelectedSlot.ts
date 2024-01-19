import { Byte, Int16 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';

@Packet(PacketId.SelectedSlot)
class SelectedSlot extends DataPacket {
	@Serialize(Int16) public unknowData!: number;
	@Serialize(Byte) public slot!: number;
}

export { SelectedSlot };
