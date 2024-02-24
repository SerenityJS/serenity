import { Attribute } from '@serenityjs/bedrock-protocol';
import { EntityAttributeComponent } from './Attribute.js';

class EntityMovementComponent extends EntityAttributeComponent {
	/**
	 * The attribute this component represents.
	 */
	public readonly attribute = Attribute.Movement;

	/**
	 * The type of the component
	 */
	public readonly type = 'minecraft:movement';

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
	public readonly defaultValue = 0.1;

	/**
	 * The placeholder for the current speed of the entity.
	 */
	public currentValue = this.defaultValue;
}

export { EntityMovementComponent };
