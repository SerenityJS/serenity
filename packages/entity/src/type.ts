import type { EntityIdentifier } from "./enums";

class EntityType {
	/**
	 * A collective registry of all entity types.
	 */
	public static readonly types = new Map<string, EntityType>();

	/**
	 * The identifier of the entity type.
	 */
	public readonly identifier: EntityIdentifier;

	/**
	 * The default components of the entity type.
	 */
	public readonly components: Array<string>;

	/**
	 * Create a new entity type.
	 * @param identifier The identifier of the entity type.
	 * @param components The default components of the entity type.
	 */
	public constructor(identifier: EntityIdentifier, components?: Array<string>) {
		this.identifier = identifier;
		this.components = components ?? [];
	}

	/**
	 * Get the entity type from the registry.
	 * @param identifier The identifier of the entity type.
	 * @returns The entity type, if found; otherwise, null.
	 */
	public static get(identifier: EntityIdentifier): EntityType | null {
		return EntityType.types.get(identifier) as EntityType;
	}

	/**
	 * Get all entity types from the registry.
	 * @returns An array of all entity types.
	 */
	public static getAll(): Array<EntityType> {
		return [...EntityType.types.values()];
	}
}

export { EntityType };
