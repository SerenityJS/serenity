import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ActorLink } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetActorLink)
class SetActorLinkPacket extends DataPacket {
  @Serialize(ActorLink)
  public link!: ActorLink;
}

export { SetActorLinkPacket };
