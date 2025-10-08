import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { CameraSetInstruction } from "./camera-instruction-set";
import { CameraFadeInstruction } from "./camera-instruction-fade";
import { OptionalIO } from "./optional";
import { CameraTargetInstruction } from "./camera-instruction-target";
import { CameraFOVInstruction } from "./camera-instruction-fov";

class CameraInstructions extends DataType {
  public set?: CameraSetInstruction;
  public clear?: boolean;
  public fade?: CameraFadeInstruction;
  public target?: CameraTargetInstruction;
  public removeTarget?: boolean;
  public fov?: CameraFOVInstruction;

  public constructor(
    set?: CameraSetInstruction,
    clear?: boolean,
    fade?: CameraFadeInstruction,
    target?: CameraTargetInstruction,
    removeTarget?: boolean,
    fov?: CameraFOVInstruction
  ) {
    super();
    this.set = set;
    this.clear = clear;
    this.fade = fade;
    this.target = target;
    this.removeTarget = removeTarget;
    this.fov = fov;
  }

  public static write(stream: BinaryStream, value: CameraInstructions): void {
    OptionalIO.write<CameraSetInstruction>(
      stream,
      CameraSetInstruction.write,
      value.set
    );

    OptionalIO.write<boolean>(
      stream,
      (_, value) => stream.writeBool(value),
      value.clear
    );

    OptionalIO.write<CameraFadeInstruction>(
      stream,
      CameraFadeInstruction.write,
      value.fade
    );

    OptionalIO.write<CameraTargetInstruction>(
      stream,
      CameraTargetInstruction.write,
      value.target
    );

    OptionalIO.write<boolean>(
      stream,
      (_, value) => stream.writeBool(value),
      value.removeTarget
    );

    OptionalIO.write<CameraFOVInstruction>(
      stream,
      CameraFOVInstruction.write,
      value.fov
    );
  }
}

export { CameraInstructions };
