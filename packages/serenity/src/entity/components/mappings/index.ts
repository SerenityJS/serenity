// This file maps all the components to their respective entity identifier.
// NOTE: If an specific entity does not have a component set, it will contain a generic set of components.

import { GENERIC_COMPONENTS } from './Generic.js';
import { PLAYER_COMPONENTS } from './Player.js';

const ENTITY_COMPONENTS = {
	'minecraft:generic': GENERIC_COMPONENTS,
	'minecraft:player': PLAYER_COMPONENTS,
};

export { ENTITY_COMPONENTS };
