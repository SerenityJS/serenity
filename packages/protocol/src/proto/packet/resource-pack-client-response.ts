import { Uint8 } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, ResourceStatus } from "../../enums";
import { ResourcePackIds } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePackClientResponse)
class ResourcePackClientResponse extends DataPacket {
	@Serialize(Uint8) public status!: ResourceStatus;
	@Serialize(ResourcePackIds) public packIds!: Array<string>;
}

export { ResourcePackClientResponse };
