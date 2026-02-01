import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { TextType, TextVariantType } from "../../enums";

class TextVariant extends DataType {
  /**
   * The message of the text variant.
   */
  public message: string;

  /**
   * The type of the text variant.
   */
  public type: TextType;

  /**
   * The source of the text variant.
   * If packet `variant` is `TextVariantType.AuthorAndMessage` otherwise null.
   */
  public source: string | null = null;

  /**
   * The parameters of the text variant.
   * If packet `variant` is `TextVariantType.MessageAndParams` otherwise null.
   */
  public parameters: Array<string> | null = null;

  public constructor(
    message: string,
    type: TextType,
    source: string | null = null,
    parameters: Array<string> | null = null
  ) {
    super();
    this.message = message;
    this.type = type;
    this.source = source;
    this.parameters = parameters;
  }

  public static read(
    stream: BinaryStream,
    options: PacketDataTypeOptions<TextVariantType>
  ): TextVariant {
    // Switch the variant type
    switch (options.parameter) {
      case TextVariantType.MessageOnly: {
        // Read the variant type
        const type = stream.readUint8();

        // Read the message
        const message = stream.readVarString();

        // Return the text variant
        return new this(message, type);
      }

      case TextVariantType.AuthorAndMessage: {
        // Read the variant type
        const type = stream.readUint8();

        // Read the source
        const source = stream.readVarString();

        // Read the message
        const message = stream.readVarString();

        // Return the text variant
        return new this(message, type, source);
      }

      case TextVariantType.MessageAndParams: {
        // Read the variant type
        const type = stream.readUint8();

        // Read the message
        const message = stream.readVarString();

        // Read the parameters
        const parameters: Array<string> = [];
        for (let i = 0; i < stream.readVarInt(); i++) {
          parameters.push(stream.readVarString());
        }

        // Return the text variant
        return new this(message, type, null, parameters);
      }

      default:
        throw new Error(`Unsupported TextVariantType: ${options.parameter}`);
    }
  }

  public static write(
    stream: BinaryStream,
    value: TextVariant,
    options: PacketDataTypeOptions<TextVariantType>
  ): void {
    // Switch the variant type
    switch (options.parameter) {
      case TextVariantType.MessageOnly: {
        // Write the variant type
        stream.writeUint8(value.type);

        // Write the message
        stream.writeVarString(value.message);

        break;
      }

      case TextVariantType.AuthorAndMessage: {
        // Write the variant type
        stream.writeUint8(value.type);

        // Write the source
        stream.writeVarString(value.source ?? "");

        // Write the message
        stream.writeVarString(value.message);

        break;
      }

      case TextVariantType.MessageAndParams: {
        // Write the variant type
        stream.writeUint8(value.type);

        // Write the message
        stream.writeVarString(value.message);

        // Write the parameters
        if (value.parameters) {
          // Write the number of parameters
          stream.writeVarInt(value.parameters.length);

          // Iterate and write each parameter
          for (const param of value.parameters) stream.writeVarString(param);
        }
        // If no parameters, write zero
        else stream.writeVarInt(0);

        break;
      }
    }
  }
}

export { TextVariant };
