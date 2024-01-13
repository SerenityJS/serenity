import { Uint8, Bool, VarString } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { ChatTypes, Packet as PacketId } from '../enums';
import { TextSource, TextParameters } from '../types';

@Packet(PacketId.Text)
class Text extends DataPacket {
	@Serialize(Uint8) public types!: ChatTypes;
	@Serialize(Bool) public needsTranslation!: boolean;
	@Serialize(TextSource) public source!: string | null;
	@Serialize(VarString) public message!: string;
	@Serialize(TextParameters) public parameters!: string[] | null;
	@Serialize(VarString) public xuid!: string;
	@Serialize(VarString) public platformChatId!: string;
}

export { Text };
