import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { CameraFadeDuration } from "./camera-fade-duration";
import { Vector3f } from "./vector3f";
import { OptionalIO } from "./optional";

class CameraFadeInstruction extends DataType {
  public duration?: CameraFadeDuration;
  public color?: Vector3f;

  public constructor(duration?: CameraFadeDuration, color?: Vector3f) {
    super();
    this.duration = duration;
    this.color = color;
  }

  public static write(
    stream: BinaryStream,
    value: CameraFadeInstruction
  ): void {
    OptionalIO.write<CameraFadeDuration>(
      stream,
      CameraFadeDuration.write,
      value.duration
    );

    OptionalIO.write<Vector3f>(stream, Vector3f.write, value.color);
  }
}

export { CameraFadeInstruction };
