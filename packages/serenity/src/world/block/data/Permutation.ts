import { BinaryStream } from '@serenityjs/binarystream';
import { BedrockNBTDefinitionWriter, NBT_SERIALIZER } from '@serenityjs/nbt';
import type { MappedBlockStatePermutation } from '../Mappings';
import type { BlockType } from './Type';

class BlockPermutation {
	public readonly name: string;
	public readonly runtimeId: number;
	public readonly type: BlockType;

	public constructor(type: BlockType, permutation: MappedBlockStatePermutation) {
		this.runtimeId = Number(permutation.i);
		this.name = BlockPermutation.buildPermutation(type, permutation.v);
		this.type = type;
	}

	public static buildPermutation(type: BlockType, data: any[]) {
		const writer = new BedrockNBTDefinitionWriter(new BinaryStream());
		for (const [i] of type.states.types.entries()) data[i][NBT_SERIALIZER](writer);

		return '_' + String.fromCodePoint(...writer.stream.binary);
	}
}

export { BlockPermutation };
