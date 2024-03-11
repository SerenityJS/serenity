import type {
	PlayerChat,
	PlayerJoined,
	PlayerLeft,
	PlayerSelectSlot,
	PlayerSpawned,
	Shutdown
} from "../events";

interface SerenityEvents {
	PlayerChat: [PlayerChat];
	PlayerJoined: [PlayerJoined];
	PlayerLeft: [PlayerLeft];
	PlayerSelectSlot: [PlayerSelectSlot];
	PlayerSpawned: [PlayerSpawned];
	Shutdown: [Shutdown];
}

export type { SerenityEvents };
