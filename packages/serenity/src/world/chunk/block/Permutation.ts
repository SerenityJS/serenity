import { BinaryStream } from '@serenityjs/binarystream';
import { BedrockNBTDefinitionWriter, NBT_SERIALIZER } from '@serenityjs/nbt';
import type { MappedBlockStatePermutation } from './Interfaces';
import type { BlockType, MappedBlockType } from './Type';

export abstract class BlockPermutation {
	public readonly uniqueId: string;
	public readonly runtimeId: number;
	public readonly type: BlockType;
	public abstract readonly typeId: string;

	public constructor(type: BlockType, runtimeId: number, uniqueId: string) {
		this.runtimeId = runtimeId;
		this.uniqueId = uniqueId;
		this.type = type;
	}
}
export class MappedBlockPermutation extends BlockPermutation {
	public get typeId() {
		return this.type.id;
	}
	public constructor(type: MappedBlockType, permutation: MappedBlockStatePermutation) {
		super(type, Number(permutation.i), MappedBlockPermutation.BuildPermutationUniqueId(type, permutation.v));
	}
	public static BuildPermutationUniqueId(type: MappedBlockType, data: any[]) {
		const writer = new BedrockNBTDefinitionWriter(new BinaryStream());
		for (const [i] of type.states.types.entries()) data[i][NBT_SERIALIZER](writer);

		return '_' + writer.stream.getBuffer().toString(); // Its faster than String.fromCharCodes
	}
}
