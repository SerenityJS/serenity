type CommandContext<T = NonNullable<unknown>, O = unknown> = { origin: O } & T;

export { type CommandContext };
