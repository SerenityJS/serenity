import type {
	PlayerChat,
	PlayerJoined,
	PlayerLeft,
	PlayerSelectSlot,
	PlayerSpawned,
	Shutdown,
} from '../events/index.js';

interface SerenityEvents {
	PlayerChat: [PlayerChat];
	PlayerJoined: [PlayerJoined];
	PlayerLeft: [PlayerLeft];
	PlayerSelectSlot: [PlayerSelectSlot];
	PlayerSpawned: [PlayerSpawned];
	Shutdown: [Shutdown];
}

export type { SerenityEvents };
