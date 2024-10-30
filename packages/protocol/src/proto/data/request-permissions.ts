import { Proto, Serialize } from "@serenityjs/raknet";
import { Endianness, Int64, Uint16, ZigZag } from "@serenityjs/binarystream";

import { Packet, PermissionFlag, PermissionLevel } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.RequestPermissions)
class RequestPermissionsPacket extends DataPacket {
  @Serialize(Int64, Endianness.Little) public actorUniqueId!: bigint;
  @Serialize(ZigZag) public permissionLevel!: PermissionLevel;
  @Serialize(Uint16, Endianness.Little) public flags!: number;

  public getFlag(flag: PermissionFlag): boolean {
    return (this.flags & flag) === flag;
  }

  public setFlag(flag: PermissionFlag, value: boolean): void {
    if (value) {
      this.flags |= flag;
    } else {
      this.flags &= ~flag;
    }
  }
}

export { RequestPermissionsPacket };
