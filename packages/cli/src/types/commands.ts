interface PluginCommandOptions {
	bundle?: boolean;
	create?: boolean;
	[key: string]: unknown;
}

interface StartCommandOptions {
	maxMemory?: number;
	[key: string]: unknown;
}

interface CreateCommandOptions {
	beta?: boolean;
	[key: string]: unknown;
}

export { PluginCommandOptions, CreateCommandOptions, StartCommandOptions };
