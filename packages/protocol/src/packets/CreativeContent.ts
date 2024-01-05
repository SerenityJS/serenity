import { VarInt } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId, PlayerStatus } from '../enums';

@Packet(PacketId.CreativeContent)
class CreativeContent extends DataPacket {
	@Serialize(VarInt) public items!: number; // TODO: Item[]
}

export { CreativeContent };
