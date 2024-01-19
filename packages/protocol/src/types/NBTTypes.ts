import type { Endianness , BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet-protocol";
import { WriteTag, ReadTag } from "./NBTTags";
import type { NBTCompoud, NBTSerializable } from "./NBTTags";

export class NBTTagItemData extends DataType{
    public static write(stream: BinaryStream, value: NBTCompoud, endian?: Endianness | null | undefined, param?: any): void {
        WriteTag(stream,value);
    }
    public static read(stream: BinaryStream, endian?: Endianness | null | undefined, param?: any): NBTCompoud {
        return ReadTag(stream) as NBTCompoud;
    }
}
