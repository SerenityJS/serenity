import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class AttributeModifier extends DataType {
  /**
   * The id of the modifier.
   */
  public readonly id: string;

  /**
   * The name of the modifier.
   */
  public readonly name: string;

  /**
   * The amount of the modifier.
   */
  public readonly amount: number;

  /**
   * The operation of the modifier.
   */
  public readonly operation: number;

  /**
   * The operand of the modifier.
   */
  public readonly operand: number;

  /**
   * If the modifier is serializable.
   */
  public readonly serializable: boolean;

  /**
   * Creates a new attribute modifier.
   *
   * @param id The id of the modifier.
   * @param name The name of the modifier.
   * @param amount The amount of the modifier.
   * @param operation The operation of the modifier.
   * @param operand The operand of the modifier.
   * @param serializable If the modifier is serializable.
   * @returns A new attribute modifier.
   */
  public constructor(
    id: string,
    name: string,
    amount: number,
    operation: number,
    operand: number,
    serializable: boolean
  ) {
    super();

    this.id = id;
    this.name = name;
    this.amount = amount;
    this.operation = operation;
    this.operand = operand;
    this.serializable = serializable;
  }

  public static override read(stream: BinaryStream): AttributeModifier {
    // Read the individual fields.
    const id = stream.readVarString();
    const name = stream.readVarString();
    const amount = stream.readInt32(Endianness.Little);
    const operation = stream.readInt32(Endianness.Little);
    const operand = stream.readFloat32(Endianness.Little);
    const serializable = stream.readBool();

    // Return the new attribute modifier.
    return new this(id, name, amount, operation, operand, serializable);
  }

  public static override write(
    stream: BinaryStream,
    value: AttributeModifier
  ): void {
    // Write the individual fields.
    stream.writeVarString(value.id);
    stream.writeVarString(value.name);
    stream.writeInt32(value.amount, Endianness.Little);
    stream.writeInt32(value.operation, Endianness.Little);
    stream.writeFloat32(value.operand, Endianness.Little);
    stream.writeBool(value.serializable);
  }
}

export { AttributeModifier };
