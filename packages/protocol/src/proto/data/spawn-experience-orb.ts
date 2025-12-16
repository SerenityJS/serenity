import { Serialize } from "@serenityjs/raknet";
import { Int32 } from "@serenityjs/binarystream";

import { Vector3f } from "../types";

import { DataPacket } from "./data-packet";

class SpawnExperienceOrbPacket extends DataPacket {
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(Int32) public xpValue!: number;
}

export { SpawnExperienceOrbPacket };
