import { MetadataKey, MetadataType } from '@serenityjs/bedrock-protocol';
import { EntityMetaComponent } from './Meta.js';

class EntityScaleComponent extends EntityMetaComponent {
	public readonly identifier = 'minecraft:scale';

	public readonly flag = false;

	public readonly key = MetadataKey.Scale;

	public readonly type = MetadataType.Float;

	public defaultValue = 1;

	public currentValue = this.defaultValue;
}

export { EntityScaleComponent };
