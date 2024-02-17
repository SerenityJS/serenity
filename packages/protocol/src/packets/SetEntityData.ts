import { VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { EntityProperties, MetadataDictionary } from '../types/index.js';

@Packet(PacketId.SetEntityData)
class SetEntityData<T = unknown> extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(MetadataDictionary) public metadata!: MetadataDictionary[];
	@Serialize(EntityProperties) public properties!: EntityProperties;
	@Serialize(VarLong) public tick!: bigint;
}

export { SetEntityData };
