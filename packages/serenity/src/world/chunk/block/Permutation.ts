import type { MappedBlockPermutation } from './Mapper';
import type { BlockType } from './Type';

class BlockPermutation {
	protected readonly runtimeId: number;

	public readonly type: BlockType;

	public readonly state: string;

	public readonly value: number | string;

	public constructor(type: BlockType, mapped: MappedBlockPermutation) {
		this.type = type;
		this.runtimeId = mapped.runtimeId;
		this.state = mapped.state;
		this.value = mapped.value;
	}

	public getRuntimeId(): number {
		return this.runtimeId;
	}
}

export { BlockPermutation };
