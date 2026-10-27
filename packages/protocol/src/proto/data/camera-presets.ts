import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { CameraPreset } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.CameraPresetsPacket)
class CameraPresetsPacket extends DataPacket {
  @Serialize(CameraPreset)
  public presets!: Array<CameraPreset>;
}

export { CameraPresetsPacket };
