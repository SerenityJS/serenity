import { EntityAttributeComponent } from '../../../entity/index.js';
import type { Player } from '../../Player.js';

abstract class PlayerAttributeComponent extends EntityAttributeComponent {
	/**
	 * Initializes the component.
	 *
	 * @param player - The player this component is attached to.
	 */
	public constructor(player: Player) {
		super(player);
	}
}

export { PlayerAttributeComponent };
