import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { GraphicsOverrideParameterType } from "../../enums";

import { Vector3f } from "./vector3f";

class GraphicsOverrideParameterPayload extends DataType {
  public parameterKeyframeValues: Map<number, Vector3f>;
  public biomeIdentifier: string;
  public playerIdentifier: string | null;
  public parameterIdentifier: GraphicsOverrideParameterType;
  public resetParameter: boolean;

  public constructor(
    parameterKeyframeValues: Map<number, Vector3f>,
    biomeIdentifier: string,
    playerIdentifier: string | null,
    parameterIdentifier: GraphicsOverrideParameterType,
    resetParameter: boolean
  ) {
    super();

    this.parameterKeyframeValues = parameterKeyframeValues;
    this.biomeIdentifier = biomeIdentifier;
    this.playerIdentifier = playerIdentifier;
    this.parameterIdentifier = parameterIdentifier;
    this.resetParameter = resetParameter;
  }

  public static read(stream: BinaryStream): GraphicsOverrideParameterPayload {
    const keyframeCount = stream.readVarInt();
    const parameterKeyframeValues: Map<number, Vector3f> = new Map();

    for (let i = 0; i < keyframeCount; i++) {
      const time = stream.readFloat32();
      const vector = Vector3f.read(stream);

      parameterKeyframeValues.set(time, vector);
    }

    const biomeIdentifier = stream.readVarString();
    const playerIdentifier = stream.readBool() ? stream.readVarString() : null;
    const parameterIdentifier =
      stream.readUint8() as GraphicsOverrideParameterType;
    const resetParameter = stream.readBool();

    return new GraphicsOverrideParameterPayload(
      parameterKeyframeValues,
      biomeIdentifier,
      playerIdentifier,
      parameterIdentifier,
      resetParameter
    );
  }

  public static write(
    stream: BinaryStream,
    value: GraphicsOverrideParameterPayload
  ): void {
    stream.writeVarInt(value.parameterKeyframeValues.size);

    for (const [time, vector] of value.parameterKeyframeValues) {
      stream.writeFloat32(time);
      Vector3f.write(stream, vector);
    }

    stream.writeVarString(value.biomeIdentifier);
    stream.writeBool(value.playerIdentifier !== null);
    if (value.playerIdentifier !== null) {
      stream.writeVarString(value.playerIdentifier);
    }

    stream.writeUint8(value.parameterIdentifier);
    stream.writeBool(value.resetParameter);
  }
}

export { GraphicsOverrideParameterPayload };
