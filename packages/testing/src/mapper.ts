import { CANONICAL_BLOCK_STATES } from '@serenityjs/bedrock-data';
import { BinaryStream } from '@serenityjs/binarystream';
import { LightNBT } from '@serenityjs/nbt';

const stream = new BinaryStream(CANONICAL_BLOCK_STATES);

interface MappedBlock {
	identifier: string;
	permutations: { runtimeId: number; state: string; value: string }[];
	runtimeId: number;
	states: string[];
	version: number;
}

const blocks = new Map<string, MappedBlock>();

let RuntimeId = 0;
do {
	const data = LightNBT.ReadRootTag(stream) as any;

	const runtime = RuntimeId++;
	const identifier = data.name;

	if (blocks.has(identifier)) {
		const block = blocks.get(identifier)!;
		const states = Object.keys(data.states);
		// eslint-disable-next-line @typescript-eslint/no-loop-func
		const permutations = Object.values(data.states).map((state, index) => {
			return { value: state as string, runtimeId: runtime + index, state: states[index % states.length] };
		});

		blocks.set(identifier, {
			identifier,
			runtimeId: block.runtimeId,
			version: block.version,
			states: [...block.states],
			permutations: [...block.permutations, ...permutations],
		});
	} else {
		const version = Number(data.version);
		const states = Object.keys(data.states);
		const permutations = Object.values(data.states).map((state, index) => {
			return { value: state as string, runtimeId: runtime + index, state: states[index % states.length] };
		});

		blocks.set(identifier, { identifier, runtimeId: runtime, version, states, permutations });
	}
} while (!stream.cursorAtEnd());

console.log(blocks.get('minecraft:oxidized_copper_door'));
