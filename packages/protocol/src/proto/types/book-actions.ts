import { DataType } from "@serenityjs/raknet";

import { BookEditAction } from "../../enums";

import type { BinaryStream, Endianness } from "@serenityjs/binarystream";

class BookActions extends DataType {
	public pageIndex: number;
	public pageIndexB: number;
	public textA: string;
	public textB: string;
	public xuid: string;

	public constructor(
		pageIndex: number,
		textA: string,
		textB: string,
		xuid: string,
		pageIndexB: number
	) {
		super();
		this.pageIndex = pageIndex;
		this.textA = textA;
		this.textB = textB;
		this.xuid = xuid;
		this.pageIndexB = pageIndexB;
	}

	public static override read(
		stream: BinaryStream,
		_: Endianness,
		action: BookEditAction
	) {
		let pageIndex = 0;
		let pageIndexB = 0;
		let textA = "";
		let textB = "";
		let xuid = "";

		switch (action) {
			case BookEditAction.ReplacePage:
			case BookEditAction.AddPage: {
				pageIndex = stream.readByte();
				textA = stream.readVarString();
				textB = stream.readVarString();
				break;
			}
			case BookEditAction.DeletePage: {
				pageIndex = stream.readByte();
				break;
			}
			case BookEditAction.SwapPage: {
				pageIndex = stream.readByte();
				pageIndexB = stream.readByte();
				break;
			}
			case BookEditAction.Finalize: {
				textA = stream.readVarString();
				textB = stream.readVarString();
				xuid = stream.readVarString();
			}
		}
		return new BookActions(pageIndex, textA, textB, xuid, pageIndexB);
	}

	public static override write(
		stream: BinaryStream,
		value: BookActions,
		_: Endianness,
		action: BookEditAction
	): void {
		switch (action) {
			case BookEditAction.ReplacePage:
			case BookEditAction.AddPage: {
				stream.writeByte(value.pageIndex);
				stream.writeVarString(value.textA);
				stream.writeVarString(value.textB);
				break;
			}
			case BookEditAction.DeletePage: {
				stream.writeByte(value.pageIndex);
				break;
			}
			case BookEditAction.SwapPage: {
				stream.writeByte(value.pageIndex);
				stream.writeByte(value.pageIndexB);
				break;
			}
			case BookEditAction.Finalize: {
				stream.writeVarString(value.textA);
				stream.writeVarString(value.textB);
				stream.writeVarString(value.xuid);
				break;
			}
		}
	}
}

export { BookActions };
