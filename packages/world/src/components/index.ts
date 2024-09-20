import * as EntityComponents from "./entity";
import * as PlayerComponents from "./player";
import * as ItemComponents from "./item";
import * as BlockComponents from "./block";

const ENTITY_COMPONENTS: Array<typeof EntityComponents.EntityComponent> = [];
const PLAYER_COMPONENTS: Array<typeof PlayerComponents.PlayerComponent> = [];
const ITEM_COMPONENTS: Array<typeof ItemComponents.ItemComponent> = [];
const BLOCK_COMPONENTS: Array<typeof BlockComponents.BlockComponent> = [];

for (const key in EntityComponents) {
	// Get the entity component.
	const value = EntityComponents[key as keyof typeof EntityComponents];

	// Push the entity component to the registry.
	ENTITY_COMPONENTS.push(value as typeof EntityComponents.EntityComponent);
}

for (const key in PlayerComponents) {
	// Get the player component.
	const value = PlayerComponents[key as keyof typeof PlayerComponents];

	// Push the player component to the registry.
	PLAYER_COMPONENTS.push(value as typeof PlayerComponents.PlayerComponent);
}

//
// Register all valid item components.
//
for (const key in ItemComponents) {
	// Get the item component.
	const value = ItemComponents[key as keyof typeof ItemComponents];

	// Push the item component to the registry.
	ITEM_COMPONENTS.push(value as typeof ItemComponents.ItemComponent);

	// Iterate over the item types.
	value.bind();
}

//
// Register all valid block components.
//
for (const key in BlockComponents) {
	// Get the block component.
	const value = BlockComponents[key as keyof typeof BlockComponents];

	// Push the block component to the registry.
	BLOCK_COMPONENTS.push(value as typeof BlockComponents.BlockComponent);
}

export * from "./component";
export * from "./entity";
export * from "./player";
export * from "./item";
export * from "./block";
export {
	ENTITY_COMPONENTS,
	PLAYER_COMPONENTS,
	ITEM_COMPONENTS,
	BLOCK_COMPONENTS
};
