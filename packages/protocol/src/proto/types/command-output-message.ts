import { BinaryStream, DataType } from "@serenityjs/binarystream";

class CommandOutputMessage extends DataType {
  public isInternal: boolean;
  public messageId: string;
  public parameters: Array<string>;

  public constructor(
    isInternal: boolean,
    messageId: string,
    parameters: Array<string>
  ) {
    super();
    this.isInternal = isInternal;
    this.messageId = messageId;
    this.parameters = parameters;
  }

  public static read(stream: BinaryStream): CommandOutputMessage {
    const isInternal = stream.readBool();
    const messageId = stream.readVarString();

    const parameters = [];

    const amount = stream.readVarInt();
    for (let index = 0; index < amount; index++) {
      parameters.push(stream.readVarString());
    }

    return new CommandOutputMessage(isInternal, messageId, parameters);
  }

  public static write(stream: BinaryStream, value: CommandOutputMessage): void {
    stream.writeBool(value.isInternal);
    stream.writeVarString(value.messageId);

    stream.writeVarInt(value.parameters.length);
    for (const parameter of value.parameters) {
      stream.writeVarString(parameter);
    }
  }
}

export { CommandOutputMessage };
