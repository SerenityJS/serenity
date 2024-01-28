import fs from "node:fs";
import path from "node:path";
import { BinaryStream } from "@serenityjs/binarystream";
import { BedrockNBTDefinitionWriter, LightNBT, NBT_SERIALIZER } from "@serenityjs/nbt";

function BuildPermutation(blockType: BlockType, data: any[]){
    const writer = new BedrockNBTDefinitionWriter(new BinaryStream());
    // @ts-expect-error its protected
    for (const [i,t] of blockType.types.types.entries()) data[i][NBT_SERIALIZER](writer);
    return "_" + writer.stream.getBuffer().toString();
}

export class BlockTypes{
    protected static readonly entries: {[K: string]: BlockType;} = {};
    protected static readonly maps = {} as {[K: number]: BlockPermutation;};
    public static get(typeId: string): BlockType | null{ return this.entries[typeId]??null; };
    public static *getAll(){ for (const key of Object.keys(this.entries)) yield this.entries[key]; }
};
export class BlockPermutation{
    protected readonly permutation;
    public readonly runtimeId;
    public readonly type;
    /**
     * @readonly
     */
    public get typeId(){return this.type.id;};
    protected constructor(type: BlockType, permutation: {i: number; v: any[];}){
        this.runtimeId = Number(permutation.i);
        this.permutation = BuildPermutation(type, permutation.v);
        this.type = type;
        // @ts-expect-error lmao
        BlockTypes.maps[permutation.i] = this;
    }
    public valueOf(){return this.permutation;}
    public static Resolve(typeId: string, states?: {[k: string]: boolean | number | string;}): BlockPermutation | null{
        const type = BlockTypes.get(typeId);
        if(!type) throw new ReferenceError("Unknow typeId " + typeId);
        if(!states) return type.defualtPermutation;
        const values = [];
        // @ts-expect-error lmao
        for (const K of type.types.names) values.push(states[K]??0);
        const strId = BuildPermutation(type, values);
        // @ts-expect-error lmao
        return type.permutations[strId]??null;
    }
    public static FromRuntimeId(id: number): BlockPermutation | null{
        // @ts-expect-error lmao
        return BlockTypes.maps[id]??null;
    }
}
export class BlockType{
    public readonly id: string;
    public readonly defualtPermutation!: BlockPermutation;
    protected readonly permutations: {[k: string]: BlockPermutation;} = {};
    protected readonly types;
    protected constructor(id: string, types: {length: number; names: string[]; types: number[];}, permutations: {i: number; v: any[];}[], defualtId: number){
        this.id = id;
        this.types = types;
        for (const perm of permutations) {
            // @ts-expect-error its protected
            const p = new BlockPermutation(this, perm);
            this.permutations[p.valueOf()] = p;
            if(!this.defualtPermutation) this.defualtPermutation = p;
        }

        if(!this.defualtPermutation) {
            // @ts-expect-error its protected
            this.defualtPermutation = new BlockPermutation(this, {i: defualtId, v: []});
            this.permutations[this.defualtPermutation.valueOf()] = this.defualtPermutation;
        }
    }
}

function load(){
    const {permutations, version} = LightNBT.ReadRootTag(new BinaryStream(fs.readFileSync(path.resolve(__dirname,"../../..","mapped_block_states.nbt")))) as any;
    for (const key of Object.keys(permutations)) {
        const {
            name,
            permutations:perms,
            type,
            id
        } = permutations[key] as {id: number;name: string; permutations: {i: number; v: any[];}; size: number; type: {length: number; names: string[]; types: number[];};};
        // @ts-expect-error its protected
        BlockTypes.entries[name] = new BlockType(name, type, perms, id);
    }
}

load();
