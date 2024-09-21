import { type EntityIdentifier, EntityType } from "@serenityjs/entity";

import {
	type EntityComponent,
	ENTITY_COMPONENTS,
	type PlayerComponent,
	PLAYER_COMPONENTS
} from "../components";

class EntityPalette {
	/**
	 * The types of entities registered in the palette.
	 */
	public readonly types = EntityType.types;

	/**
	 * The components registered in the palette.
	 */
	public readonly components = new Map<
		string,
		typeof EntityComponent | typeof PlayerComponent
	>();

	/**
	 * The registry for the entity components.
	 */
	public readonly registry = new Map<
		EntityIdentifier,
		Array<typeof EntityComponent | typeof PlayerComponent>
	>();

	/**
	 * Creates a new entity palette.
	 */
	public constructor() {
		// Register all entity components.
		for (const component of ENTITY_COMPONENTS)
			this.registerComponent(component);

		// Register all player components.
		for (const component of PLAYER_COMPONENTS)
			this.registerComponent(component);
	}

	/**
	 * Gets all entity types from the palette.
	 * @returns All entity types from the palette.
	 */
	public getAllTypes(): Array<EntityType> {
		return [...this.types.values()];
	}

	/**
	 * Gets an entity type from the palette.
	 * @param identifier The entity identifier to get.
	 * @returns The entity type from the palette.
	 */
	public getType(identifier: string): EntityType | null {
		return this.types.get(identifier) as EntityType;
	}

	/**
	 * Get the registry for the given entity identifier.
	 * @param identifier The entity identifier to get the registry for.
	 * @returns The registry for the given entity identifier.
	 */
	public getRegistryFor(
		identifier: EntityIdentifier
	): Array<typeof EntityComponent> {
		// Get the registry for the given entity identifier.
		const registry = this.registry.get(identifier) || [];

		// Return the registry.
		return registry as Array<typeof EntityComponent>;
	}

	/**
	 * Register a component to the palette.
	 * @param component The component to register.
	 * @returns True if the component was registered, false otherwise.
	 */
	public registerComponent(
		component: typeof EntityComponent | typeof PlayerComponent
	): boolean {
		// Check if the entity component is already registered.
		if (this.components.has(component.identifier)) return false;

		// Register the entity component.
		this.components.set(component.identifier, component);

		// Iterate over the types of the component.
		for (const type of component.types) {
			// Check if the registry has the entity identifier.
			if (!this.registry.has(type))
				// Set the registry for the entity identifier.
				this.registry.set(type, []);

			// Get the registry for the entity identifier.
			const registry = this.registry.get(type);

			// Check if the registry exists.
			if (registry) {
				// Push the component to the registry.
				registry.push(component);

				// Set the registry for the entity identifier.
				this.registry.set(type, registry);
			}
		}

		// Return true if the entity component was registered.
		return true;
	}

	/**
	 * Remove a component from the palette.
	 * @param identifier The identifier of the component.
	 * @returns True if the component was removed, false otherwise.
	 */
	public removeComponent(identifier: string): boolean {
		// Check if the component exists.
		if (!this.components.has(identifier)) return false;

		// Get the component.
		const component = this.components.get(identifier);

		// Check if the component exists.
		if (!component) return false;

		// Iterate over the types of the component.
		for (const type of component.types) {
			// Get the registry for the entity identifier.
			const registry = this.registry.get(type);

			// Check if the registry exists.
			if (registry) {
				// Remove the component from the registry.
				this.registry.set(
					type,
					registry.filter((c) => c !== component)
				);
			}
		}

		// Remove the component from the palette.
		this.components.delete(identifier);

		// Return true if the component was removed.
		return true;
	}

	/**
	 * Get all components from the palette.
	 * @returns
	 */
	public getAllComponents(): Array<
		typeof EntityComponent | typeof PlayerComponent
	> {
		return [...this.components.values()];
	}

	/**
	 * Get a component from the palette.
	 * @param identifier The identifier of the component.
	 * @returns The component from the palette.
	 */
	public getComponent(
		identifier: string
	): typeof EntityComponent | typeof PlayerComponent | null {
		return this.components.get(identifier) || null;
	}
}

export { EntityPalette };
