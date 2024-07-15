import type { CommandExecutedSignal } from "./command-executed";
import type { PlayerStartedBreakingBlockSignal } from "./player-started-breaking-block";
import type { PlayerDroppedItemSignal } from "./player-dropped-item";
import type { EntitySpawnedSignal } from "./entity-spawned";
import type { PlayerContainerOpenSignal } from "./player-container-open";
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
	PlayerStartedBreakingBlock: [PlayerStartedBreakingBlockSignal];
	PlayerBreakBlock: [PlayerBreakBlockSignal];
	PlayerContainerOpen: [PlayerContainerOpenSignal];
	PlayerDroppedItem: [PlayerDroppedItemSignal];
	EntitySpawned: [EntitySpawnedSignal];
	CommandExecuted: [CommandExecutedSignal];
}

export { EventSignals };
