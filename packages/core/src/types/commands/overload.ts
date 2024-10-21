import type { Enum } from "../../commands";

interface CommandOverload {
  [key: string]: typeof Enum | [typeof Enum, boolean];
}

export { type CommandOverload };
