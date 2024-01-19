import type { Buffer } from "node:buffer";
import { Endianness} from "@serenityjs/binarystream";
import { type BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet-protocol";




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

export const NUMBER_SIZES = {
    [NBTTag.Byte]: 1,
    [NBTTag.Int16]: 2,
    [NBTTag.Int32]: 4,
    [NBTTag.Int64]: 8,
    [NBTTag.Float]: 4,
    [NBTTag.Double]: 8,
};
export class NBTValue<T = any> {
    public static readonly EMPTY: NBTValue<0> = new NBTValue(NBTTag.Byte, 0);
    public value: T;
    public readonly type: NBTTag;
    public constructor(type: NBTTag, value: T){
        this.value = value;
        this.type = type;
    }
}
export class CompoudValue extends NBTValue<{[K: string]: NBTValue;}>{
    public constructor(value: {[K: string]: NBTValue;}){
        super(NBTTag.Compoud,value??{});
    }
    public get(key: string){return this.value[key];}
    public set(key: string, value: NBTValue){return (this.value[key] = value);}
    public has(key: string){return key in this.value;}
    public *keys(){yield * Object.getOwnPropertyNames(this.value);}
    public *values(){ for(const k of Object.getOwnPropertyNames(this.value)) yield this.value[k]; }
    public *entries():Generator<[string, NBTValue<any>]> { for(const k of Object.getOwnPropertyNames(this.value)) yield [k,this.value[k]]; }
    public readonly [Symbol.iterator]!: typeof this["entries"];
    public forEach(callLater: (key: string, value: NBTValue, that: this)=>void): void {
        for(const [key,value] of this.entries())  callLater(key,value,this);
    }
    public get size(){return Object.getOwnPropertyNames(this.value).length;}
}
// @ts-expect-error //Readonly suppression
// eslint-disable-next-line @typescript-eslint/unbound-method
CompoudValue.prototype[Symbol.iterator] = CompoudValue.prototype.entries;
export class TypedArrayValue<T> extends NBTValue<NBTValue<T>[]>{
    public readonly arrayType;
    public constructor(v: NBTValue<T>[], type: NBTTag){
        super(NBTTag.TypedList, v);
        this.arrayType = type;
    }
    public add(v: NBTValue<T>){
        if(v instanceof NBTValue) return v;
        return this;
    }
    public remove(index: number){
        ArrayRemove(this.value,index);
    }
    public set(index: number, value: NBTValue){
        if(value instanceof NBTValue) return (this.value[index] = value);
        return this;
    }
    public get length(){
        return this.value.length;
    }
    public clear(){this.value = [];}
    public *[Symbol.iterator](){yield * this.value;}
    
}
class NumericValue<T extends bigint | number = number> extends NBTValue<T>{
    public constructor(type: NBTTag, value: T){
        super(type,value);
    }
    public valueOf(){return Number(this.value);}
}
export class Uint8ArrayValue extends NBTValue<Buffer>{
    public constructor(buffer: Buffer){super(NBTTag.ByteArray,buffer);}
    public set(buffer: Buffer){this.value = buffer;}
    public get(){return this.value;}
    public get length(){return this.value.length;}
}
export class StringValue extends NBTValue<string>{ 
    public constructor(v: string){super(NBTTag.String,v);}; 
    public valueOf(){return this.value;}; 
    public setValue(v: string){this.value = String(v);}; 
    public getValue(){return this.value;}; 
    public get length(){return this.value.length;}
}
export class ByteValue extends NumericValue{ public constructor(v: number){super(NBTTag.Byte,v);}; }
export class Int16Value extends NumericValue{ public constructor(v: number){super(NBTTag.Int16,v);}; }
export class Int32Value extends NumericValue{ public constructor(v: number){super(NBTTag.Int32,v);}; }
export class Int64Value extends NumericValue<bigint>{ public constructor(v: bigint){super(NBTTag.Int64,v);}; }
export class FloatValue extends NumericValue{ public constructor(v: number){super(NBTTag.Float,v);}; }
export class DoubleValue extends NumericValue{ public constructor(v: number){super(NBTTag.Double,v);}; }
function ArrayRemove(array: any[],index: number,removeNumber = 1){return array.slice(0,index).concat(array.slice(index + removeNumber));}


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
};
export type NBTData<T = any> = NBTValue<T>;

export function WriteTag(stream: BinaryStream, tag: NBTValue, isRoodTag = true){
    stream.writeByte(tag.type);
    if(isRoodTag) stream.writeString16("",Endianness.Little);
    NBT_Writers[tag.type as 1](stream, tag as ByteValue);
}

export function ReadTag(stream: BinaryStream, type?: NBTTag){ let t = type;
    if(!t) t = stream.readByte() as NBTTag;
    return NBT_Readers[t as NBTTag.Byte](stream) as NBTValue<any>;
}
