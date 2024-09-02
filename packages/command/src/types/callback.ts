/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { CommandContext } from "./context";
import type { CommandResponse } from "./response";

type CommandCallback<T = NonNullable<unknown>, O = unknown> = (
	context: CommandContext<T, O>
) => CommandResponse | void;

export { type CommandCallback };
