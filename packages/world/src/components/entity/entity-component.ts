import { Component } from "../component";

import type { Player } from "../../player";
import type { ItemUseOnEntityInventoryTransactionType } from "@serenityjs/protocol";
import type { EntityType } from "@serenityjs/entity";
import type { Entity } from "../../entity";

class EntityComponent extends Component {
	/**
	 * A collective registry of all entity components registered to an entity type.
	 */
	public static readonly registry = new Map<
		EntityType,
		Array<typeof EntityComponent>
	>();

	/**
	 * A collective registry of all entity components.
	 */
	public static readonly components = new Map<string, typeof EntityComponent>();

	/**
	 * The entity the component is binded to.
	 */
	protected readonly entity: Entity;

	/**
	 * Creates a new entity component.
	 *
	 * @param entity The entity the component is binded to.
	 * @param identifier The identifier of the component.
	 * @returns A new entity component.
	 */
	public constructor(entity: Entity, identifier: string) {
		super(identifier);
		this.entity = entity;

		// Register the component to the entity.
		this.entity.components.set(this.identifier, this);
	}

	/**
	 * Clones the entity component.
	 * @param entity The entity to clone the component to.
	 * @returns A new entity component.
	 */
	public clone(entity: Entity): this {
		// Create a new instance of the component.
		const component = new (this.constructor as new (
			entity: Entity,
			identifier: string
		) => EntityComponent)(entity, this.identifier) as this;

		// Copy the key-value pairs.
		for (const [key, value] of Object.entries(this)) {
			// Skip the entity.
			if (key === "entity") continue;

			// @ts-expect-error
			component[key] = value;
		}

		// Return the component.
		return component;
	}

	/**
	 * Registers the entity component to the entity type.
	 * @param type The entity type to register the component to.
	 */
	public static register(type: EntityType): void {
		// Get the components of the entity type.
		const components = EntityComponent.registry.get(type) ?? [];

		// Push the component to the registry.
		components.push(this);

		// Set the components to the entity type.
		EntityComponent.registry.set(type, components);
	}

	/**
	 * Called when the entity is spawned into the dimension.
	 */
	public onSpawn?(): void;

	/**
	 * Called when the entity is despawned from the dimension.
	 */
	public onDespawn?(): void;

	/**
	 * Called when the entity is interacted by a player.
	 * @param player The player interacting with the entity.
	 * @param type The type of the item use on entity inventory transaction.
	 */
	public onInteract?(
		player: Player,
		type: ItemUseOnEntityInventoryTransactionType
	): void;

	public static get(identifier: string): typeof EntityComponent | null {
		return EntityComponent.components.get(identifier) as
			| typeof EntityComponent
			| null;
	}

	public static getAll(): Array<typeof EntityComponent> {
		return [...EntityComponent.components.values()];
	}
}

export { EntityComponent };
