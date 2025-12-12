import { Uint8, VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type InteractAction, Packet } from "../../enums";
import { Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Interact)
class InteractPacket extends DataPacket {
  /**
   * The action of the interaction.
   */
  @Serialize(Uint8) public action!: InteractAction;

  /**
   * The runtime ID of the actor being interacted with.
   */
  @Serialize(VarLong) public actorRuntimeId!: bigint;

  /**
   * The position of the interaction (optional).
   */
  @Serialize(Vector3f, { optional: true })
  public position!: Vector3f | null;
}

export { InteractPacket };
