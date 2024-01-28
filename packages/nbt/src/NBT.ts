/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable no-inner-declarations */
import { Buffer } from 'node:buffer';

enum NBTTag {
	'EndOfCompoud' = 0,
	'Byte' = 1,
	'Int16' = 2,
	'Int32' = 3,
	'Int64' = 4,
	'Float' = 5,
	'Double' = 6,
	'ByteArray' = 7,
	'String' = 8,
	'List' = 9,
	'Compoud' = 10,
	'Int32Array' = 0x0b,
	'Int64Array' = 0x0c,
}
const NBT_SERIALIZER = '__NBT_SERIALIZER';
const NBT_TYPE = '__NBT_TYPE';
const NBT_VALUE = '__nbt';
// Private type, you should not use it
const ARRAY_TYPE = '__NBT_ARRAY_TYPE';
interface NBTSerializable<T extends number = number> {
	[NBT_SERIALIZER](definition: DefinitionWriter, ...params: any[]): void;
	[NBT_TYPE]: T;
}
/// /////////////////////////////////////////////////////////////
/// /////////////////////////////// Special Number Types
/// /////////////////////////////////////////////////////////////
interface NBTKind<T = number, K extends number = number> extends NBTSerializable<K> {
	toString(): string;
	valueOf(): T;
}
type NBTSource<T, K extends number = number> = NBTKind<T, K>;
const Construct: unique symbol = Symbol('Ctor');
interface NBTKindConstructor<T> {
	(v?: unknown): T;
	new (v?: unknown): T;
	[Construct]: new (v: any) => any;
	readonly prototype: T;
}
interface ListConstructor {
	new <N extends number, T extends any[]>(tag: N): List<N>;
	new <N extends number, T extends any[], M extends (value: T[number], index: number, array: T) => NBTSerializable<N>>(
		tag: N,
		array: T,
		mapFc?: M,
	): List<N>;
	<N extends number, T extends any[]>(tag: N): List<N>;
	<N extends number, T extends any[], M extends (value: T[number], index: number, array: T) => NBTSerializable<N>>(
		tag: N,
		array: T,
		mapFc?: M,
	): List<N>;
	readonly prototype: List<any>;
}
type Byte = NBTSource<number, NBTTag.Byte> & number;
type Int16 = NBTSource<number, NBTTag.Int16> & number;
type Int32 = NBTSource<number, NBTTag.Int32> & number;
type Int64 = NBTSource<bigint, NBTTag.Int64> & number;
type Float = NBTSource<number, NBTTag.Float> & number;
type Double = NBTSource<number, NBTTag.Double> & number;
type List<N extends number> = NBTSerializable<N>[];
class BigIntWrapper {
	protected [NBT_VALUE]: bigint;
	public constructor(n: any) {
		this[NBT_VALUE] = BigInt(n);
	}
	public valueOf(): bigint {
		return this[NBT_VALUE];
	}
	public toString(): string {
		return BigInt.prototype.toString.call(this[NBT_VALUE]);
	}
	public toLocalString(): string {
		return BigInt.prototype.toLocaleString.call(this[NBT_VALUE]);
	}
	public [NBT_SERIALIZER](m: any, ...params: any[]) {
		m[this[NBT_TYPE] as 4](this.valueOf(), ...params);
	}
}
Object.setPrototypeOf(BigIntWrapper, BigInt);
Object.setPrototypeOf(BigIntWrapper.prototype, BigInt.prototype);
class NumberWrapper {
	protected [NBT_VALUE]: number;
	public constructor(n: any) {
		this[NBT_VALUE] = Number(n);
	}
	public valueOf(): number {
		return this[NBT_VALUE];
	}
	public toString(): string {
		return Number.prototype.toString.call(this[NBT_VALUE]);
	}
	public toLocalString(): string {
		return Number.prototype.toLocaleString.call(this[NBT_VALUE]);
	}
	public toFixed(fractionDigits?: number) {
		return Number.prototype.toFixed.call(this[NBT_VALUE], fractionDigits);
	}
	public toExponential(fractionDigits?: number) {
		return Number.prototype.toExponential.call(this[NBT_VALUE], fractionDigits);
	}
	public toPrecision(precision?: number) {
		return Number.prototype.toPrecision.call(this[NBT_VALUE], precision);
	}
	public [NBT_SERIALIZER](m: any, ...params: any[]) {
		m[this[NBT_TYPE] as 1](this.valueOf(), ...params);
	}
}
Object.setPrototypeOf(NumberWrapper, Number);
Object.setPrototypeOf(NumberWrapper.prototype, Number.prototype);

// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
const List = function (tag: number, array?: NBTSerializable[], mapFc?: (a: any, i: number, n: any[]) => any) {
	const a = [] as any[];
	// eslint-disable-next-line @typescript-eslint/no-use-before-define
	const has = tag in ConversionTypes;
	let i = 0;
	if (array)
		for (let v of array) {
			if (mapFc) v = mapFc(v, i++, array);
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			else if (v[NBT_TYPE] in ConversionTypes && has) v = ConversionTypes[tag as 1](v);
			if (v[NBT_TYPE] !== tag) throw new TypeError('Mapped value must be type of ' + NBTTag[tag]);
			a.push(v);
		}

	return Object.setPrototypeOf(Object.assign(a, { [ARRAY_TYPE]: tag }), new.target?.prototype ?? List.prototype);
} as ListConstructor;
Object.setPrototypeOf(List, Array);
Object.setPrototypeOf(List.prototype, Array.prototype);
// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
const Byte = function (v: number) {
	return BaseFunction(v ?? 0, new.target ?? Byte, (new.target as any)?.[Construct] ?? NumberWrapper);
} as unknown as NBTKindConstructor<Byte>;
// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
const Int16 = function (v: number) {
	return BaseFunction(v ?? 0, new.target ?? Int16, (new.target as any)?.[Construct] ?? NumberWrapper);
} as unknown as NBTKindConstructor<Int16>;
// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
const Int32 = function (v: number) {
	return BaseFunction(v ?? 0, new.target ?? Int32, (new.target as any)?.[Construct] ?? NumberWrapper);
} as unknown as NBTKindConstructor<Int32>;
// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
const Int64 = function (v: bigint) {
	return BaseFunction(v ?? 0, new.target ?? Int64, (new.target as any)?.[Construct] ?? BigIntWrapper);
} as unknown as NBTKindConstructor<Int64>;
// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
const Float = function (v: number) {
	return BaseFunction(v ?? 0, new.target ?? Float, (new.target as any)?.[Construct] ?? NumberWrapper);
} as unknown as NBTKindConstructor<Float>;
// eslint-disable-next-line @typescript-eslint/no-redeclare, func-names
const Double = function (v: number) {
	return BaseFunction(v ?? 0, new.target ?? Double, (new.target as any)?.[Construct] ?? NumberWrapper);
} as unknown as NBTKindConstructor<Double>;

function BaseFunction(
	v: any,
	as: { prototype: any },
	ctor: typeof BigIntWrapper | typeof NumberWrapper = NumberWrapper,
) {
	return Object.setPrototypeOf(
		Object.assign(new (ctor as typeof NumberWrapper)(v as any) as any, { [NBT_TYPE]: as.prototype[NBT_TYPE] }),
		as.prototype,
	);
}

type NBTValue =
	| BigInt64Array
	| BigUint64Array
	| Byte
	| Double
	| Float
	| Int16
	| Int32
	| Int32Array
	| Int64
	| List<number>
	| NBTSerializable<number>
	| NBTValue[]
	| Uint32Array
	| bigint
	| number
	| string
	| { [KEY: string]: NBTValue };

interface NBTCompoud {
	[key: string]: NBTValue;
}
const DATA_MAPING = [Byte, Int16, Int32, Int64, Float, Double];
const DATA_BASES = [NumberWrapper, NumberWrapper, NumberWrapper, BigIntWrapper, NumberWrapper, NumberWrapper];
const DATA_MAP_TYPES = [NBTTag.Byte, NBTTag.Int16, NBTTag.Int32, NBTTag.Int64, NBTTag.Float, NBTTag.Double];
for (const [i, element] of DATA_MAPING.entries()) {
	// @ts-expect-error its readonly but must be initialized
	element.prototype = Object.setPrototypeOf(
		{
			[NBT_TYPE]: DATA_MAP_TYPES[i],
			constructor: element,
		},
		DATA_BASES[i].prototype,
	);
	element[Construct] = DATA_BASES[i];
}

