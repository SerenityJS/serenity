import { DataType } from "@serenityjs/raknet";

import type { BinaryStream, Endianness } from "@serenityjs/binarystream";

class DisconnectMessage extends DataType {
	/**
	 * The message of the disconnect message.
	 */
	public message: string | null;

	/**
	 * The filtered message of the disconnect message.
	 */
	public filtered: string | null;

	/**
	 * Creates a new instance of DisconnectMessage.
	 * @param message - The message of the disconnect message.
	 * @param filtered - The filtered message of the disconnect message.
	 */
	public constructor(message?: string | null, filtered?: string | null) {
		super();
		this.message = message ?? null;
		this.filtered = filtered ?? null;
	}

	public static read(
		stream: BinaryStream,
		_: Endianness,
		hideDisconnectScreen: boolean
	): DisconnectMessage {
		// Check if the disconnect screen should be hidden.
		if (hideDisconnectScreen) return new DisconnectMessage();

		// Read the message.
		const message = stream.readVarString();

		// Read the filtered message.
		const filtered = stream.readVarString();

		// Return the disconnect message.
		return new this(message, filtered);
	}

	public static write(
		stream: BinaryStream,
		value: DisconnectMessage,
		_: Endianness,
		hideDisconnectScreen: boolean
	): void {
		// Check if the disconnect screen should be hidden.
		if (hideDisconnectScreen) return;

		// Write the message.
		stream.writeVarString(value.message ?? "Disconnected from server.");

		// Write the filtered message.
		stream.writeVarString(value.filtered ?? "Disconnected from server.");
	}
}

export { DisconnectMessage };
