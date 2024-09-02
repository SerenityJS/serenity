type CommandResponse<T = NonNullable<unknown>> = { message?: string } & T;

export { CommandResponse };
