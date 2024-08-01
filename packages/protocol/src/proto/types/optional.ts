import { unsubscribe } from "node:diagnostics_channel";

import { DataType, type ValidTypes } from "@serenityjs/raknet";
import {
	Bool,
	Float32,
	Float64,
	Uint32,
	Uint64,
	VarString,
	ZigZag,
	ZigZong,
	type BinaryStream,
	type Endianness
} from "@serenityjs/binarystream";

class Optional extends DataType {
	public static override read<T extends typeof DataType>(
		stream: BinaryStream,
		endian?: Endianness,
		parameter?: unknown,
		type?: T | ValidTypes
	): unknown | undefined {
		const hasValue = stream.readBool();
		const isDataValue = <T extends typeof DataType>(
			value: T | ValidTypes
		): value is T => {
			return (value as unknown) instanceof (value as T);
		};

		if (!hasValue) return;
		let value;
		const valueType = type;

		// ? If there is value write to the stream
		if (valueType) {
			if (isDataValue(valueType)) {
				// ? Use the static write method of a DataType
				value = valueType.read(stream, endian, parameter);
				return;
			}
			// ? Use the static write method of a Valid Stream Type
			value = valueType.read(
				stream,
				endian as undefined,
				parameter as undefined
			);
		}
		return value;
	}

	public static override write<T extends typeof DataType>(
		stream: BinaryStream,
		value: unknown,
		endian?: Endianness,
		parameter?: unknown,
		type?: T | ValidTypes
	): void {
		const hasValue = value !== null && value !== undefined;
		// ? Type Fix
		const isDataValue = <T extends typeof DataType>(
			value: T | ValidTypes
		): value is T => {
			return (value as unknown) instanceof (value as T);
		};
		// ? write if the value exists
		stream.writeBool(hasValue);

		if (!hasValue) return;

		// ? Get the value data type if not provided
		const valueType = type ?? Optional.getType(value);

		// ? If there is value write to the stream
		if (valueType) {
			if (isDataValue(valueType)) {
				// ? Use the static write method of a DataType
				valueType.write(stream, value, endian, parameter);
				return;
			}
			// ? Use the static write method of a Valid Stream Type
			valueType.write(stream, value as never, endian as undefined);
		}
	}

	// ? For primitive data types
	public static getType(value: unknown): ValidTypes | undefined {
		switch (typeof value) {
			case "string": {
				return VarString;
			}
			case "number": {
				if (value % 1 != 0) return Float32;
				if (value < 0) return ZigZag;
				return Uint32;
			}
			case "bigint": {
				if (value % 1n != 0n) return Float64;
				if (value < 0n) return ZigZong;
				return Uint64;
			}
			case "boolean": {
				return Bool;
			}
		}
	}
}

export { Optional };
