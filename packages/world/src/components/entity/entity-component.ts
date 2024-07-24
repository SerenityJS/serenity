import { ByteTag, CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";
import { type EntityIdentifier, EntityType } from "@serenityjs/entity";

import { Component } from "../component";

import type { Player } from "../../player";
import type { ItemUseOnEntityInventoryTransactionType } from "@serenityjs/protocol";
import type { Entity } from "../../entity";

class EntityComponent extends Component {
	/**
	 * A collective registry of all entity components registered to an entity type.
	 */
	public static readonly registry = new Map<
		EntityIdentifier,
		Array<typeof EntityComponent>
	>();

	/**
	 * A collective registry of all entity components.
	 */
	public static readonly components = new Map<string, typeof EntityComponent>();

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
	 * Registers the entity component to the entity type.
	 * @param type The entity type to register the component to.
	 */
	public static register(type: EntityType): void {
		// Get the components of the entity type.
		const components = EntityComponent.registry.get(type.identifier) ?? [];

		// Push the component to the registry.
		components.push(this);

		// Set the components to the entity type.
		EntityComponent.registry.set(type.identifier, components);
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

	/**
	 * Get a component by its identifier from the registry.
	 * @param identifier The identifier of the component.
	 * @returns The component if found, otherwise null.
	 */
	public static get(identifier: string): typeof EntityComponent | null {
		return EntityComponent.components.get(identifier) as
			| typeof EntityComponent
			| null;
	}

	/**
	 * Get all the components from the registry.
	 * @returns All the components from the registry.
	 */
	public static getAll(): Array<typeof EntityComponent> {
		return [...EntityComponent.components.values()];
	}

	/**
	 * Compresses the component into a compound tag.
	 * @param component The component to compress.
	 * @returns The compressed component.
	 */
	public static compress(component: Component): CompoundTag {
		// Create a new compound tag.
		const tag = new CompoundTag(component.identifier, {});

		// Get the keys and values of the component.
		const keys = Object.keys(component);
		const values = Object.values(component);

		// Iterate over the keys.
		for (const [index, key] of keys.entries()) {
			// Get the key and value.
			const value = values[index];

			// Switch on the type of the value.
			switch (typeof value) {
				case "string": {
					tag.addTag(new StringTag(key, value));
					break;
				}

				case "boolean": {
					tag.addTag(new ByteTag(key, value ? 1 : 0));
					break;
				}

				case "number": {
					tag.addTag(new IntTag(key, value));
					break;
				}
			}
		}

		// Return the tag.
		return tag;
	}

	/**
	 * Decompresses the component from a compound tag.
	 * @param tag The tag to decompress.
	 * @param entity The entity to bind the component to.
	 * @returns The decompressed component.
	 */
	public static decompress(tag: CompoundTag, entity: Entity): EntityComponent {
		// Get the component constructor from the registry.
		// And throw an error if the component is not found.
		const constructor = this.get(tag.name);
		if (!constructor) throw new Error(`Component ${tag.name} not found.`);

		// Construct the component with the entity and the identifier.
		const component = new constructor(entity, tag.name) as unknown as Record<
			string,
			unknown
		>;

		// Iterate over the tags.
		for (const entry of tag.getTags()) {
			const key = entry.name;

			if (entry instanceof StringTag) {
				component[key] = entry.value;
			}

			if (entry instanceof ByteTag) {
				component[key] = entry.value === 1;
			}

			if (entry instanceof IntTag) {
				component[key] = entry.value;
			}
		}

		// Return the component.
		return component as unknown as EntityComponent;
	}

	public static bind(): void {
		// Bind the component to the entity types.
		for (const identifier of this.types) {
			// Get the entity type.
			const type = EntityType.get(identifier);

			// Register the component to the entity type.
			if (type) this.register(type);
		}

		// Register the component.
		EntityComponent.components.set(this.identifier, this);
	}
}

export { EntityComponent };
