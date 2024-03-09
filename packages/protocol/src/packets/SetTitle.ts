import { Uint8, Bool, VarString, Endianness, ZigZag } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { ChatTypes, Packet as PacketId, TitleTypes } from '../enums/index.js';

@Packet(PacketId.SetTitle)
class SetTitle extends DataPacket {
	@Serialize(ZigZag) public type!: TitleTypes;
	@Serialize(VarString) public text!: string;
	@Serialize(ZigZag) public fadeInTime!: number;
	@Serialize(ZigZag) public stayTime!: number;
	@Serialize(ZigZag) public fadeOutTime!: number;
	@Serialize(VarString) public xuid!: string;
	@Serialize(VarString) public platformOnlineId!: string;
}

export { SetTitle };
