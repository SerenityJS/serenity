import { DataType } from "@serenityjs/raknet";

import { StructureSettings } from "./structure-settings";

import type { BinaryStream } from "@serenityjs/binarystream";

class StructureEditorData extends DataType {
	public structureName: string;
	public dataField: string;
	public includePlayers: boolean;
	public showBoundingBox: boolean;
	public blockType: number;
	public structureSetting: StructureSettings;
	public redstoneSaveMode: number;

	public constructor(
		structureName: string,
		dataField: string,
		includePlayers: boolean,
		showBoundingBox: boolean,
		blockType: number,
		structureSettings: StructureSettings,
		redstoneSaveMode: number
	) {
		super();
		this.structureName = structureName;
		this.dataField = dataField;
		this.includePlayers = includePlayers;
		this.showBoundingBox = showBoundingBox;
		this.blockType = blockType;
		this.structureSetting = structureSettings;
		this.redstoneSaveMode = redstoneSaveMode;
	}

	public static write(stream: BinaryStream, value: StructureEditorData): void {
		stream.writeVarString(value.structureName);
		stream.writeVarString(value.dataField);
		stream.writeBool(value.includePlayers);
		stream.writeBool(value.showBoundingBox);
		stream.writeVarInt(value.blockType);
		StructureSettings.write(stream, value.structureSetting);
		stream.writeVarInt(value.redstoneSaveMode);
	}

	public static read(stream: BinaryStream): StructureEditorData {
		return new StructureEditorData(
			stream.readVarString(), // ? Structure Name
			stream.readVarString(), // ? Data Field
			stream.readBool(), // ? Include Players
			stream.readBool(), // ? Show Bounding Box
			stream.readVarInt(), // ? Block Type
			StructureSettings.read(stream), // ? Structure Settings
			stream.readVarInt() // ? Redstone Save Mode
		);
	}
}

export { StructureEditorData };
