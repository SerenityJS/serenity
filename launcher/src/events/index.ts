import { PlayerChat } from "./player-chat";
import { PlayerJoined } from "./player-joined";
import { PlayerLeft } from "./player-left";
import { PlayerSelectSlot } from "./player-select-slot";
import { PlayerSpawned } from "./player-spawned";
import { Shutdown } from "./shutdown";

export * from "./abstract-event";

const SERENITY_EVENTS = [
	Shutdown,
	PlayerJoined,
	PlayerLeft,
	PlayerSpawned,
	PlayerChat,
	PlayerSelectSlot
];

export { SERENITY_EVENTS };

export * from "./shutdown";
export * from "./player-joined";
export * from "./player-left";
export * from "./player-spawned";
export * from "./player-chat";
export * from "./player-select-slot";
