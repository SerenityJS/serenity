/* eslint-disable import/order */
export * from "./component";
export * from "./entity";
export * from "./player";
export * from "./item";
export * from "./block";

import { ItemType } from "@serenityjs/item";
//
// Register all valid entity components.
//
import { EntityComponent } from "./entity";
import * as EntityComponents from "./entity";
for (const key in EntityComponents) {
	const value = EntityComponents[key as keyof typeof EntityComponents];

	// Iterate over the entity types.
	for (const identifier of value.types) {
		// Get the entity type.
		const type = EntityType.get(identifier);

		// Check if the entity type exists.
		if (!type) continue;

		// Register the component to the entity type.
		value.register(type);
	}

	// Register the component to the collective registry.
	EntityComponent.components.set(
		value.identifier,
		value as typeof EntityComponent
	);
}

//
// Register all valid item components.
//
import { ItemComponent } from "./item";
import * as ItemComponents from "./item";
for (const key in ItemComponents) {
	const value = ItemComponents[key as keyof typeof ItemComponents];

	// Iterate over the item types.
	for (const identifier of value.types) {
		// Get the item type.
		const type = ItemType.get(identifier);

		// Check if the item type exists.
		if (!type) continue;

		// Register the component to the item type.
		value.register(type);
	}

	// Register the component to the collective registry.
	ItemComponent.components.set(value.identifier, value as typeof ItemComponent);
}

//
// Register all valid block components.
//
import { BlockComponent } from "./block";
import * as BlockComponents from "./block";
import { BlockType } from "@serenityjs/block";
import { EntityType } from "@serenityjs/entity";
for (const key in BlockComponents) {
	const value = BlockComponents[key as keyof typeof BlockComponents];

	// Iterate over the block types.
	for (const identifier of value.types) {
		// Get the block type.
		const type = BlockType.get(identifier);

		// Check if the block type exists.
		if (!type) continue;

		// Register the component to the block type.
		value.register(type);
	}

	// Register the component to the collective registry.
	BlockComponent.components.set(
		value.identifier,
		value as typeof BlockComponent
	);
}
