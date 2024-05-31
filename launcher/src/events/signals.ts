import type { PlayerBreakBlockSignal } from "./player-break-block";
import type { PlayerJoinedSignal } from "./player-joined";
import type { PlayerSpawnedSignal } from "./player-spawned";
import type { PlayerChatSignal } from "./player-chat";
import type { PlayerPlaceBlockSignal } from "./player-place-block";

interface EventSignals {
	PlayerJoined: [PlayerJoinedSignal];
	PlayerSpawned: [PlayerSpawnedSignal];
	PlayerChat: [PlayerChatSignal];
	PlayerPlaceBlock: [PlayerPlaceBlockSignal];
	PlayerBreakBlock: [PlayerBreakBlockSignal];
}

export { EventSignals };
