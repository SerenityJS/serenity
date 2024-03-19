import { Uint8 } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, ResourceStatus } from "../../enums";
import { ResourcePackIds } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePackClientResponse)
class ResourcePackClientResponsePacket extends DataPacket {
	@Serialize(Uint8) public status!: ResourceStatus;
	@Serialize(ResourcePackIds) public packIds!: Array<string>;
}

export { ResourcePackClientResponsePacket };
