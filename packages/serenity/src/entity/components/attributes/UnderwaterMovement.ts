import { Attribute } from '@serenityjs/bedrock-protocol';
import { EntityAttributeComponent } from './Attribute.js';

class EntityUnderwaterMovementComponent extends EntityAttributeComponent {
	/**
	 * The identifier of the component
	 */
	public readonly identifier = Attribute.UnderwaterMovement;

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

export { EntityUnderwaterMovementComponent };
