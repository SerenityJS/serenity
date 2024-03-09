import { Bool, VarInt, VarString } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, PlayerStatus } from '../enums/index.js';
import { CommandOriginData } from '../types/CommandOriginData.js';

@Packet(PacketId.CommandRequest)
class CommandRequest extends DataPacket {
	@Serialize(VarString) public rawCommand!: string;
	@Serialize(CommandOriginData) public originData!: CommandOriginData;
	@Serialize(Bool) public isInternal!: boolean;
	@Serialize(VarInt) public version!: number;
}

export { CommandRequest };
