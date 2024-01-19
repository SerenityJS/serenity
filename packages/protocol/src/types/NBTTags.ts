import { Buffer } from "node:buffer";
import type { BinaryStream } from "@serenityjs/binarystream";
import { Endianness} from "@serenityjs/binarystream";

export enum NBTTag{
    "EndOfCompoud" = 0,
    "Byte" = 1,
    "Int16" = 2,
    "Int32" = 3,
    "Int64" = 4,
    "Float" = 5,
    "Double" = 6,
    "ByteArray" = 7,
    "String" = 8,
    "TypedList" = 9,
    "Compoud" = 10
}
export const NBT_SERIALIZER: unique symbol = Symbol("NBT_SERIALIZER");
export const NBT_TYPE: unique symbol = Symbol("NBT_TYPE");
// Private type, you should not use it
const ARRAY_TYPE: unique symbol = Symbol("ARRAY_TYPE");
export interface NBTSerializable{
    [NBT_SERIALIZER](myStream: BinaryStream): void;
    [NBT_TYPE]: number;
}
/// /////////////////////////////////////////////////////////////  
/// /////////////////////////////// Special Number Types
/// /////////////////////////////////////////////////////////////
interface NBTKind<T = number> extends NBTSerializable {
    value: T;
    valueOf(): T;
}
interface NBTKindConstructor<T = number>{
    (v: T): NBTKind<T>;
    new (v: T): NBTKind<T>;
    readonly prototype: NBTKind<T>;
}
export interface Byte extends NBTKind{}
export interface Int16 extends NBTKind{}
export interface Int32 extends NBTKind{}
export interface Int64 extends NBTKind<bigint>{}
export interface Float extends NBTKind{}
export interface Double extends NBTKind{}

// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
export const Byte = function (v: number) { return BaseFunction(v, new.target??Byte); } as unknown as NBTKindConstructor;
// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
export const Int16 = function (v: number) { return BaseFunction(v, new.target??Int16); } as unknown as NBTKindConstructor;
// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
export const Int32 = function (v: number) { return BaseFunction(v, new.target??Int32); } as unknown as NBTKindConstructor;
// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
export const Int64 = function (v: number) { return BaseFunction(v, new.target??Int64); } as unknown as NBTKindConstructor<bigint>;
// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
export const Float = function (v: number) { return BaseFunction(v, new.target??Float); } as unknown as NBTKindConstructor;
// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
export const Double = function (v: number) { return BaseFunction(v, new.target??Double); } as unknown as NBTKindConstructor;

function BaseFunction(v: any, as: {prototype: any;}){ return {value: v,__proto__: as.prototype}; }
export const Short = Int16;
export const Int = Int32;
export const Long = Int64;

const NBT_RAW_WRITTERS: {[k: number]: (s: BinaryStream, value: any)=>void;} = {
    [NBTTag.Byte](stream, value: number){ stream.writeByte(value);},
    [NBTTag.Int16](stream, value: number){stream.writeInt16(value, Endianness.Little);},
    [NBTTag.Int32](stream, value: number){stream.writeInt32(value, Endianness.Little);},
    [NBTTag.Int64](stream, value: bigint){stream.writeInt64(value, Endianness.Little);},
    [NBTTag.Float](stream, value: number){stream.writeFloat32(value, Endianness.Little);},
    [NBTTag.Double](stream, value: number){stream.writeFloat64(value, Endianness.Little);},
    [NBTTag.Compoud](s: BinaryStream, value: {[k: string]: NBTSerializable;}){
        for (const [key,v] of Object.entries(value)) {
            const type = v[NBT_TYPE];
            s.writeByte(type);
            s.writeString16(key, Endianness.Little);
            v[NBT_SERIALIZER](s);
        }

        s.writeByte(NBTTag.EndOfCompoud);
    },
    [NBTTag.TypedList](s: BinaryStream, value: NBTSerializable[]){
        const mainType = (value as any)[ARRAY_TYPE]??value[0][NBT_TYPE];
        s.writeByte(mainType);
        s.writeInt32(value.length, Endianness.Little);
        for (const a of value) {
            if(mainType !== a[NBT_TYPE]) throw new TypeError(`List could has only one kind of type, expected ${NBTTag[mainType]} but got ${NBTTag[a[NBT_TYPE]]}`);
            a[NBT_SERIALIZER](s);
        }
    },
    [NBTTag.ByteArray](s: BinaryStream, value: Buffer){
        s.writeInt32(value.length, Endianness.Little);
        s.writeBuffer(value);
    },
    [NBTTag.String](s: BinaryStream, value: string){
        s.writeString16(value, Endianness.Little);
    },
};

