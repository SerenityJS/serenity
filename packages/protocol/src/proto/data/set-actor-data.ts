import { VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { ActorDataId, ActorDataType, ActorFlag, Packet } from "../../enums";
import { PropertySyncData, DataItem } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetActorData)
class SetActorDataPacket extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(DataItem) public data!: Array<DataItem>;
	@Serialize(PropertySyncData) public properties!: PropertySyncData;
	@Serialize(VarLong) public tick!: bigint;

	/**
	 * The first set of flags of the actor.
	 */
	private flagKeyset1 = 0n;

	/**
	 * The second set of flags of the actor.
	 */
	private flagKeyset2 = 0n;

	/**
	 * Sets the flag of the actor.
	 * @param flag The flag to set.
	 * @param enabled Whether the flag should be enabled.
	 */
	public setFlag(flag: ActorFlag, enabled: boolean): void {
		// Calculate the value of the flag.
		const value = enabled
			? this.flagKeyset1 ^ (1n << BigInt(flag))
			: this.flagKeyset1 ^ (0n << BigInt(flag));

		// Set the value of the flag.
		this.flagKeyset1 = value;

		// Create a new data item.
		const data = new DataItem(ActorDataId.Reserved0, ActorDataType.Long, value);

		// Push the data item to the array.
		this.data.push(data);
	}

	/**
	 * Gets the flag of the actor.
	 * @param flag The flag to get.
	 * @returns Whether the flag is enabled.
	 */
	public getFlag(flag: ActorFlag): boolean {
		// Calculate the value of the flag.
		const value = this.flagKeyset1 & (1n << BigInt(flag));

		// Return the value of the flag.
		return value === 1n;
	}
}

export { SetActorDataPacket };
