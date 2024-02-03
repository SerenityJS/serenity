import { ZigZag } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Gamemode, Packet as PacketId } from '../enums';

@Packet(PacketId.SetPlayerGameType)
class SetPlayerGameType extends DataPacket {
	@Serialize(ZigZag) public gamemode!: Gamemode;
}

export { SetPlayerGameType };
