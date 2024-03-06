import { MetadataKey, MetadataType } from '@serenityjs/bedrock-protocol';
import { EntityMetaComponent } from './Meta.js';

class EntityScaleComponent extends EntityMetaComponent {
	public readonly type = 'minecraft:scale';

	public readonly flag = false;

	public readonly key = MetadataKey.Scale;

	public readonly dataType = MetadataType.Float;

	public defaultValue = 1;

	public currentValue = this.defaultValue;
}

export { EntityScaleComponent };
