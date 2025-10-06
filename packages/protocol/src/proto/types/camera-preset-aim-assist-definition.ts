import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { AimAssistMode } from "../../enums/aim-assist-mode";

import { Vector2f } from "./vector2f";
import { OptionalIO } from "./optional";

class CameraPresetAimAssistDefinition extends DataType {
  public presetId?: string;

  public targetMode?: AimAssistMode;

  public angle?: Vector2f;

  public distance?: number;

  public constructor(
    presetId?: string,
    targetMode?: AimAssistMode,
    angle?: Vector2f,
    distance?: number
  ) {
    super();
    this.presetId = presetId;
    this.targetMode = targetMode;
    this.angle = angle;
    this.distance = distance;
  }

  public static write(
    stream: BinaryStream,
    value: CameraPresetAimAssistDefinition
  ): void {
    OptionalIO.write<string>(
      stream,
      (_, value) => stream.writeVarString(value),
      value.presetId
    );

    OptionalIO.write<number>(
      stream,
      (_, value) => stream.writeInt32(value),
      value.targetMode
    );

    OptionalIO.write<Vector2f>(stream, Vector2f.write, value.angle);

    OptionalIO.write<number>(
      stream,
      (_, value) => stream.writeFloat32(value, Endianness.Little),
      value.distance
    );
  }
}

export { CameraPresetAimAssistDefinition };
