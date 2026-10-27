import { BinaryStream, DataType } from "@serenityjs/binarystream";

import {
  EasingType,
  EnvironmentAttributePayloadType,
  NoiseAlignmentType
} from "../../enums";

import { AttributeData } from "./attribute-data";

/**
 * Represents an environment attribute of an attribute layer.
 * Since v2225, the attribute carries a payload variant that is either a constant,
 * a transition, or a noise transition between two attribute values.
 */
class EnvironmentAttributeData extends DataType {
  /**
   * The name of the environment attribute.
   */
  public attributeName: string;

  /**
   * The type of the payload of the environment attribute.
   */
  public payloadType: EnvironmentAttributePayloadType;

  /**
   * The value of the attribute.
   * Only used if the payload type is `EnvironmentAttributePayloadType.Constant`.
   */
  public attribute: AttributeData | null;

  /**
   * The value the attribute transitions from.
   * Only used if the payload type is a transition or a noise transition.
   */
  public fromAttribute: AttributeData | null;

  /**
   * The value the attribute transitions to.
   * Only used if the payload type is a transition or a noise transition.
   */
  public toAttribute: AttributeData | null;

  /**
   * The total amount of ticks of the transition.
   * Only used if the payload type is a transition or a noise transition.
   */
  public totalTransitionTicks: number;

  /**
   * The current amount of ticks of the transition.
   * Only used if the payload type is a transition or a noise transition.
   */
  public currentTransitionTicks: number;

  /**
   * The easing function of the transition.
   * Only used if the payload type is a transition or a noise transition.
   */
  public easeType: EasingType;

  /**
   * The name of the clock that drives the transition.
   * Only used if the payload type is a transition or a noise transition.
   */
  public clockName: string;

  /**
   * The local amount of ticks of the noise transition.
   * Only used if the payload type is `EnvironmentAttributePayloadType.NoiseTransition`.
   */
  public localTransitionTicks: number;

  /**
   * The name of the noise used by the noise transition.
   * Only used if the payload type is `EnvironmentAttributePayloadType.NoiseTransition`.
   */
  public noiseName: string;

  /**
   * The alignment type of the noise transition.
   * Only used if the payload type is `EnvironmentAttributePayloadType.NoiseTransition`.
   */
  public noiseAlignmentType: NoiseAlignmentType;

  /**
   * The alignment value of the noise transition.
   * Only used if the payload type is `EnvironmentAttributePayloadType.NoiseTransition`.
   */
  public noiseAlignmentValue: number;

  /**
   * Creates a new environment attribute data instance.
   * @param attributeName The name of the environment attribute.
   * @param payloadType The type of the payload of the environment attribute.
   * @param attribute The value of a constant attribute.
   * @param fromAttribute The value a transition starts from.
   * @param toAttribute The value a transition ends at.
   * @param totalTransitionTicks The total amount of ticks of the transition.
   * @param currentTransitionTicks The current amount of ticks of the transition.
   * @param easeType The easing function of the transition.
   * @param clockName The name of the clock that drives the transition.
   * @param localTransitionTicks The local amount of ticks of the noise transition.
   * @param noiseName The name of the noise used by the noise transition.
   * @param noiseAlignmentType The alignment type of the noise transition.
   * @param noiseAlignmentValue The alignment value of the noise transition.
   */
  public constructor(
    attributeName: string,
    payloadType: EnvironmentAttributePayloadType = EnvironmentAttributePayloadType.Constant,
    attribute: AttributeData | null = null,
    fromAttribute: AttributeData | null = null,
    toAttribute: AttributeData | null = null,
    totalTransitionTicks = 0,
    currentTransitionTicks = 0,
    easeType: EasingType = EasingType.Linear,
    clockName = "",
    localTransitionTicks = 0,
    noiseName = "",
    noiseAlignmentType: NoiseAlignmentType = NoiseAlignmentType.MinLocalTransitionEnd,
    noiseAlignmentValue = 0
  ) {
    super();
    this.attributeName = attributeName;
    this.payloadType = payloadType;
    this.attribute = attribute;
    this.fromAttribute = fromAttribute;
    this.toAttribute = toAttribute;
    this.totalTransitionTicks = totalTransitionTicks;
    this.currentTransitionTicks = currentTransitionTicks;
    this.easeType = easeType;
    this.clockName = clockName;
    this.localTransitionTicks = localTransitionTicks;
    this.noiseName = noiseName;
    this.noiseAlignmentType = noiseAlignmentType;
    this.noiseAlignmentValue = noiseAlignmentValue;
  }

