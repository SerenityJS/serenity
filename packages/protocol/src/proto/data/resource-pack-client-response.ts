import { Proto } from "@serenityjs/raknet";

import { Packet, ResourcePackResponse } from "../../enums";
import { RequestedResourcePack, ResourcePacksClientRequest } from "../types";

import { DataPacket } from "./data-packet";

/**
 * The names of the responses as they are written on the wire, indexed by `response - 1`.
 */
const ResponseNames = [
  "cancel", // ResourcePackResponse.Refused
  "downloading", // ResourcePackResponse.SendPacks
  "downloadingfinished", // ResourcePackResponse.HaveAllPacks
  "resourcepackstackfinished" // ResourcePackResponse.Completed
];

@Proto(Packet.ResourcePackClientResponse)
class ResourcePackClientResponsePacket extends DataPacket {
  /**
   * The response from the client regarding resource packs.
   * This indicates whether the client has accepted, refused, or completed the resource pack download.
   * @see {@link ResourcePackResponse}
   */
  public response!: ResourcePackResponse;

  /**
   * The list of resource packs that the client has requested to download.
   * This is only present when the response is `ResourcePackResponse.SendPacks`.
   * @see {@link RequestedResourcePack}
   */
  public packs: Array<RequestedResourcePack> = [];

  public override serialize(): Buffer {
    // Reset the offset, as the same packet may be serialized more than once (e.g. when broadcasting)
    this.offset = 0;

    // Write the packet id
    this.writeVarInt(Packet.ResourcePackClientResponse);

    // The response is a variant; its index is the response value minus one
    const index = this.response - 1;
    this.writeVarInt(index);

    // Each variant starts with the name of the response
    this.writeVarString(ResponseNames[index] ?? "");

    // The requested packs are only present for the downloading response
    if (this.response === ResourcePackResponse.SendPacks)
      ResourcePacksClientRequest.write(this, this.packs);

    return this.getBuffer();
  }

  public override deserialize(): this {
    // Read the packet id
    this.readVarInt();

    // Read the variant index, and convert it to the response value
    this.response = (this.readVarInt() + 1) as ResourcePackResponse;

    // Read the name of the response, which is implied by the variant index
    this.readVarString();

    // Read the requested packs if the client is downloading packs
    this.packs =
      this.response === ResourcePackResponse.SendPacks
        ? ResourcePacksClientRequest.read(this)
        : [];

    return this;
  }
}

export { ResourcePackClientResponsePacket };
