import type { BinaryStream } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

class CommandOutputMessage extends DataType {
	public isInternal: boolean;
	public messageId: string;
	public parameters: string[];

	public constructor(isInternal: boolean, messageId: string, parameters: string[]) {
		super();
		this.isInternal = isInternal;
		this.messageId = messageId;
		this.parameters = parameters;
	}

	public static override read(stream: BinaryStream): CommandOutputMessage {
		const isInternal = stream.readBool();
		const messageId = stream.readVarString();

		const parameters = [];

		const amount = stream.readVarInt();
		for (let i = 0; i < amount; i++) {
			parameters.push(stream.readVarString());
		}

		return new CommandOutputMessage(isInternal, messageId, parameters);
	}

	public static override write(stream: BinaryStream, value: CommandOutputMessage): void {
		stream.writeBool(value.isInternal);
		stream.writeVarString(value.messageId);

		stream.writeVarInt(value.parameters.length);
		for (const parameter of value.parameters) {
			stream.writeVarString(parameter);
		}
	}
}

export { CommandOutputMessage };
