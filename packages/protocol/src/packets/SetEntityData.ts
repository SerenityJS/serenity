import { VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';
import type { Metadata } from '../types';
import { EntityProperties, EntityProperty, MetadataDictionary } from '../types';

@Packet(PacketId.SetEntityData)
class SetEntityData<T = unknown> extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(MetadataDictionary) public metadata!: Metadata<T>[];
	@Serialize(EntityProperties) public properties!: EntityProperty;
	@Serialize(VarLong) public tick!: bigint;
}

export { SetEntityData };
