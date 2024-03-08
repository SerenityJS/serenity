import { MetadataFlags, MetadataType } from '@serenityjs/bedrock-protocol';
import { EntityMetaComponent } from './Meta.js';

class EntityBreathingComponent extends EntityMetaComponent {
	public readonly identifier = 'minecraft:breathing';

	public readonly flag = true;

	public readonly key = MetadataFlags.Breathing;

	public readonly type = MetadataType.Long;

	public defaultValue = true;

	public currentValue = this.defaultValue;
}

export { EntityBreathingComponent };
