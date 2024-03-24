import { Attribute } from "@serenityjs/protocol";

import { EntityAttributeComponent } from "./attribute";

class EntityMovementComponent extends EntityAttributeComponent {
	/**
	 * The identifier of the component
	 */
	public readonly identifier = Attribute.Movement;

	/**
	 * The minimum health allowed for the entity.
	 */
	public readonly effectiveMin = 0;

	/**
	 * The maximum health allowed for the entity.
	 */
	public readonly effectiveMax = 3.402_823_466e+38;

	/**
	 * The default health for the entity.
	 */
	public readonly defaultValue = 0.1;

	/**
	 * The current health of the entity.
	 */
	public currentValue = this.defaultValue;
}

export { EntityMovementComponent };
