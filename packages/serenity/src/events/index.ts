import { PlayerJoined } from './PlayerJoined';
import { PlayerLeft } from './PlayerLeft';
import { PlayerSpawned } from './PlayerSpawned';

export * from './AbstractEvent';

const SERENITY_EVENTS = [PlayerJoined, PlayerLeft, PlayerSpawned];

export { SERENITY_EVENTS };