export type NBTValue = Byte | Double | Float | Int16 | Int32 | Int64 | NBTValue[] | bigint | number | string | {[KEY: string]: NBTValue;};
export interface NBTCompoud {[KEY: string]: NBTValue;}

const DATA_MAPING = [Byte, Int16, Int32, Int64, Float, Double];
const DATA_MAP_TYPES = [NBTTag.Byte, NBTTag.Int16, NBTTag.Int32, NBTTag.Int64, NBTTag.Float, NBTTag.Double];
const base: any = {
    [NBT_SERIALIZER](m: BinaryStream){ NBT_RAW_WRITTERS[this[NBT_TYPE] as number](m, this.valueOf()); },
    valueOf(){ return this.value; }
};
for (const [i, element] of DATA_MAPING.entries()) 
    // @ts-expect-error its readonly but must be initialized
    element.prototype = Object.setPrototypeOf({
        [NBT_TYPE]: DATA_MAP_TYPES[i]
    }, base);

declare global {
    interface String{
        [NBT_SERIALIZER](myStream: BinaryStream): void;
        [NBT_TYPE]: number;
    }
    interface BigInt{
        [NBT_SERIALIZER](myStream: BinaryStream): void;
        [NBT_TYPE]: number;
    }
    interface Number{
        [NBT_SERIALIZER](myStream: BinaryStream): void;
        [NBT_TYPE]: number;
    }
    interface Array<T>{
        [NBT_SERIALIZER](myStream: BinaryStream): void;
        [NBT_TYPE]: number;
        typeOf(tag: number): this;
    }
    interface Object{
        [NBT_SERIALIZER](myStream: BinaryStream): void;
        [NBT_TYPE]: number;
    }
    interface Boolean{
        [NBT_SERIALIZER](myStream: BinaryStream): void;
        [NBT_TYPE]: number;
    }
    interface Buffer{
        [NBT_SERIALIZER](myStream: BinaryStream): void;
        [NBT_TYPE]: number;
    }
}
const ES_MAPPINGS = [String, Object, Array, Number, BigInt, Boolean, Buffer];
const ES_MAP_TYPES = [NBTTag.String, NBTTag.Compoud, NBTTag.TypedList, NBTTag.Int16, NBTTag.Int64, NBTTag.Byte, NBTTag.ByteArray];
for (const [i, element] of ES_MAPPINGS.entries()) {
    element.prototype[NBT_TYPE] = ES_MAP_TYPES[i];
    element.prototype[NBT_SERIALIZER] = RawWriter;
}

// eslint-disable-next-line no-extend-native
Array.prototype.typeOf = function typeOf(tag){
    // @ts-expect-error just bc
    this[ARRAY_TYPE] = tag;
    return this;
};


function RawWriter(this: NBTSerializable, stream: BinaryStream){
    NBT_RAW_WRITTERS[this[NBT_TYPE]](stream,this);
}

export const NUMBER_SIZES = {
    [NBTTag.Byte]: 1,
    [NBTTag.Int16]: 2,
    [NBTTag.Int32]: 4,
    [NBTTag.Int64]: 8,
    [NBTTag.Float]: 4,
    [NBTTag.Double]: 8,
};

export function WriteTag(stream: BinaryStream, tag: NBTSerializable, rootName: string = ""){
    stream.writeByte(tag[NBT_TYPE]);
    if(typeof rootName === "string") stream.writeString16(rootName);
    tag[NBT_SERIALIZER](stream);
}

