import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { GraphicsOverrideParameterType } from "../../enums";

import { Vector3f } from "./vector3f";

class GraphicsOverrideParameterPayload extends DataType {
  public parameterKeyframeValues: Map<number, Vector3f>;
  public biomeIdentifier: string;
  public parameterIdentifier: GraphicsOverrideParameterType;
  public resetParameter: boolean;

  public constructor(
    parameterKeyframeValues: Map<number, Vector3f>,
    biomeIdentifier: string,
    parameterIdentifier: GraphicsOverrideParameterType,
    resetParameter: boolean
  ) {
    super();

    this.parameterKeyframeValues = parameterKeyframeValues;
    this.biomeIdentifier = biomeIdentifier;
    this.parameterIdentifier = parameterIdentifier;
    this.resetParameter = resetParameter;
  }

  public static write(
    stream: BinaryStream,
    value: GraphicsOverrideParameterPayload
  ): void {
    for (const [key, vector] of value.parameterKeyframeValues) {
      stream.writeFloat32(key);
      Vector3f.write(stream, vector);
    }

    stream.writeString32(value.biomeIdentifier);

    stream.writeUint8(value.parameterIdentifier);
    stream.writeBool(value.resetParameter);
  }
}

export { GraphicsOverrideParameterPayload };
