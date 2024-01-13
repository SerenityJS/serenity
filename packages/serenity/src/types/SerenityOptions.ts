import type { SerenityEvents } from './SerenityEvents';

interface SerenityOptions {
	address: string;
	debug?: boolean;
	port?: number;
	protocol?: number;
	version?: string;
}

export type { SerenityOptions };
