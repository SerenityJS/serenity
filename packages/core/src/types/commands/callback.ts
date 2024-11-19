import type { CommandContext } from "./context";
import type { CommandResponse } from "./response";

type CommandCallback<T = NonNullable<unknown>> = (
  context: CommandContext<T>
) => CommandResponse | void | Promise<CommandResponse | void>;

export { type CommandCallback };
