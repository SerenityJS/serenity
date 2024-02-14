import { PlayerChat } from './PlayerChat';
import { PlayerJoined } from './PlayerJoined';
import { PlayerLeft } from './PlayerLeft';
import { PlayerSpawned } from './PlayerSpawned';
import { Shutdown } from './Shutdown';

export * from './AbstractEvent';

const SERENITY_EVENTS = [Shutdown, PlayerJoined, PlayerLeft, PlayerSpawned, PlayerChat];

export { SERENITY_EVENTS };

export * from './Shutdown';
export * from './PlayerJoined';
export * from './PlayerLeft';
export * from './PlayerSpawned';
export * from './PlayerChat';
