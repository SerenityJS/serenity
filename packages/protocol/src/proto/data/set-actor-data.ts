import { VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import {
  ActorDataId,
  ActorDataType,
  type ActorFlag,
  Packet
} from "../../enums";
import { PropertySyncData, DataItem, PlayerInputTick } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetActorData)
class SetActorDataPacket extends DataPacket {
  @Serialize(VarLong) public runtimeEntityId!: bigint;
  @Serialize(DataItem) public data!: Array<DataItem>;
  @Serialize(PropertySyncData) public properties!: PropertySyncData;
  @Serialize(PlayerInputTick) public inputTick!: bigint;

  /**
   * The first set of flags of the actor.
   */
  private actorFlagSet = new DataItem(
    ActorDataId.Reserved0,
    ActorDataType.Long,
    0n
  );

  /**
   * The second set of flags of the actor.
   */
  private actorFlagSet2 = new DataItem(
    ActorDataId.Reserved092,
    ActorDataType.Long,
    0n
  );

  /**
   * Sets the flag of the actor.
   * @param flag The flag to set.
   * @param enabled Whether the flag should be enabled.
   */
  public setActorFlag(flag: ActorFlag, enabled: boolean): void {
    // Calculate the data ID based on the flag.
    const dataId = flag >= 64 ? ActorDataId.Reserved092 : ActorDataId.Reserved0;

    // Update the flag based on the data ID.
    if (dataId === ActorDataId.Reserved0) {
      // Calculate the value of the flag.
      const value = enabled
        ? this.actorFlagSet.value ^ (1n << BigInt(flag % 64))
        : this.actorFlagSet.value ^ (0n << BigInt(flag % 64));

      // Set the value of the flag.
      this.actorFlagSet.value = value;

      // Create a new data item.
      const data = new DataItem(dataId, ActorDataType.Long, value);

      // Replace the data item.
      const index = this.data.findIndex((item) => item.identifier === dataId);

      // Replace the data item if it exists.
      if (index !== -1) this.data[index] = data;
      else this.data.push(data);
    } else {
      // Calculate the value of the flag.
      const value = enabled
        ? this.actorFlagSet2.value ^ (1n << BigInt(flag % 64))
        : this.actorFlagSet2.value ^ (0n << BigInt(flag % 64));

      // Set the value of the flag.
      this.actorFlagSet2.value = value;

      // Create a new data item.
      const data = new DataItem(dataId, ActorDataType.Long, value);

      // Replace the data item.
      const index = this.data.findIndex((item) => item.identifier === dataId);

      // Replace the data item if it exists.
      if (index !== -1) this.data[index] = data;
      else this.data.push(data);
    }
  }

  /**
   * Gets the flag of the actor.
   * @param flag The flag to get.
   * @returns Whether the flag is enabled.
   */
  public getActorFlag(flag: ActorFlag): boolean {
    // Calculate the data ID based on the flag.
    const dataId = flag >= 64 ? ActorDataId.Reserved092 : ActorDataId.Reserved0;

    // Get the value of the flag based on the data ID.
    if (dataId === ActorDataId.Reserved0) {
      return (this.actorFlagSet.value & (1n << BigInt(flag % 64))) !== 0n;
    } else {
      return (this.actorFlagSet2.value & (1n << BigInt(flag % 64))) !== 0n;
    }
  }
}

export { SetActorDataPacket };
