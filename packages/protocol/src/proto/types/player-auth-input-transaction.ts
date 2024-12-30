import type { BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import type { PlayerAuthInputData } from "./player-auth-input-data";
import { InputTransaction } from "./input-transaction";
import { InputData } from "../../enums";

export class PlayerAuthInputTransaction extends DataType {
	public inputTransaction: InputTransaction;

	public constructor(inputTransaction: InputTransaction) {
		super();
		this.inputTransaction = inputTransaction;
	}

	public static write(
		stream: BinaryStream,
		value: InputTransaction,
		_: unknown,
		data: PlayerAuthInputData,
	) {
		if (!data.hasFlag(InputData.PerformItemInteraction)) return;
		InputTransaction.write(stream, value);
	}

	public static read(
		stream: BinaryStream,
		_: unknown,
		data: PlayerAuthInputData,
	): InputTransaction | null {
		if (!data.hasFlag(InputData.PerformItemInteraction)) return null;
		return InputTransaction.read(stream);
	}
}
