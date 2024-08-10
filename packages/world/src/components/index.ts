/* eslint-disable import/order */
export * from "./component";
export * from "./entity";
export * from "./player";
export * from "./item";
export * from "./block";

//
// Register all valid entity components.
//
import * as EntityComponents from "./entity";
for (const key in EntityComponents) {
	// Get the entity component.
	const value = EntityComponents[key as keyof typeof EntityComponents];

	// Bind the component to the registry.
	value.bind();
}

//
// Register all valid player components.
//
import * as PlayerComponents from "./player";
for (const key in PlayerComponents) {
	// Get the player component.
	const value = PlayerComponents[key as keyof typeof PlayerComponents];

	// Bind the component to the registry.
	value.bind();
}

//
// Register all valid item components.
//
import * as ItemComponents from "./item";
for (const key in ItemComponents) {
	// Get the item component.
	const value = ItemComponents[key as keyof typeof ItemComponents];

	// Iterate over the item types.
	value.bind();
}

//
// Register all valid block components.
//
import * as BlockComponents from "./block";
for (const key in BlockComponents) {
	// Get the block component.
	const value = BlockComponents[key as keyof typeof BlockComponents];

	// Bind the component to the registry.
	value.bind();
}
