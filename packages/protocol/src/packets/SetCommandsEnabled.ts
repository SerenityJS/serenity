import { Bool, VarInt, VarString } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.SetCommandsEnabled)
class SetCommandsEnabled extends DataPacket {
	@Serialize(Bool) public enabled!: boolean;
}

export { SetCommandsEnabled };
