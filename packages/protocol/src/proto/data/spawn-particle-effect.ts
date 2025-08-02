import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8, ZigZong, VarString, Bool } from "@serenityjs/binarystream";

import { Vector3f } from "../types";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SpawnParticleEffect)
class SpawnParticleEffectPacket extends DataPacket {
  @Serialize(Uint8)
  public dimensionId!: number;

  @Serialize(ZigZong)
  public uniqueId!: bigint;

  @Serialize(Vector3f)
  public position!: Vector3f;

  @Serialize(VarString)
  public effectName!: string;

  // ! Unknown value, if the value is invalid, the client exits because the packet is broken, in mostly cases this can be not defined
  @Serialize(Bool)
  public molangVariables!: string | null;
}

export { SpawnParticleEffectPacket };
