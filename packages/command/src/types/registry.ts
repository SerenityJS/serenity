import type { CommandRegistry } from "../registry";

type CommandRegistryCallback<O> = (registry: CommandRegistry<O>) => void;

export { type CommandRegistryCallback };
