import type { PlayerChat, PlayerJoined, PlayerLeft, PlayerSpawned } from '../events';

interface SerenityEvents {
	PlayerChat: [PlayerChat];
	PlayerJoined: [PlayerJoined];
	PlayerLeft: [PlayerLeft];
	PlayerSpawned: [PlayerSpawned];
}

export type { SerenityEvents };
