// This file maps all the components to their respective entity identifier.
// NOTE: If an specific entity does not have a component set, it will contain a generic set of components.

import { GENERIC_COMPONENTS } from "./generic";
import { PLAYER_COMPONENTS } from "./player";

const ENTITY_COMPONENTS = {
	"minecraft:generic": GENERIC_COMPONENTS,
	"minecraft:player": PLAYER_COMPONENTS
};

export { ENTITY_COMPONENTS };
