import { Serialize, Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { MissingBlobData } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientCacheMissResponse)
class ClientCacheMissResponsePacket extends DataPacket {
  @Serialize(MissingBlobData)
  public missingBlobData!: Array<MissingBlobData>;
}

export { ClientCacheMissResponsePacket };
