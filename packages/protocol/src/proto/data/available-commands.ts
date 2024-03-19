import { Endianness } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import {
	Commands,
	DynamicEnums,
	EnumConstraints,
	Enums,
	Subcommands,
	VarStringArray as VariableStringArray
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.AvailableCommands)
class AvailableCommandsPacket extends DataPacket {
	@Serialize(VariableStringArray) public enumValues!: Array<string>;
	@Serialize(VariableStringArray) public subcommandValues!: Array<string>;
	@Serialize(VariableStringArray) public suffixes!: Array<string>;
	@Serialize(Enums, Endianness.Little, "enumValues")
	public enums!: Array<Enums>;

	@Serialize(Subcommands) public subcommands!: Array<Subcommands>;
	@Serialize(Commands) public commands!: Array<Commands>;
	@Serialize(DynamicEnums) public dynamicEnums!: Array<DynamicEnums>;
	@Serialize(EnumConstraints) public enumConstraints!: Array<EnumConstraints>;
}

export { AvailableCommandsPacket };
