import { EntityType } from "./type";

import type { EntityIdentifier } from "./enums";

class CustomEntityType extends EntityType {
	/**
	 * Create a new custom entity type.
	 * @param identifier The identifier of the custom entity type.
	 * @param components The default components of the custom entity type.
	 */
	public constructor(identifier: string, components?: Array<string>) {
		super(identifier as EntityIdentifier, components);
	}
}

export { CustomEntityType };
