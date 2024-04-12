import { ENTITY_TYPES } from "@serenityjs/data";

import { EntityType } from "./type";

import type { EntityIdentifier } from "./enums";

// Iterate over the entity types and register them.
for (const type of ENTITY_TYPES) {
	// Create a new entity type.
	const entityType = new EntityType(
		type.identifier as EntityIdentifier,
		type.components
	);

	// Register the entity type.
	EntityType.types.set(type.identifier, entityType);
}
