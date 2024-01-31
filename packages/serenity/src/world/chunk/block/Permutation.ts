import type { BlockType } from './Type';

class BlockPermutation {
	public readonly runtimeId: number;

	public readonly type: BlockType;

	public readonly value: Record<string, number | string>;

	public constructor(type: BlockType, runtimeId: number, value: Record<string, number | string>) {
		this.type = type;
		this.runtimeId = runtimeId;
		this.value = value;
	}
}

export { BlockPermutation };
