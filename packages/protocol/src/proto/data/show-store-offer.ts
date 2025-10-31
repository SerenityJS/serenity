import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8 } from "@serenityjs/binarystream";

import { Uuid } from "../types";
import { Packet, ShowStoreOfferRedirectType } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ShowStoreOffer)
class ShowStoreOfferPacket extends DataPacket {
  @Serialize(Uuid) public offerId!: Uuid;
  @Serialize(Uint8)
  public redirectType!: ShowStoreOfferRedirectType;
}

export { ShowStoreOfferPacket };
