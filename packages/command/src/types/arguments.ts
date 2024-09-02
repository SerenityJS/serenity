import type { Enum } from "../enums";

type CommandArguments<T extends Record<string, unknown>> = {
	[K in keyof T]: T[K] extends [typeof Enum, boolean]
		? T[K][0]["prototype"]
		: T[K] extends typeof Enum
			? T[K]["prototype"]
			: T[K] | Enum;
};

export { type CommandArguments };
