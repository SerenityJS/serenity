import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import {
  ChainedSubcommandValues,
  Commands,
  DynamicEnums,
  EnumConstraints,
  Enums,
  EnumValues,
  PostFixes,
  Subcommands
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.AvailableCommands)
class AvailableCommandsPacket extends DataPacket {
  @Serialize(EnumValues) public enumValues!: Array<string>;
  @Serialize(ChainedSubcommandValues)
  public chainedSubcommandValues!: Array<string>;

  @Serialize(PostFixes) public postFixes!: Array<string>;
  @Serialize(Enums) public enums!: Array<Enums>;

  @Serialize(Subcommands) public subcommands!: Array<Subcommands>;
  @Serialize(Commands) public commands!: Array<Commands>;
  @Serialize(DynamicEnums) public dynamicEnums!: Array<DynamicEnums>;
  @Serialize(EnumConstraints) public enumConstraints!: Array<EnumConstraints>;
}

export { AvailableCommandsPacket };
