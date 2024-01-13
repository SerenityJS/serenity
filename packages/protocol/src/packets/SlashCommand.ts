import { VarInt, VarString } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId, PlayerStatus } from '../enums';

// Incomplete serialization 
@Packet(PacketId.SlashCommand)
class SlashCommand extends DataPacket {
    @Serialize(VarString) public rawCommand!: string;
}

export { SlashCommand };
