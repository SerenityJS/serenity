import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { CameraSetInstruction } from "./camera-instruction-set";
import { CameraFadeInstruction } from "./camera-instruction-fade";
import { OptionalIO } from "./optional";
import { CameraTargetInstruction } from "./camera-instruction-target";
import { CameraFOVInstruction } from "./camera-instruction-fov";
import { CameraSplineInstruction } from "./camera-instruction-spline";
import { CameraAttachEntityInstruction } from "./camera-instruction-attach-entity";

class CameraInstructions extends DataType {
  public set?: CameraSetInstruction;
  public clear?: boolean;
  public fade?: CameraFadeInstruction;
  public target?: CameraTargetInstruction;
  public removeTarget?: boolean;
  public fov?: CameraFOVInstruction;
  public spline?: CameraSplineInstruction;
  public attachToEntity?: CameraAttachEntityInstruction;
  public detachFromEntity?: boolean;

  public constructor(
    set?: CameraSetInstruction,
    clear?: boolean,
    fade?: CameraFadeInstruction,
    target?: CameraTargetInstruction,
    removeTarget?: boolean,
    fov?: CameraFOVInstruction,
    spline?: CameraSplineInstruction,
    attachToEntity?: CameraAttachEntityInstruction,
    detachFromEntity?: boolean
  ) {
    super();
    this.set = set;
    this.clear = clear;
    this.fade = fade;
    this.target = target;
    this.removeTarget = removeTarget;
    this.fov = fov;
    this.spline = spline;
    this.attachToEntity = attachToEntity;
    this.detachFromEntity = detachFromEntity;
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

    OptionalIO.write<CameraSplineInstruction>(
      stream,
      CameraSplineInstruction.write,
      value.spline
    );

    OptionalIO.write<CameraAttachEntityInstruction>(
      stream,
      CameraAttachEntityInstruction.write,
      value.attachToEntity
    );

    OptionalIO.write<boolean>(
      stream,
      (_, value) => stream.writeBool(value),
      value.detachFromEntity
    );
  }
}

export { CameraInstructions };