declare global {
	interface String extends NBTSerializable<NBTTag.String> {}
	interface BigInt extends NBTSerializable<NBTTag.Int64> {}
	interface Number extends NBTSerializable<NBTTag.Byte | NBTTag.Double | NBTTag.Float | NBTTag.Int16 | NBTTag.Int32> {}
	interface Array<T> extends NBTSerializable<NBTTag.List> {}
	interface NumberConstructor {
		(n: any): Int16;
		new (n: any): Int16;
	}
	interface Object extends NBTSerializable<NBTTag.Compoud> {}
	interface Boolean extends NBTSerializable<NBTTag.Byte> {}
	interface Buffer extends NBTSerializable<NBTTag.ByteArray> {}
	interface BigInt64Array extends NBTSerializable<NBTTag.Int64Array> {}
	interface Int32Array extends NBTSerializable<NBTTag.Int32Array> {}
	interface BigUint64Array extends NBTSerializable<NBTTag.Int64Array> {}
	interface Uint32Array extends NBTSerializable<NBTTag.Int32Array> {}
}
const ES_MAPPINGS = [
	String,
	Object,
	Array,
	Number,
	BigInt,
	Boolean,
	Buffer,
	Int32Array,
	Uint32Array,
	BigInt64Array,
	BigUint64Array,
];
const ES_MAP_TYPES = [
	NBTTag.String,
	NBTTag.Compoud,
	NBTTag.List,
	NBTTag.Int16,
	NBTTag.Int64,
	NBTTag.Byte,
	NBTTag.ByteArray,
	NBTTag.Int32Array,
	NBTTag.Int32Array,
	NBTTag.Int64Array,
	NBTTag.Int64Array,
];
for (const [i, element] of ES_MAPPINGS.entries()) {
	element.prototype[NBT_TYPE] = ES_MAP_TYPES[i];
	element.prototype[NBT_SERIALIZER] = RawWriter;
}

function RawWriter(this: NBTSerializable, stream: any, ...params: any[]) {
	stream[this[NBT_TYPE] as 1]((this as any)[NBT_VALUE] ?? (this.valueOf() as any), ...params);
}

const ConversionTypes = {
	[NBTTag.Byte]: Byte,
	[NBTTag.Int16]: Int16,
	[NBTTag.Int32]: Int32,
	[NBTTag.Int64]: Int64,
	[NBTTag.Float]: Float,
	[NBTTag.Double]: Double,
	[NBTTag.String]: String,
};
abstract class DefinitionWriter {
	public abstract [NBTTag.Byte](value: number): void;
	public abstract [NBTTag.Int16](value: number): void;
	public abstract [NBTTag.Int32](value: number): void;
	public abstract [NBTTag.Float](value: number): void;
	public abstract [NBTTag.Double](value: number): void;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.Int64](value: bigint): void;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.Compoud](value: { [k: string]: NBTSerializable }): void;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.List](value: NBTSerializable[]): void;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.ByteArray](value: Buffer): void;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.Int32Array](value: Int32Array | Uint32Array): void;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.Int64Array](value: BigInt64Array | BigUint64Array): void;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.String](value: string): void;
	public abstract writeType(value: number): void;
}
abstract class DefinitionReader {
	public abstract [NBTTag.Byte](): Byte;
	public abstract [NBTTag.Int16](): Int16;
	public abstract [NBTTag.Int32](): Int32;
	public abstract [NBTTag.Float](): Float;
	public abstract [NBTTag.Double](): Double;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.Int64](): Int64;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.Compoud](): { [k: string]: NBTSerializable };
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.List](): NBTSerializable[];
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.ByteArray](): Buffer;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.Int32Array](): Int32Array;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.Int64Array](): BigInt64Array;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public abstract [NBTTag.String](): string;
	public abstract readType(): number;
}
export {
	type NBTSerializable,
	type NBTCompoud,
	type NBTValue,
	NBTTag,
	NBT_SERIALIZER,
	NBT_TYPE,
	NBT_VALUE,
	Byte,
	Int16,
	Int32,
	Int64,
	Float,
	Double,
	List,
	Int32 as Int,
	Int64 as Long,
	Int16 as Short,
	DefinitionReader,
	DefinitionWriter,
	ARRAY_TYPE,
};
