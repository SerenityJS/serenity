import type { BlockPickRequest } from '@serenityjs/bedrock-protocol';
import type { Player } from '../../../../player';
import { Block } from './Block';

/**
 * Represents the grass block.
 */
class Grass extends Block {
	public static readonly id = 'minecraft:grass';

	public static override onBlockPick(player: Player, packet: BlockPickRequest): void {
		player.sendMessage(`You picked grass at ${packet.x} ${packet.y} ${packet.z}!`);
	}
}

export { Grass };
