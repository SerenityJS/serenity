import { Bool, VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { Uuid, ResourcePackDescriptor } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePacksInfo)
class ResourcePacksInfoPacket extends DataPacket {
  /**
   * Whether the client should be forced to download the packs.
   */
  @Serialize(Bool) public mustAccept!: boolean;

  /**
   * If the stack includes a resource pack that is apart of an addon pack.
   */
  @Serialize(Bool) public hasAddons!: boolean;

  /**
   * If the stack includes a resource pack that scripting capabilities.
   */
  @Serialize(Bool) public hasScripts!: boolean;

  /**
   * Wheather the client should disable vibrant visuals when connecting to the server.
   */
  @Serialize(Bool) public forceDisableVibrantVisuals!: boolean;

  /**
   * Indicates what template the world is based on, if applicable.
   */
  @Serialize(Uuid) public worldTemplateUuid!: string;

  /**
   * Indicates the version of the world template, if applicable.
   */
  @Serialize(VarString) public worldTemplateVersion!: string;

  /**
   * The list of resource packs to be sent to the client.
   */
  @Serialize(ResourcePackDescriptor)
  public packs!: Array<ResourcePackDescriptor>;
}

export { ResourcePacksInfoPacket };