  public static read(stream: BinaryStream): EnvironmentAttributeData {
    // Read the name of the attribute, and the variant index of the payload
    const attributeName = stream.readVarString();
    const payloadType = stream.readVarInt() as EnvironmentAttributePayloadType;
    const value = new this(attributeName, payloadType);

    switch (payloadType) {
      case EnvironmentAttributePayloadType.Constant: {
        value.attribute = AttributeData.read(stream);
        break;
      }
      case EnvironmentAttributePayloadType.Transition:
      case EnvironmentAttributePayloadType.NoiseTransition: {
        // Read the attribute values of the transition
        value.fromAttribute = AttributeData.read(stream);
        value.toAttribute = AttributeData.read(stream);

        // Read the settings shared by both transition types
        value.totalTransitionTicks = stream.readVarInt();
        value.currentTransitionTicks = stream.readVarInt();
        value.easeType = stream.readZigZag() as EasingType;
        value.clockName = stream.readVarString();

        // Read the settings exclusive to noise transitions
        if (payloadType === EnvironmentAttributePayloadType.NoiseTransition) {
          value.localTransitionTicks = stream.readVarInt();
          value.noiseName = stream.readVarString();
          value.noiseAlignmentType = stream.readUint8() as NoiseAlignmentType;
          value.noiseAlignmentValue = stream.readVarInt();
        }
        break;
      }
      default: {
        throw new Error(
          `Unknown environment attribute payload type: ${payloadType}`
        );
      }
    }

    return value;
  }

  public static write(
    stream: BinaryStream,
    value: EnvironmentAttributeData
  ): void {
    // Write the name of the attribute, and the variant index of the payload
    stream.writeVarString(value.attributeName);
    stream.writeVarInt(value.payloadType);

    switch (value.payloadType) {
      case EnvironmentAttributePayloadType.Constant: {
        if (!value.attribute)
          throw new Error("A constant environment attribute requires a value.");

        AttributeData.write(stream, value.attribute);
        break;
      }
      case EnvironmentAttributePayloadType.Transition:
      case EnvironmentAttributePayloadType.NoiseTransition: {
        if (!value.fromAttribute || !value.toAttribute)
          throw new Error(
            "A transition environment attribute requires a from and to value."
          );

        // Write the attribute values of the transition
        AttributeData.write(stream, value.fromAttribute);
        AttributeData.write(stream, value.toAttribute);

        // Write the settings shared by both transition types
        stream.writeVarInt(value.totalTransitionTicks);
        stream.writeVarInt(value.currentTransitionTicks);
        stream.writeZigZag(value.easeType);
        stream.writeVarString(value.clockName);

        // Write the settings exclusive to noise transitions
        if (
          value.payloadType === EnvironmentAttributePayloadType.NoiseTransition
        ) {
          stream.writeVarInt(value.localTransitionTicks);
          stream.writeVarString(value.noiseName);
          stream.writeUint8(value.noiseAlignmentType);
          stream.writeVarInt(value.noiseAlignmentValue);
        }
        break;
      }
      default: {
        throw new Error(
          `Unknown environment attribute payload type: ${value.payloadType}`
        );
      }
    }
  }
}

export { EnvironmentAttributeData };
