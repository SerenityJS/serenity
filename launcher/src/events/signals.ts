import type { PlayerChatSignal } from "./player-chat";
import type { PlayerSpawnedSignal } from "./player-spawned";
import type { PlayerJoinedSignal } from "./player-joined";

interface EventSignals {
	PlayerJoined: [PlayerJoinedSignal];
	PlayerSpawned: [PlayerSpawnedSignal];
	PlayerChat: [PlayerChatSignal];
}

export { EventSignals };
