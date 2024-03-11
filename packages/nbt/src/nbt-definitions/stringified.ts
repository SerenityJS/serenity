/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-inner-declarations */
import {
	NBTTag,
	Byte,
	Int16,
	Int32,
	Int64,
	Float,
	Double,
	DefinitionReader,
	DefinitionWriter,
	NBT_SERIALIZER,
	NBT_TYPE
} from "../nbt";

import { NBT } from "./general";

import type { Buffer } from "node:buffer";
import type { NBTSerializable, NBTValue } from "../nbt";

class StringifiedNBTDefinitionWriter extends DefinitionWriter {
	public writeType(_value: number): void {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.Byte](value: number): void {
		this.text += value + "b";
	}

	public [NBTTag.Int16](value: number): void {
		this.text += value + "s";
	}

	public [NBTTag.Int32](value: number): void {
		this.text += value + "i";
	}

	public [NBTTag.Float](value: number): void {
		this.text += value + "f";
	}

	public [NBTTag.Double](value: number): void {
		this.text += value + "d";
	}

	public [NBTTag.Int64](value: bigint): void {
		this.text += value + "l";
	}

	public [NBTTag.Compoud](
		value: { [k: string]: NBTSerializable },
		spacing?: string,
		depth: number = 0
	): void {
		this.text += "{";
		let hasBefore = false;
		const baseSpace = spacing ? spacing.repeat((depth ?? 0) + 1) : "";
		for (const [key, v] of Object.entries(value)) {
			if (!v[NBT_TYPE]) continue;
			if (hasBefore) this.text += ",";
			if (spacing) this.text += "\n" + baseSpace;
			this.text += key + ":" + (spacing ? " " : "");
			v[NBT_SERIALIZER](this, spacing, (depth ?? 0) + 1);
			hasBefore = true;
		}

		if (hasBefore && spacing) this.text += "\n" + spacing.repeat(depth ?? 0);
		this.text += "}";
	}

	public [NBTTag.List](
		value: Array<NBTSerializable>,
		spacing?: string,
		depth: number = 0
	): void {
		this.text += "[";
		let hasBefore = false;
		const baseSpace = spacing ? spacing.repeat((depth ?? 0) + 1) : "";
		for (const v of value) {
			if (hasBefore) this.text += ",";
			if (spacing) this.text += "\n" + baseSpace;
			v[NBT_SERIALIZER](this, spacing, (depth ?? 0) + 1);
			hasBefore = true;
		}

		if (hasBefore && spacing) this.text += "\n" + spacing.repeat(depth ?? 0);
		this.text += "]";
	}

	public [NBTTag.ByteArray](value: Buffer): void {
		this.text += "<";
		let hasBefore = false;
		for (const v of value) {
			if (hasBefore) this.text += ",";
			this.text += v.toString(16);
			hasBefore = true;
		}

		this.text += ">";
	}

	// @ts-ignore
	public [NBTTag.Int32Array](_value: any): any {
		throw new Error("No implementation");
	}

	// @ts-ignore
	public [NBTTag.Int64Array](_value: any): any {
		throw new Error("No implementation");
	}

	public [NBTTag.String](value: string): void {
		this.text += JSON.stringify(value);
	}

	public text: string;
	public constructor() {
		super();
		this.text = "";
	}

	public Stringify(tag: NBTSerializable, spacing?: string) {
		const type = tag[NBT_TYPE];
		this.text = "";
		this[type as 10](tag as any, spacing);
		return this.text;
	}
}
class StringifiedNBTDefinitionReader extends DefinitionReader {
	public readType(): number {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.Byte](): Byte {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.Int16](): Int16 {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.Int32](): Int32 {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.Float](): Float {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.Double](): Double {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.Int32Array](): any {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.Int64Array](): any {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.Int64](): Int64 {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.Compoud](): { [k: string]: NBTSerializable } {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.List](): Array<NBTSerializable> {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.ByteArray](): Buffer {
		throw new Error("Method not implemented.");
	}

	public [NBTTag.String](): string {
		throw new Error("Method not implemented.");
	}

	public constructor() {
		super();
	}

	public Parse(text: string) {
		return SNBT.read(text);
	}
}

const NUMBER_PARSERS = {
	b: Number,
	s: Number,
	i: Number,
	l: BigInt,
	f: Number,
	d: Number
};
const NUMBER_NBT_CONTRUCTORS = {
	b: Byte,
	s: Int16,
	i: Int32,
	l: Int64,
	f: Float,
	d: Double
};
class Source extends String {
	public offset;
	public constructor(data: string, offset = 0) {
		super(data);
		this.offset = offset;
	}

	public read(count = 1) {
		return count <= 1
			? this[this.offset++]
			: this.slice(this.offset, (this.offset += count));
	}

	public peek(count = 1) {
		return count <= 1
			? this[this.offset]
			: this.slice(this.offset, this.offset + count);
	}

