import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { Bitflags, Reliability } from "../../enums";

import { DataType } from "./type";

/**
 * Represents a frame data type.
 * Frame is used when sending data in RakNet.
 */
class Frame extends DataType {
	/**
	 * The reliability of the frame.
	 */
	public reliability!: Reliability;

	/**
	 * The reliable index of the frame.
	 */
	public reliableIndex!: number;

	/**
	 * The sequence index of the frame.
	 */
	public sequenceIndex!: number;

	/**
	 * The order index of the frame.
	 */
	public orderIndex!: number;

	/**
	 * The order channel of the frame.
	 */
	public orderChannel!: number;

	/**
	 * The split size of the frame.
	 */
	public splitSize!: number;

	/**
	 * The split id of the frame.
	 */
	public splitId!: number;

	/**
	 * The split index of the frame.
	 */
	public splitIndex!: number;

	/**
	 * The payload of the frame.
	 */
	public payload!: Buffer;

	/**
	 * Checks if the frame is split.
	 * @returns True if the frame is split; otherwise, false.
	 */
	public isSplit(): boolean {
		return this.splitSize > 0;
	}

	/**
	 * Checks if the frame is reliable.
	 * @returns True if the frame is reliable; otherwise, false.
	 */
	public isReliable(): boolean {
		const values = [
			Reliability.Reliable,
			Reliability.ReliableOrdered,
			Reliability.ReliableSequenced,
			Reliability.ReliableWithAckReceipt,
			Reliability.ReliableOrderedWithAckReceipt
		];

		return values.includes(this.reliability);
	}

	/**
	 * Checks if the frame is sequenced.
	 * @returns True if the frame is sequenced; otherwise, false.
	 */
	public isSequenced(): boolean {
		const values = [
			Reliability.ReliableSequenced,
			Reliability.UnreliableSequenced
		];

		return values.includes(this.reliability);
	}

	/**
	 * Checks if the frame is ordered.
	 * @returns True if the frame is ordered; otherwise, false.
	 */
	public isOrdered(): boolean {
		const values = [
			Reliability.UnreliableSequenced,
			Reliability.ReliableOrdered,
			Reliability.ReliableSequenced,
			Reliability.ReliableOrderedWithAckReceipt
		];

		return values.includes(this.reliability);
	}

	/**
	 * Checks if the frame is order exclusive.
	 * @returns True if the frame is order exclusive; otherwise, false.
	 */
	public isOrderExclusive(): boolean {
		const values = [
			Reliability.ReliableOrdered,
			Reliability.ReliableOrderedWithAckReceipt
		];

		return values.includes(this.reliability);
	}

	/**
	 * Gets the byte length of the frame.
	 * @returns The byte length of the frame.
	 */
	public getByteLength(): number {
		return (
			3 +
			this.payload.byteLength +
			(this.isReliable() ? 3 : 0) +
			(this.isSequenced() ? 3 : 0) +
			(this.isOrdered() ? 4 : 0) +
			(this.isSplit() ? 10 : 0)
		);
	}

	/**
	 * Reads the Frame data type from a binary stream.
	 * @param stream The binary stream to read from.
	 * @returns The Frame data type.
	 */
	public static read(stream: BinaryStream): Array<Frame> {
		// Prepare an array to store the frames.
		const frames: Array<Frame> = [];

		// Loop through the stream until the end.
		do {
			// Create a new frame.
			const frame = new Frame();

			// Read the header and mask the reliability.
			const header = stream.readUint8();
			frame.reliability = (header & 0xe0) >> 5;

			// Check if the frame is split.
			const split = (header & Bitflags.Split) !== 0;

			// Read and calculate the length of the body.
			const length = Math.ceil(stream.readUint16() / 8);

			// Check if the frame is reliable.
			// If so, read the reliable index.
			if (frame.isReliable()) {
				frame.reliableIndex = stream.readUint24(Endianness.Little);
			}

			// Check if the frame is sequenced.
			// If so, read the sequence index.
			if (frame.isSequenced()) {
				frame.sequenceIndex = stream.readUint24(Endianness.Little);
			}

			// Check if the frame is ordered.
			// If so, read the order index and channel.
			if (frame.isOrdered()) {
				frame.orderIndex = stream.readUint24(Endianness.Little);
				frame.orderChannel = stream.readUint8();
			}

			// Check if the frame is split.
			// If so, read the fragment size, id and index.
			if (split) {
				frame.splitSize = stream.readUint32();
				frame.splitId = stream.readUint16();
				frame.splitIndex = stream.readUint32();
			}

			// Read the payload.
			frame.payload = stream.readBuffer(length);

			// Add the frame to the array.
			frames.push(frame);
		} while (!stream.cursorAtEnd());

		// Return the frames.
		return frames;
	}

	/**
	 * Writes the Frame data type to a binary stream.
	 * @param stream The binary stream to write to.
	 */
	public static write(stream: BinaryStream, value: Array<Frame>): void {
		// Loop through the frames.
		// Writing each frame to the stream.
		for (const frame of value) {
			// Write the header with the reliability and split flag.
			stream.writeUint8(
				(frame.reliability << 5) | (frame.isSplit() ? Bitflags.Split : 0)
			);

			// Write the length of the payload.
			stream.writeUint16(frame.payload.byteLength << 3);

			// Check if the frame is reliable.
			// If so, write the reliable index.
			if (frame.isReliable()) {
				stream.writeUint24(frame.reliableIndex as number, Endianness.Little);
			}

			// Check if the frame is sequenced.
			// If so, write the sequence index.
			if (frame.isSequenced()) {
				stream.writeUint24(frame.sequenceIndex as number, Endianness.Little);
			}

			// Check if the frame is ordered.
			// If so, write the order index and channel.
			if (frame.isOrdered()) {
				stream.writeUint24(frame.orderIndex as number, Endianness.Little);
				stream.writeUint8(frame.orderChannel);
			}

			// Check if the frame is split.
			// If so, write the fragment size, id and index.
			if (frame.isSplit()) {
				stream.writeUint32(frame.splitSize);
				stream.writeUint16(frame.splitId);
				stream.writeUint32(frame.splitIndex);
			}

			// Write the payload.
			stream.writeBuffer(frame.payload);
		}
	}
}

export { Frame };
