import { Attribute } from "@serenityjs/protocol";

import { EntityAttributeComponent } from "./attribute";

class EntityLavaMovementComponent extends EntityAttributeComponent {
	/**
	 * The identifier of the component
	 */
	public readonly identifier = Attribute.LavaMovement;

	/**
	 * The minimum speed allowed for the entity.
	 */
	public readonly effectiveMin = 0;

	/**
	 * The maximum speed allowed for the entity.
	 */
	public readonly effectiveMax = 3.402_823_466e+38;

	/**
	 * The default speed for the entity.
	 */
	public readonly defaultValue = 0.02;

	/**
	 * The placeholder for the current speed of the entity.
	 */
	public currentValue = this.defaultValue;
}

export { EntityLavaMovementComponent };
