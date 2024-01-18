import type { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet-protocol";
import { ReadTag, WriteTag} from "./NBTTags";
import type { NBTValue } from "./NBTTags";

export class NBTTagItemData extends DataType{
    public static write(stream: BinaryStream, value: NBTValue, endian?: Endianness | null | undefined, param?: any): void {
        console.log("BUILD NBT");
        WriteTag(stream,value);
    }
    public static read(stream: BinaryStream, endian?: Endianness | null | undefined, param?: any): NBTValue<any> {
        return ReadTag(stream);
    }
}
