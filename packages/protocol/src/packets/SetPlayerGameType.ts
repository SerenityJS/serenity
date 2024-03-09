import { ZigZag } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Gamemode, Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.SetPlayerGameType)
class SetPlayerGameType extends DataPacket {
	@Serialize(ZigZag) public gamemode!: Gamemode;
}

export { SetPlayerGameType };
