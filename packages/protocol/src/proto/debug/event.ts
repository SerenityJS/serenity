import { DataPacket } from "../data";

class DebugEventPacket extends DataPacket {
	/**
	 * The even data for the debug event
	 */
	public data!: Record<string, unknown>;

	public serialize(): Buffer {
		// Create the json object
		const object = { type: "event", event: this.data };

		// Format the json object to be sent
		const buffer = Buffer.from(JSON.stringify(object));

		// Caluclate the length of the buffer
		const bufferLength =
			(buffer.length + 1).toString(16).padStart(8, "0") + "\n";

		// Write the buffer length
		this.writeBuffer(Buffer.from(bufferLength));

		// Write the buffer
		this.writeBuffer(buffer);

		// Append a newline
		this.writeBuffer(Buffer.from("\n"));

		// Return the buffer
		return this.getBuffer();
	}

	public deserialize(): this {
		// Read the buffer length
		const bufferLength = this.readBuffer(8).toString("utf8");

		// Read the buffer
		const buffer = this.readBuffer(Number.parseInt(bufferLength, 16));

		// Parse the buffer
		this.data = JSON.parse(buffer.toString());

		// Return the packet
		return this;
	}
}

export { DebugEventPacket };
