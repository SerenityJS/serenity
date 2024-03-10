import { BinaryStream, Endianness } from "@serenityjs/binaryutils";

/**
 * Represents a data type.
 */
abstract class DataType {
	/**
	 * Creates a new data type.
	 */
	public constructor(..._arguments_: Array<unknown>) {
		return;
	}

	/**
	 * Reads the data type from a binary stream.
	 * @param _stream The binary stream to read from.
	 * @param _endian The endianness to use.
	 * @param _parameter An optional parameter.
	 * @returns The data type.
	 */
	public static read(
		_stream: BinaryStream,
		_endian = Endianness.Big,
		_parameter?: unknown
	): unknown {
		return;
	}

	/**
	 * Writes the data type to a binary stream.
	 * @param _stream The binary stream to write to.
	 * @param _value The data type to write.
	 * @param _endian The endianness to use.
	 * @param _parameter An optional parameter.
	 */
	public static write(
		_stream: BinaryStream,
		_value: unknown,
		_endian = Endianness.Big,
		_parameter?: unknown
	): void {
		return;
	}
}

export { DataType };
