import { Attribute } from '@serenityjs/bedrock-protocol';
import { EntityAttributeComponent } from './Attribute.js';

class EntityHealthComponent extends EntityAttributeComponent {
	/**
	 * The type of the component
	 */
	public readonly type = Attribute.Health;

	/**
	 * The minimum health allowed for the entity.
	 */
	public readonly effectiveMin = 0;

	/**
	 * The maximum health allowed for the entity.
	 */
	public readonly effectiveMax = 20;

	/**
	 * The default health for the entity.
	 */
	public readonly defaultValue = 20;

	/**
	 * The current health of the entity.
	 */
	public currentValue = this.defaultValue;
}

export { EntityHealthComponent };
