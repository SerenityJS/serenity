import { Bool } from "@serenityjs/binarystream";
import { Serialize, Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientCacheStatus)
class ClientCacheStatusPacket extends DataPacket {
  @Serialize(Bool) public enabled!: boolean;
}

export { ClientCacheStatusPacket };
