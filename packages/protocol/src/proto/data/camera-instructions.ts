import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { CameraInstructions } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.CameraInstructions)
class CameraInstructionsPacket extends DataPacket {
  @Serialize(CameraInstructions)
  public instruction!: CameraInstructions;
}

export { CameraInstructionsPacket };
