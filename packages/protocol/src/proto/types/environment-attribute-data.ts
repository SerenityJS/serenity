import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { AttributeEasingType } from "../../enums";

import { AttributeData } from "./attribute-data";

class EnvironmentAttributeData extends DataType {
  public attributeName: string;
  public fromAttribute: AttributeData | null;
  public attribute: AttributeData;
  public toAttribute: AttributeData | null;
  public currentTransitionTicks: number;
  public totalTransitionTicks: number;
  public easeType: AttributeEasingType | string;
  public localTransitionTicks: number;
  public noiseTransition: boolean;

  public constructor(
    attributeName: string,
    attribute: AttributeData,
    fromAttribute: AttributeData | null = null,
    toAttribute: AttributeData | null = null,
    currentTransitionTicks = 0,
    totalTransitionTicks = 0,
    easeType: AttributeEasingType | string = AttributeEasingType.Linear,
    localTransitionTicks = 0,
    noiseTransition = false
  ) {
    super();
    this.attributeName = attributeName;
    this.fromAttribute = fromAttribute;
    this.attribute = attribute;
    this.toAttribute = toAttribute;
    this.currentTransitionTicks = currentTransitionTicks;
    this.totalTransitionTicks = totalTransitionTicks;
    this.easeType = easeType;
    this.localTransitionTicks = localTransitionTicks;
    this.noiseTransition = noiseTransition;
  }

  public static read(stream: BinaryStream): EnvironmentAttributeData {
    const attributeName = stream.readVarString();
    const fromAttribute = stream.readBool() ? AttributeData.read(stream) : null;
    const attribute = AttributeData.read(stream);
    const toAttribute = stream.readBool() ? AttributeData.read(stream) : null;
    const currentTransitionTicks = stream.readUint32(Endianness.Little);
    const totalTransitionTicks = stream.readUint32(Endianness.Little);
    const easeType = stream.readVarString() as AttributeEasingType;
    const localTransitionTicks = stream.readUint32(Endianness.Little);
    const noiseTransition = stream.readBool();

    return new this(
      attributeName,
      attribute,
      fromAttribute,
      toAttribute,
      currentTransitionTicks,
      totalTransitionTicks,
      easeType,
      localTransitionTicks,
      noiseTransition
    );
  }

  public static write(
    stream: BinaryStream,
    value: EnvironmentAttributeData
  ): void {
    stream.writeVarString(value.attributeName);
    stream.writeBool(value.fromAttribute !== null);
    if (value.fromAttribute !== null) {
      AttributeData.write(stream, value.fromAttribute);
    }

    AttributeData.write(stream, value.attribute);
    stream.writeBool(value.toAttribute !== null);
    if (value.toAttribute !== null) {
      AttributeData.write(stream, value.toAttribute);
    }

    stream.writeUint32(value.currentTransitionTicks, Endianness.Little);
    stream.writeUint32(value.totalTransitionTicks, Endianness.Little);
    stream.writeVarString(value.easeType);
    stream.writeUint32(value.localTransitionTicks, Endianness.Little);
    stream.writeBool(value.noiseTransition);
  }
}

export { EnvironmentAttributeData };
