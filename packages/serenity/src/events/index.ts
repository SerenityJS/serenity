import { PlayerChat } from './PlayerChat';
import { PlayerJoined } from './PlayerJoined';
import { PlayerLeft } from './PlayerLeft';
import { PlayerSpawned } from './PlayerSpawned';

export * from './AbstractEvent';

const SERENITY_EVENTS = [PlayerJoined, PlayerLeft, PlayerSpawned, PlayerChat];

export { SERENITY_EVENTS };

export * from './PlayerJoined';
export * from './PlayerLeft';
export * from './PlayerSpawned';
export * from './PlayerChat';
