import { PlayerChat } from './PlayerChat.js';
import { PlayerJoined } from './PlayerJoined.js';
import { PlayerLeft } from './PlayerLeft.js';
import { PlayerSelectSlot } from './PlayerSelectSlot.js';
import { PlayerSpawned } from './PlayerSpawned.js';
import { Shutdown } from './Shutdown.js';

export * from './AbstractEvent.js';

const SERENITY_EVENTS = [Shutdown, PlayerJoined, PlayerLeft, PlayerSpawned, PlayerChat, PlayerSelectSlot];

export { SERENITY_EVENTS };

export * from './Shutdown.js';
export * from './PlayerJoined.js';
export * from './PlayerLeft.js';
export * from './PlayerSpawned.js';
export * from './PlayerChat.js';
export * from './PlayerSelectSlot.js';
