import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { AttributeDataType } from "../../enums";

class AttributeData extends DataType {
  public type: AttributeDataType;
  public boolValue: boolean;
  public boolOperation: number | null;
  public floatValue: number;
  public floatOperation: number | null;
  public floatConstraintMin: number | null;
  public floatConstraintMax: number | null;
  public colorValue: number;
  public colorOperation: number | null;

  public constructor(
    type: AttributeDataType,
    boolValue = false,
    boolOperation: number | null = null,
    floatValue = 0,
    floatOperation: number | null = null,
    floatConstraintMin: number | null = null,
    floatConstraintMax: number | null = null,
    colorValue = 0,
    colorOperation: number | null = null
  ) {
    super();
    this.type = type;
    this.boolValue = boolValue;
    this.boolOperation = boolOperation;
    this.floatValue = floatValue;
    this.floatOperation = floatOperation;
    this.floatConstraintMin = floatConstraintMin;
    this.floatConstraintMax = floatConstraintMax;
    this.colorValue = colorValue;
    this.colorOperation = colorOperation;
  }

  public static read(stream: BinaryStream): AttributeData {
    const type = stream.readVarInt() as AttributeDataType;
    const value = new this(type);

    switch (type) {
      case AttributeDataType.Bool: {
        value.boolValue = stream.readBool();
        value.boolOperation = stream.readBool()
          ? stream.readInt32(Endianness.Little)
          : null;
        break;
      }
      case AttributeDataType.Float: {
        value.floatValue = stream.readFloat32(Endianness.Little);
        value.floatOperation = stream.readBool()
          ? stream.readInt32(Endianness.Little)
          : null;
        value.floatConstraintMin = stream.readBool()
          ? stream.readFloat32(Endianness.Little)
          : null;
        value.floatConstraintMax = stream.readBool()
          ? stream.readFloat32(Endianness.Little)
          : null;
        break;
      }
      case AttributeDataType.Color: {
        value.colorValue = stream.readInt32(Endianness.Little);
        value.colorOperation = stream.readBool()
          ? stream.readInt32(Endianness.Little)
          : null;
        break;
      }
      default: {
        throw new Error(`Unknown attribute data type: ${type}`);
      }
    }

    return value;
  }

  public static write(stream: BinaryStream, value: AttributeData): void {
    stream.writeVarInt(value.type);

    switch (value.type) {
      case AttributeDataType.Bool: {
        stream.writeBool(value.boolValue);
        stream.writeBool(value.boolOperation !== null);
        if (value.boolOperation !== null) {
          stream.writeInt32(value.boolOperation, Endianness.Little);
        }
        break;
      }
      case AttributeDataType.Float: {
        stream.writeFloat32(value.floatValue, Endianness.Little);
        stream.writeBool(value.floatOperation !== null);
        if (value.floatOperation !== null) {
          stream.writeInt32(value.floatOperation, Endianness.Little);
        }

        stream.writeBool(value.floatConstraintMin !== null);
        if (value.floatConstraintMin !== null) {
          stream.writeFloat32(value.floatConstraintMin, Endianness.Little);
        }

        stream.writeBool(value.floatConstraintMax !== null);
        if (value.floatConstraintMax !== null) {
          stream.writeFloat32(value.floatConstraintMax, Endianness.Little);
        }
        break;
      }
      case AttributeDataType.Color: {
        stream.writeInt32(value.colorValue, Endianness.Little);
        stream.writeBool(value.colorOperation !== null);
        if (value.colorOperation !== null) {
          stream.writeInt32(value.colorOperation, Endianness.Little);
        }
        break;
      }
      default: {
        throw new Error(`Unknown attribute data type: ${value.type}`);
      }
    }
  }
}

export { AttributeData };
