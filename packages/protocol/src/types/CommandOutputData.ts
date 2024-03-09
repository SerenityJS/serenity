import type { BinaryStream } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';
import { CommandOriginData } from './CommandOriginData.js';
import { CommandOutputMessage } from './CommandOutputMessage.js';

enum CommandOutputType {
	TYPE_LAST,
	TYPE_SILENT,
	TYPE_ALL,
	TYPE_DATA_SET,
}

class CommandOutputData extends DataType {
	public originData: CommandOriginData;
	public outputType: CommandOutputType;
	public successCount: number;
	public messages: CommandOutputMessage[];
	public data: string;

	public constructor(
		originData: CommandOriginData,
		outputType: CommandOutputType,
		successCount: number,
		messages: CommandOutputMessage[],
		data: string,
	) {
		super();
		this.originData = originData;
		this.outputType = outputType;
		this.successCount = successCount;
		this.messages = messages;
		this.data = data;
	}

	public static override read(stream: BinaryStream): CommandOutputData {
		const originData = CommandOriginData.read(stream);
		const outputType = stream.readByte();
		const successCount = stream.readVarInt();

		const amount = stream.readVarInt();

		const messages = [];
		for (let i = 0; i < amount; i++) {
			messages.push(CommandOutputMessage.read(stream));
		}

		let data = '';
		if (outputType === CommandOutputType.TYPE_DATA_SET) {
			data = stream.readVarString();
		}

    return new CommandOutputData(originData, outputType, successCount, messages, data);
	}

	public static override write(stream: BinaryStream, value: CommandOutputData): void {
		CommandOriginData.write(stream, value.originData);

		stream.writeByte(value.outputType);
		stream.writeVarInt(value.successCount);

		stream.writeVarInt(value.messages.length);
		for (const parameter of value.messages) {
			CommandOutputMessage.write(stream, parameter);
		}
	}
}

export { CommandOutputData };
