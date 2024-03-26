import { VersionCommand } from "./version.js";

import type { Command } from "../command.js";

const DefaultCommands: Array<Command> = [new VersionCommand()];

export { DefaultCommands };
