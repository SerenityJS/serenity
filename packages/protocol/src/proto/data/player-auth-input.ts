import { Endianness } from "@serenityjs/binarystream";
import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { BlockAction } from "../types/block-action";
import { ClientPredictedVehicle } from "../types/client-predicted-vehicle";
import { InteractionMode } from "../../enums/interaction-mode";
import { InputDataFlags } from "../../enums/input-data-flags";
import { PlayerAuthInputData } from "../types/player-auth-input-data";
import { InputMode } from "../../enums/input-mode";
import { PlayMode } from "../../enums/play-mode";
import { InputTransaction } from "../types/input-transaction";
import { ItemStackRequest, Vector2f, Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerAuthInput)
export class PlayerAuthInputPacket extends DataPacket {
	public pitch!: number;
	public yaw!: number;
	public position!: Vector3f;
	public motion!: Vector2f; // Move Vector
	public headYaw!: number;
	public inputData!: PlayerAuthInputData;
	public inputMode!: InputMode;
	public playMode!: PlayMode;
	public tick!: bigint;
	public positionDelta!: Vector3f;
	public interactionMode!: InteractionMode;
	public blockActions!: Array<BlockAction>;
	public analogueMoveVector!: Vector2f;

	/** If inputData.itemInteract == true ! */
	public transaction!: InputTransaction | undefined;
	/** If inputData.itemStackRequest == true ! */
	public itemStackRequest!: Array<ItemStackRequest> | undefined;
	/** If PlayMode == Reality */
	public gazeDirection!: Vector3f | undefined;
	/** If inputData.clientPredictedVehicle == true ! */
	public predictedVehicle!: ClientPredictedVehicle | undefined;

	public override serialize(): Buffer {
		this.writeVarInt(Packet.PlayerAuthInput);
		this.writeFloat32(this.pitch, Endianness.Little);
		this.writeFloat32(this.yaw, Endianness.Little);
		Vector3f.write(this, this.position);
		Vector2f.write(this, this.motion);
		this.writeFloat32(this.headYaw, Endianness.Little);

		PlayerAuthInputData.write(this, this.inputData);

		this.writeVarInt(this.inputMode);
		this.writeVarInt(this.playMode);
		this.writeVarInt(this.interactionMode);

		if (this.playMode == PlayMode.Reality) {
			if (!this.gazeDirection)
				throw new Error(
					"GazeDirection is not defined but Reality flag is set."
				);
			Vector3f.write(this, this.gazeDirection);
		}

		this.writeVarLong(this.tick);

		Vector3f.write(this, this.positionDelta);

		if (this.inputData.getFlag(InputDataFlags.ItemInteract)) {
			if (!this.transaction)
				throw new Error(
					"Transaction is not defined but ItemInteract flag is set."
				);
			InputTransaction.write(this, this.transaction);
		}

		if (this.inputData.getFlag(InputDataFlags.ItemStackRequest)) {
			if (!this.itemStackRequest)
				throw new Error(
					"ItemStackRequest is not defined but ItemStackRequest flag is set."
				);
			ItemStackRequest.write(this, this.itemStackRequest);
		}

		if (this.inputData.getFlag(InputDataFlags.BlockAction)) {
			this.writeVarInt(this.blockActions.length);
			for (const action of this.blockActions) {
				BlockAction.write(this, action);
			}
		}

		if (this.inputData.getFlag(InputDataFlags.ClientPredictedVehicle)) {
			if (!this.predictedVehicle)
				throw new Error(
					"PredictedVehicle is not defined but ClientPredictedVehicle flag is set."
				);
			ClientPredictedVehicle.write(this, this.predictedVehicle);
		}

		Vector2f.write(this, this.analogueMoveVector);
		return this.getBuffer();
	}

	public override deserialize(): this {
		this.readVarInt();
		this.pitch = this.readFloat32(Endianness.Little);
		this.yaw = this.readFloat32(Endianness.Little);
		this.position = Vector3f.read(this);
		this.motion = Vector2f.read(this);
		this.headYaw = this.readFloat32(Endianness.Little);
		this.inputData = PlayerAuthInputData.read(this);
		this.inputMode = this.readVarInt();
		this.playMode = this.readVarInt();
		this.interactionMode = this.readVarInt();

		if (this.playMode === PlayMode.Reality) {
			this.gazeDirection = Vector3f.read(this);
		}

		this.tick = this.readVarLong();
		this.positionDelta = Vector3f.read(this);

		if (this.inputData.getFlag(InputDataFlags.ItemInteract)) {
			this.transaction = InputTransaction.read(this);
		}

		if (this.inputData.getFlag(InputDataFlags.ItemStackRequest)) {
			ItemStackRequest.read(this);
		}

		if (this.inputData.getFlag(InputDataFlags.BlockAction)) {
			const count = this.readVarInt();
			this.blockActions = [];
			for (let index = 0; index < count; index++) {
				this.blockActions.push(BlockAction.read(this));
			}
		}

		if (this.inputData.getFlag(InputDataFlags.ClientPredictedVehicle)) {
			this.predictedVehicle = ClientPredictedVehicle.read(this);
		}

		this.analogueMoveVector = Vector2f.read(this);
		return this;
	}
}
