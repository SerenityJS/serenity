export * from "./component";
export * from "./entity";
export * from "./player";
export * from "./item";
export * from "./block";

//
// Register all valid entity components.
//
import { EntityComponent } from "./entity";
import * as EntityComponents from "./entity";
for (const key in EntityComponents) {
	const value = EntityComponents[key as keyof typeof EntityComponents];

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

	// Register the component to the collective registry.
	ItemComponent.components.set(value.identifier, value as typeof ItemComponent);
}
