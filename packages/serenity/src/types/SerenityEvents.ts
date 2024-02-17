import type { PlayerChat, PlayerJoined, PlayerLeft, PlayerSpawned, Shutdown } from '../events/index.js';

interface SerenityEvents {
	PlayerChat: [PlayerChat];
	PlayerJoined: [PlayerJoined];
	PlayerLeft: [PlayerLeft];
	PlayerSpawned: [PlayerSpawned];
	Shutdown: [Shutdown];
}

export type { SerenityEvents };
