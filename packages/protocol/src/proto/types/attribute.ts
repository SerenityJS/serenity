import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { AttributeModifier } from "./attribute-modifier";

import type { BinaryStream } from "@serenityjs/binarystream";
import type { AttributeName } from "../../enums";

class Attribute extends DataType {
  /**
   * The minimum value of the attribute.
   */
  public min: number;

  /**
   * The maximum value of the attribute
   */
  public max: number;

  /**
   * The current value of the attribute.
   */
  public current: number;

  /**
   * The default minimum value of the attribute.
   */
  public defaultMin: number;

  /**
   * The default maximum value of the attribute.
   */
  public defaultMax: number;

  /**
   * The default value of the attribute.
   */
  public default: number;

  /**
   * The name of the attribute.
   */
  public name: AttributeName;

  /**
   * The modifiers of the attribute.
   */
  public modifiers: Array<AttributeModifier>;

  /**
   * Creates a new instance of Attribute.
   * @param min - The minimum value of the attribute.
   * @param max - The maximum value of the attribute.
   * @param current - The current value of the attribute.
   * @param defaultMin - The default maximum value of the attribute.
   * @param defaultMax - The default minimum value of the attribute.
   * @param default - The default value of the attribute.
   * @param name - The name of the attribute.
   * @param modifiers - The modifiers of the attribute.
   */
  public constructor(
    min: number,
    max: number,
    current: number,
    defaultMin: number,
    defaultMax: number,
    default_: number,
    name: AttributeName,
    modifiers: Array<AttributeModifier>
  ) {
    super();
    this.min = min;
    this.max = max;
    this.current = current;
    this.defaultMin = defaultMin;
    this.defaultMax = defaultMax;
    this.default = default_;
    this.name = name;
    this.modifiers = modifiers;
  }

  public static read(stream: BinaryStream): Array<Attribute> {
    // Prepare an array to store the attributes.
    const attributes: Array<Attribute> = [];

    // Read the number of attributes.
    const amount = stream.readVarInt();

    // We then loop through the amount of layers.
    // Reading the individual fields in the stream.
    for (let index = 0; index < amount; index++) {
      // Read all the fields for the layer.
      const min = stream.readFloat32(Endianness.Little);
      const max = stream.readFloat32(Endianness.Little);
      const current = stream.readFloat32(Endianness.Little);
      const defaultMin = stream.readFloat32(Endianness.Little);
      const defaultMax = stream.readFloat32(Endianness.Little);
      const default_ = stream.readFloat32(Endianness.Little);
      const name = stream.readVarString() as AttributeName;

      // Prepare an array to store the modifiers.
      const modifiers: Array<AttributeModifier> = [];

      // Read the number of modifiers.
      const modifierAmount = stream.readVarInt();

      // We then loop through the amount of modifiers.
      // Reading the individual fields in the stream.
      for (let index = 0; index < modifierAmount; index++) {
        modifiers.push(AttributeModifier.read(stream));
      }

      // Push the attribute to the array.
      attributes.push(
        new this(
          min,
          max,
          current,
          defaultMax,
          defaultMin,
          default_,
          name,
          modifiers
        )
      );
    }

    // Return the attributes.
    return attributes;
  }

  public static write(stream: BinaryStream, value: Array<Attribute>): void {
    // Write the amount of attributes.
    stream.writeVarInt(value.length);

    // Loop through the attributes.
    for (const attribute of value) {
      // Write the individual fields.
      stream.writeFloat32(attribute.min, Endianness.Little);
      stream.writeFloat32(attribute.max, Endianness.Little);
      stream.writeFloat32(attribute.current, Endianness.Little);
      stream.writeFloat32(attribute.defaultMin, Endianness.Little);
      stream.writeFloat32(attribute.defaultMax, Endianness.Little);
      stream.writeFloat32(attribute.default, Endianness.Little);
      stream.writeVarString(attribute.name);

      // Write the amount of modifiers.
      stream.writeVarInt(attribute.modifiers.length);

      // Loop through the modifiers.
      for (const modifier of attribute.modifiers) {
        AttributeModifier.write(stream, modifier);
      }
    }
  }

  /**
   * Creates a new instance of Attribute.
   * @param name The name of the attribute.
   * @param minimumValue The minimum value of the attribute.
   * @param maximumValue The maximum value of the attribute.
   * @param current The current value of the attribute.
   * @param defaultValue The default value of the attribute.
   * @returns A new instance of Attribute.
   */
  public static create(
    name: AttributeName,
    minimumValue: number,
    maximumValue: number,
    current?: number,
    defaultValue?: number
  ): Attribute {
    return new Attribute(
      minimumValue,
      maximumValue,
      current ?? maximumValue,
      minimumValue,
      maximumValue,
      defaultValue ?? maximumValue,
      name,
      []
    );
  }
}

export { Attribute };