	public [Symbol.iterator]() {
		return {
			next: () => ({
				done: this.offset >= this.length,
				value: this[this.offset++]
			})
		} as IterableIterator<string>;
	}
}
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace SNBT {
	const kinds = {
		string: readString,
		compoud: readCompoud,
		array: readArray,
		number: readNumber
	};
	const numberChars = "0123456789";
	const numberKinds = "bsilfd";
	const whiteSpace = " \n\r\0\t";
	const specialCharacters = {
		n: "\n",
		r: "\r",
		"0": "\0",
		t: "\t"
	};
	function readSNBTType(source: Source) {
		readWhiteSpace(source);
		const mainChar = source.peek();
		switch (mainChar) {
			case '"': {
				return "string";
			}
			case "{": {
				return "compoud";
			}
			case "[": {
				return "array";
			}
			default: {
				// @ts-ignore
				return "0123456789-".includes(mainChar) ? "number" : mainChar;
			}
		}
	}

	function readString(source: Source) {
		const string = [];
		let prefixed = false;
		if (source.read() !== '"') throw new TypeError("Is not a string kind");
		for (const char of source) {
			if (char === "\\") {
				if (prefixed) string.push("\\");
				prefixed = !prefixed;
				continue;
			}

			if (prefixed) {
				if (char in specialCharacters)
					string.push(specialCharacters[char as "n"]);
				else throw new TypeError("Unknown special character");
				prefixed = false;
				continue;
			}

			if (char === '"') return string.join("");
			string.push(char);
		}

		throw new ReferenceError("Unexpected end of input");
	}

	function readSourceName(source: Source) {
		let string = "";
		// @ts-ignore
		while (/[\w-]+/g.test(source.peek())) string += source.read();
		return string;
	}

	function readNumber(source: Source) {
		let number = "";
		let isFloat = false;
		let isNegative = false;
		let firstIteration = false;
		let isEnd = false;
		let kind = "i";
		let hasExponen = false;
		for (let char of source) {
			if (!firstIteration && char === "-") {
				isNegative = true;
				number += char;
				firstIteration = true;
				// @ts-ignore
				if (readWhiteSpace(source)) char = source.peek();
				continue;
			}

			if (char === "." && !isFloat && !isEnd) {
				isFloat = true;
				number += char;
				continue;
			}

			if (numberChars.includes(char) && !isEnd) number += char;
			else if (char.toLowerCase() === "e" && !isEnd && !hasExponen) {
				hasExponen = true;
				// @ts-ignore
				char = source.read();
				if (char !== "+") throw new TypeError("InvalidExponent");
				number += "e+";
				isFloat = true;
				// @ts-ignore
				if (!numberChars.includes(source.peek()))
					throw new TypeError("InvalidExponent");
			} else if (numberKinds.includes(char.toLowerCase()) && !isEnd) {
				kind = char.toLowerCase();
				isEnd = true;
			} else {
				source.offset--;
				break;
			}

			firstIteration = true;
		}

		return new NUMBER_NBT_CONTRUCTORS[kind as "b"](
			NUMBER_PARSERS[kind as "b"](number)
		);
	}

	function readCompoud(source: Source) {
		const object = {} as any;
		let firsObject = true;
		if (source.read() !== "{") throw new TypeError("Is not a compoud kind");
		readWhiteSpace(source);
		for (let char of source) {
			if (char === "}") return object;
			else if (!firsObject && char !== ",") {
				throw new SyntaxError("Unexpected: " + char);
			}

			if (!firsObject && char === ",") {
				readWhiteSpace(source);
				// @ts-ignore
				char = source.read();
			}

			source.offset--;
			let key = "";
			key = char === '"' ? String(readString(source)) : readSourceName(source);
			// @ts-ignore
			char = source.read();
			// @ts-ignore
			if (readWhiteSpace(source, char)) char = source.peek();
			// @ts-ignore
			if (char !== ":") throw new TypeError("Unexpected: " + char);
			// @ts-ignore
			if (readWhiteSpace(source)) char = source.peek();
			const kind = readSNBTType(source);
			// @ts-ignore
			if (!(kind in kinds)) throw new TypeError("Unexpected kind: " + kind);
			const value = kinds[kind as "string"](source);
			object[key] = value;
			readWhiteSpace(source);
			firsObject = false;
		}

		throw new ReferenceError("Unexpected end of input");
	}

	function readArray(source: Source) {
		const object = [];
		let firsObject = true;
		let initialKind = null;
		if (source.read() !== "[") throw new TypeError("Is not a Array kind");
		readWhiteSpace(source);
		for (let char of source) {
			if (char === "]") return object;
			else if (!firsObject && char !== ",") {
				throw new SyntaxError("Unexpected: " + char);
			}

			if (!firsObject && char === ",") {
				readWhiteSpace(source);
				// @ts-ignore
				char = source.read();
			}

			source.offset--;
			const kind = readSNBTType(source);
			// @ts-ignore
			if (!(kind in kinds)) throw new TypeError("Unexpected kind: " + kind);
			const value = kinds[kind as "string"](source);
			// @ts-ignore
			if (!initialKind) initialKind = value[NBT_TYPE];
			// @ts-ignore
			else if (initialKind !== value[NBT_TYPE])
				throw new TypeError(
					"Array could have just one kind of elements, but multiple, expected: " +
						NBTTag[initialKind] +
						" but got: " +
						// @ts-ignore
						NBTTag[value[NBT_TYPE]]
				);
			object.push(value);
			readWhiteSpace(source);
			firsObject = false;
		}

		throw new ReferenceError("Unexpected end of input");
	}

	function readWhiteSpace(source: Source, char = source.peek()) {
		let ch = char;
		const index = 0;
		// @ts-ignore
		while (whiteSpace.includes(ch)) {
			source.offset++;
			ch = source.peek();
		}

		return index;
	}

	export function read(string: string) {
		const source = new Source(string);
		readWhiteSpace(source);
		const kind = readSNBTType(source);
		// @ts-ignore
		if (!(kind in kinds)) throw new SyntaxError("Unexpected: " + source.read());
		return kinds[kind as "string"](source) as NBTValue;
	}
}
class StringifiedNBT extends NBT {
	public static Stringify(tag: NBTSerializable, spacing?: string) {
		return new StringifiedNBTDefinitionWriter().Stringify(tag, spacing);
	}

	public static Parse(text: string) {
		return new StringifiedNBTDefinitionReader().Parse(text);
	}
}
export {
	StringifiedNBT,
	StringifiedNBTDefinitionReader,
	StringifiedNBTDefinitionWriter
};