export function ReadTag(stream: BinaryStream, isRoot = true): NBTSerializable{
    throw new ReferenceError("No implementation");
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace NBTTags{
    export const EMPTY = {};
}
/*
const NBT_Readers = {
    [NBTTag.Compoud](myStream: BinaryStream, type?: NBTTag){
        const compoud = new CompoudValue({});
        while(true){
            const readType = NBT_Readers.readType(myStream);
            if(readType === NBTTag.EndOfCompoud) return compoud;
            const keyName = NBT_Readers[NBTTag.String](myStream,NBTTag.String);
            const value = NBT_Readers[readType as 1](myStream,readType);
            compoud.set(String(keyName), value);
        }
    },
    [NBTTag.TypedList](myStream: BinaryStream, type?: NBTTag){
        const readType = NBT_Readers.readType(myStream);
        const readLength = myStream.readInt32(Endianness.Little);
        const array = [];
        for (let i = 0; i < readLength; i++) array.push(NBT_Readers[readType as 1](myStream,readType));
        return new TypedArrayValue(array,readType);
    },
    [NBTTag.ByteArray](myStream: BinaryStream, type?: NBTTag){
        const buffer = myStream.readBuffer(myStream.readInt32(Endianness.Little));
        return new Uint8ArrayValue(buffer);
    },
    [NBTTag.String](myStream: BinaryStream, type?: NBTTag){
        return new StringValue(myStream.readString16(Endianness.Little));
    },
    readType(myStream: BinaryStream){ return myStream.readByte(); },
    [NBTTag.Byte](myStream: BinaryStream, type?: NBTTag){return new NumericValue(type??NBTTag.Byte,myStream.readByte());},
    [NBTTag.Int16](myStream: BinaryStream, type?: NBTTag){return  new NumericValue(type??NBTTag.Int16,myStream.readInt16(Endianness.Little));},
    [NBTTag.Int32](myStream: BinaryStream, type?: NBTTag){return  new NumericValue(type??NBTTag.Int32,myStream.readInt32(Endianness.Little));},
    [NBTTag.Int64](myStream: BinaryStream, type?: NBTTag){return  new NumericValue(type??NBTTag.Int64,myStream.readInt64(Endianness.Little));},
    [NBTTag.Float](myStream: BinaryStream, type?: NBTTag){return  new NumericValue(type??NBTTag.Float,myStream.readFloat32(Endianness.Little));},
    [NBTTag.Double](myStream: BinaryStream, type?: NBTTag){return  new NumericValue(type??NBTTag.Double,myStream.readFloat64(Endianness.Little));}
};
const NBT_Writers = {
    [NBTTag.Compoud](myStream: BinaryStream, value: CompoudValue){
        for (const [key,v] of value) {
            const type = v.type;
            myStream.writeByte(type);
            myStream.writeString16(key, Endianness.Little);
            NBT_Writers[type as 1](myStream, v as any);
        }

        myStream.writeByte(NBTTag.EndOfCompoud);
    },
    [NBTTag.TypedList](myStream: BinaryStream, value: TypedArrayValue<NBTTag>){
        const {length,arrayType} = value;
        myStream.writeByte(arrayType);
        myStream.writeInt32(length,Endianness.Little);
        for(const v of value) NBT_Writers[arrayType as 1](myStream,v as any);
    },
    [NBTTag.ByteArray](myStream: BinaryStream, value: Uint8ArrayValue){
        myStream.writeInt32(value.length,Endianness.Little);
        myStream.writeBuffer(value.value);
    },
    [NBTTag.String](myStream: BinaryStream, value: StringValue){
        myStream.writeString16(value.value, Endianness.Little);
    },
    [NBTTag.Byte](myStream: BinaryStream, value: ByteValue){ myStream.writeByte(value.value);},
    [NBTTag.Int16](myStream: BinaryStream, value: Int16Value){myStream.writeInt16(value.value, Endianness.Little);},
    [NBTTag.Int32](myStream: BinaryStream, value: Int32Value){myStream.writeInt32(value.value, Endianness.Little);},
    [NBTTag.Int64](myStream: BinaryStream, value: Int64Value){myStream.writeInt64(value.value, Endianness.Little);},
    [NBTTag.Float](myStream: BinaryStream, value: FloatValue){myStream.writeFloat32(value.value, Endianness.Little);},
    [NBTTag.Double](myStream: BinaryStream, value: DoubleValue){myStream.writeFloat64(value.value, Endianness.Little);}
};*/
