import { Component } from "../component";

import type { Entity } from "../../entity";

class EntityComponent extends Component {
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
	 * Called when the entity is spawned into the dimension.
	 */
	public onSpawn?(): void;

	/**
	 * Called when the entity is despawned from the dimension.
	 */
	public onDespawn?(): void;

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
