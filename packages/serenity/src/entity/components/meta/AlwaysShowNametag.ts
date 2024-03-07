import { MetadataFlags, MetadataKey, MetadataType } from '@serenityjs/bedrock-protocol';
import { EntityMetaComponent } from './Meta.js';

class EntityAlwaysShowNametagComponent extends EntityMetaComponent {
	public readonly identifier = 'minecraft:always_show_nametag';

	public readonly flag = false;

	public readonly key = MetadataKey.AlwaysShowNametag;

	public readonly type = MetadataType.Byte;

	public defaultValue = true;

	public currentValue = this.defaultValue;
}

export { EntityAlwaysShowNametagComponent };
