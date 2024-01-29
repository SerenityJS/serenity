import type { Buffer} from "node:buffer";
import { BinaryStream } from "@serenityjs/binarystream";
import { LightNBT } from "@serenityjs/nbt";
import { MappedBlockPermutation, type BlockPermutation } from "./BlockPermutation";
import type { BlockType} from "./BlockType";
import { MappedBlockType } from "./BlockType";
import type { MappedBlockStateEntry } from "./Interfaces";

export class BlockTypes {
    protected readonly types: Map<string, BlockType> = new Map;
    protected readonly permutations: Map<number, BlockPermutation> = new Map;
    public get(typeId: string): BlockType | null{ return this.types.get(typeId.includes(":")?typeId:"minecraft:" + typeId)??null; };
    public getAll(): IterableIterator<BlockType> { return this.types.values(); }
    public resolvePermutation(typeId: string, states?: {[k: string]: boolean | number | string;}): BlockPermutation{
        
        // Get type if possible
        const type = this.get(typeId) as MappedBlockType;
        
        // If type doesn't exists then just throw
        if(!type) throw new ReferenceError("Unknow typeId " + typeId);
        
        // No states specified, returing defualt permutation
        if(!states) return type.defaultPermutation;
        
        // Build permutation unique Id
        const values = [];
        for (const K of type.states.names) values.push(states[K]??0);
        const strId = MappedBlockPermutation.BuildPermutationUniqueId(type, values);
        
        const permutation = type.permutations.get(strId);
        
        // If type doesn't exists then just throw
        if(!permutation) throw new ReferenceError("No permutation with this combination of states");
        
        return permutation;
    };
    public constructor(rawBlockTypes: Buffer){
		// Create a new stream from the MAPPED_BLOCK_STATES file
		const stream = new BinaryStream(rawBlockTypes);

		// Read the root nbt tag
		const { permutations: blockTypes } = LightNBT.ReadRootTag(stream) as MappedBlockStateEntry;

		// Loop through the blocks, reading their names and IDs
		for (const key of Object.keys(blockTypes)) {
			const { name, permutations, type, id } = blockTypes[key];

			// Construct the block type
			const blockType = new MappedBlockType(name, type, permutations, id);

			// Add the block to the map
			this.types.set(name, blockType);

			// Add the permutations to the map
			for (const permutation of blockType.permutations.values()) this.permutations.set(permutation.runtimeId, permutation);
		}
    }
};
