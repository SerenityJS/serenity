import { DataPacket, Vector3f } from "@serenityjs/protocol";
import { ZigZong, ZigZag, VarString, Bool } from "@serenityjs/binarystream";
import { Serialize, Proto } from "@serenityjs/raknet";
import { Packet } from "../../enums";

@Proto(Packet.ClientCacheStatus)
class ClientCacheStatusPacket extends DataPacket {
  @Serialize(Bool) public enabled!: boolean;
}

export { ClientCacheStatusPacket };
