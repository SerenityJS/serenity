import type { Player } from '../player';

interface SerenityEvents {
	PlayerJoined: [Player];
	PlayerLeft: [Player];
	PlayerSpawned: [Player];
}

export type { SerenityEvents };
