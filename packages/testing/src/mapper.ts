import { CANONICAL_BLOCK_STATES } from '@serenityjs/bedrock-data';
import { BinaryStream } from '@serenityjs/binarystream';
import { LightNBT } from '@serenityjs/nbt';

const stream = new BinaryStream(CANONICAL_BLOCK_STATES);

interface MappedBlockPermutation {
	runtimeId: number;
	states: string[];
	values: (number | string)[];
}

interface MappedBlock {
	identifier: string;
	permutations: Map<number, MappedBlockPermutation>;
	runtimeId: number;
	states: string[];
	version: number;
}

const blocks = new Map<string, MappedBlock>();

let RuntimeId = 0;
do {
	const data = LightNBT.ReadRootTag(stream) as any;

	const runtimeId = RuntimeId++;
	const identifier = data.name;

	if (!blocks.has(identifier)) {
		blocks.set(identifier, {
			identifier,
			permutations: new Map(),
			runtimeId,
			states: Object.keys(data.states),
			version: Number(data.version),
		});
	}

	const block = blocks.get(identifier)!;
	const states = Object.keys(data.states);
	const permutations = block.permutations;

	for (const [index, state] of Object.values(data.states).entries()) {
		const runtime = runtimeId + index;

		if (permutations.has(runtime)) {
			const permutation = permutations.get(runtime)!;
			permutation.states.push(states[index % states.length]);
			permutation.values.push(state as string);
		} else {
			permutations.set(runtime, {
				runtimeId: runtime,
				states: [states[index % states.length]],
				values: [state as string],
			});
		}
	}
} while (!stream.cursorAtEnd());

console.log(blocks.get('minecraft:redstone_wire'));
