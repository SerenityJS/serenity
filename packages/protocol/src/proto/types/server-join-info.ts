import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { GatheringJoinInfo } from "./gathering-join-info";
import { StoreEntryPointInfo } from "./store-entry-point-info";
import { PresenceInfo } from "./presence-info";

class ServerJoinInfo extends DataType {
  public gatheringJoinInfo?: GatheringJoinInfo | null;

  public storeEntryPointInfo?: StoreEntryPointInfo | null;

  public presenceInfo?: PresenceInfo | null;

  public constructor(
    gatheringJoinInfo: GatheringJoinInfo | null = null,
    storeEntryPointInfo: StoreEntryPointInfo | null = null,
    presenceInfo: PresenceInfo | null = null
  ) {
    super();
    this.gatheringJoinInfo = gatheringJoinInfo;
    this.storeEntryPointInfo = storeEntryPointInfo;
    this.presenceInfo = presenceInfo;
  }

  public static read(stream: BinaryStream): ServerJoinInfo {
    const hasGatheringJoinInfo = stream.readBool();

    let gatheringJoinInfo: GatheringJoinInfo | null = null;
    if (hasGatheringJoinInfo) {
      gatheringJoinInfo = GatheringJoinInfo.read(stream);
    }

    const hasStoreEntryPointInfo = stream.readBool();
    let storeEntryPointInfo: StoreEntryPointInfo | null = null;
    if (hasStoreEntryPointInfo) {
      storeEntryPointInfo = StoreEntryPointInfo.read(stream);
    }

    const hasPresenceInfo = stream.readBool();
    let presenceInfo: PresenceInfo | null = null;
    if (hasPresenceInfo) {
      presenceInfo = PresenceInfo.read(stream);
    }

    return new this(gatheringJoinInfo, storeEntryPointInfo, presenceInfo);
  }

  public static write(stream: BinaryStream, value: ServerJoinInfo): void {
    stream.writeBool(value.gatheringJoinInfo !== null);
    if (value.gatheringJoinInfo) {
      GatheringJoinInfo.write(stream, value.gatheringJoinInfo);
    }

    stream.writeBool(value.storeEntryPointInfo !== null);
    if (value.storeEntryPointInfo) {
      StoreEntryPointInfo.write(stream, value.storeEntryPointInfo);
    }

    stream.writeBool(value.presenceInfo !== null);
    if (value.presenceInfo) {
      PresenceInfo.write(stream, value.presenceInfo);
    }
  }
}

export { ServerJoinInfo };
