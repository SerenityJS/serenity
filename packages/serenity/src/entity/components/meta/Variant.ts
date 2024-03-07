import { MetadataKey, MetadataType } from '@serenityjs/bedrock-protocol';
import { EntityMetaComponent } from './Meta.js';

class EntityVariantComponent extends EntityMetaComponent {
	public readonly identifier = 'minecraft:variant';

	public readonly flag = false;

	public readonly key = MetadataKey.Variant;

	public readonly type = MetadataType.Int;

	public defaultValue = 0;

	public currentValue = this.defaultValue;
}

export { EntityVariantComponent };
