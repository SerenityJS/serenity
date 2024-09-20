import { Component } from "../component";

import type { World } from "../../world";
import type { EntityIdentifier } from "@serenityjs/entity";
import type { CompoundTag } from "@serenityjs/nbt";
import type { EntityInteractType } from "../../enums";
import type { Player } from "../../player";
import type { Entity } from "../../entity";

class EntityComponent extends Component {
	/**
	 * The entity type identifiers to bind the component to.
	 */
	public static readonly types: Array<EntityIdentifier> = [];

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
	public onInteract?(player: Player, type: EntityInteractType): void;

	/**
	 * Register the entity component to a world.
	 * @param world The world to register the entity component to.
	 * @returns True if the entity component was registered, false otherwise.
	 */
	public static register(world: World): boolean {
		return world.entities.registerComponent(this);
	}

	/**
	 * Serializes the entity component to the NBT tag.
	 * @param nbt The NBT tag to serialize to.
	 * @param component The entity component to serialize
	 */
	public static serialize(
		_nbt: CompoundTag,
		_component: EntityComponent
	): void {
		return;
	}

	/**
	 * Deserializes the entity component from the NBT tag.
	 * @param nbt The NBT tag to deserialize from.
	 * @param entity The entity to deserialize the component to.
	 * @returns A new entity component.
	 */
	public static deserialize(
		_nbt: CompoundTag,
		_entity: Entity
	): EntityComponent {
		return new this(_entity, this.identifier);
	}
}

export { EntityComponent };
