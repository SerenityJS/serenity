import { Uint8, VarString } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { type MatchmakingState, Packet } from "../../enums";
import { MatchmakingStateOptions } from "../types";

import { DataPacket } from "./data-packet";

/**
 * Informs the client when its matchmaking state changes.
 */
@Proto(Packet.ClientboundMatchmakingState)
class ClientboundMatchmakingStatePacket extends DataPacket {
  /**
   * The new matchmaking state of the client.
   */
  @Serialize(Uint8) public state!: MatchmakingState;

  /**
   * The name of the matchmaking destination.
   */
  @Serialize(VarString) public destinationName!: string;

  /**
   * The optional details of the state change.
   */
  @Serialize(MatchmakingStateOptions, { optional: true })
  public options?: MatchmakingStateOptions;
}

export { ClientboundMatchmakingStatePacket };
