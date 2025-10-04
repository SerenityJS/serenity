import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool, Int8, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientCameraAimAssistPacket)
class ClientCameraAimAssistPacket extends DataPacket {
  @Serialize(VarString)
  public cameraPresetId!: string;

  @Serialize(Int8)
  public action!: number;

  @Serialize(Bool)
  public allowAimAssist!: boolean;
}

export { ClientCameraAimAssistPacket };
