import { EntityComponent } from '../../entity/index.js';
import type { Player } from '../Player.js';

abstract class PlayerComponent extends EntityComponent {
	/**
	 * Initializes the component.
	 *
	 * @param player - The player this component is attached to.
	 */
	public constructor(player: Player) {
		super(player);
	}
}

export { PlayerComponent };
