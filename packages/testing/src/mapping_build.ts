import fs from "node:fs";
import { BinaryStream } from "@serenityjs/binarystream";
import type { NBTCompoud, NBTSerializable, NBTValue} from "@serenityjs/nbt";
import { Byte, LightNBT, List, NBTTag, NBT_TYPE, StringifiedNBT, BedrockNBTDefinitionWriter, Int32 } from "@serenityjs/nbt";

const CANONICAL_BLOCK_STATES = fs.readFileSync("canonical_block_states.nbt");
const BIOME_FULL = fs.readFileSync("biome_definitions_full.nbt");
const strm = new BinaryStream(CANONICAL_BLOCK_STATES);
// Construct the block mappings

// Predefine the runtimeId
let runtimeId = 0;
const permutations = {} as {[K: string]: any;};
function getPermutationKind(states: {[K: string]: NBTValue;}){
    const obj = {names: new List(NBTTag.String), length: Byte(0), types: new List(NBTTag.Byte)};
    for(const k of Object.keys(states)) {
        obj.names.push(k);
        obj.types.push(Byte(states[k][NBT_TYPE]));
    }

    obj.length = Byte(obj.names.length);
    return obj;
}

const PERMUTATION = {
    Write(definition: {length:number;names:string[];}, values: any){
        const obj = {} as any;
        for (let i = 0; i < definition.length; i++) obj[i] = values[definition.names[i]];
        return obj;
    }  
};
let VERSION = Int32(0);
// Loop through the blocks, reading their names and IDs
do {
    // If next tag is not compoud, CANONICAL_BLOCK_STATES file could be corrupted
    if(CANONICAL_BLOCK_STATES[strm.offset] !== NBTTag.Compoud) break;
    // Read the tag
    const {name, states, version} = LightNBT.ReadRootTag(strm) as {
        name: string;
        states: {[k: string]: number;};
        version: number;
    };
    const id = runtimeId++;
    
    const permutation = permutations[name]??(permutations[name] = {
        name,
        type: getPermutationKind(states), 
        permutations: [],
        size: 0,
        id
    });
    permutation.size++;
    permutation.permutations.push({
        i: id,
        v: PERMUTATION.Write(permutation.type as any, states) 
    });
    if(!VERSION) VERSION = Int32(version);
    if(runtimeId === 35) console.log(StringifiedNBT.Stringify(permutation,"  "));
    // Get the name and ID
    // TODO: Handle the block states

    // Add the block to the map
} while (!strm.cursorAtEnd());

const sus = new BinaryStream();
LightNBT.WriteRootTag(sus, {permutations, version: VERSION});
fs.writeFileSync("mapped_block_states.nbt", sus.getBuffer());
console.log(StringifiedNBT.Stringify((LightNBT.ReadRootTag(new BinaryStream(BIOME_FULL)) as any).warped_forest, "  "));
