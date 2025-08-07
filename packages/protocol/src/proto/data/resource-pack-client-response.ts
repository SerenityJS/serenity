import { Uint8 } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type ResourcePackResponse } from "../../enums";
import { RequestedResourcePack, ResourcePacksClientRequest } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePackClientResponse)
class ResourcePackClientResponsePacket extends DataPacket {
  /**
   * The response from the client regarding resource packs.
   * This indicates whether the client has accepted, refused, or completed the resource pack download.
   * @see {@link ResourcePackResponse}
   */
  @Serialize(Uint8) public response!: ResourcePackResponse;

  /**
   * The list of resource packs that the client has requested to download.
   * This format includes the pack uuid and version.
   * @see {@link RequestedResourcePack}
   */
  @Serialize(ResourcePacksClientRequest)
  public packs!: Array<RequestedResourcePack>;
}

export { ResourcePackClientResponsePacket };
