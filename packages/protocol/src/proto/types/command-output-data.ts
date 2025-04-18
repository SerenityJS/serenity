import { DataType } from "@serenityjs/raknet";

import { CommandOriginData } from "./command-origin-data";
import { CommandOutputMessage } from "./command-output-message";

import type { BinaryStream } from "@serenityjs/binarystream";

enum CommandOutputType {
  TYPE_LAST,
  TYPE_SILENT,
  TYPE_ALL,
  TYPE_DATA_SET
}

class CommandOutputData extends DataType {
  public originData: CommandOriginData;
  public outputType: CommandOutputType;
  public successCount: number;
  public messages: Array<CommandOutputMessage>;
  public data: string;

  public constructor(
    originData: CommandOriginData,
    outputType: CommandOutputType,
    successCount: number,
    messages: Array<CommandOutputMessage>,
    data: string
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
    for (let index = 0; index < amount; index++) {
      messages.push(CommandOutputMessage.read(stream));
    }

    let data = "";
    if (outputType === CommandOutputType.TYPE_DATA_SET) {
      data = stream.readVarString();
    }

    return new CommandOutputData(
      originData,
      outputType,
      successCount,
      messages,
      data
    );
  }

  public static override write(
    stream: BinaryStream,
    value: CommandOutputData
  ): void {
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
