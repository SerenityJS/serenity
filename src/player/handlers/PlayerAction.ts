import type { PlayerAction } from '@serenityjs/protocol';
import { Action } from '@serenityjs/protocol';
import type { Player } from '../Player';
import { PlayerHandler } from './PlayerHandler';

class PlayerActionHandler extends PlayerHandler {
	public static override handle(packet: PlayerAction, player: Player): void {
		switch (packet.action) {
			case Action.StartSneak:
				player.sneaking = true;
				break;
			case Action.StopSneak:
				player.sneaking = false;
				break;
			case Action.StartBreak: {
				this.logger.debug('Not implemented yet: Action.StartBreak case');
				break;
			}

			case Action.AbortBreak: {
				this.logger.debug('Not implemented yet: Action.AbortBreak case');
				break;
			}

			case Action.StopBreak: {
				this.logger.debug('Not implemented yet: Action.StopBreak case');
				break;
			}

			case Action.GetUpdatedBlock: {
				this.logger.debug('Not implemented yet: Action.GetUpdatedBlock case');
				break;
			}

			case Action.DropItem: {
				this.logger.debug('Not implemented yet: Action.DropItem case');
				break;
			}

			case Action.StartSleeping: {
				this.logger.debug('Not implemented yet: Action.StartSleeping case');
				break;
			}

			case Action.StopSleeping: {
				this.logger.debug('Not implemented yet: Action.StopSleeping case');
				break;
			}

			case Action.Respawn: {
				this.logger.debug('Not implemented yet: Action.Respawn case');
				break;
			}

			case Action.Jump: {
				this.logger.debug('Not implemented yet: Action.Jump case');
				break;
			}

			case Action.StartSprint: {
				this.logger.debug('Not implemented yet: Action.StartSprint case');
				break;
			}

			case Action.StopSprint: {
				this.logger.debug('Not implemented yet: Action.StopSprint case');
				break;
			}

			case Action.CreativePlayerDestroyBlock: {
				this.logger.debug('Not implemented yet: Action.CreativePlayerDestroyBlock case');
				break;
			}

			case Action.DimensionChangeAck: {
				this.logger.debug('Not implemented yet: Action.DimensionChangeAck case');
				break;
			}

			case Action.StartGlide: {
				this.logger.debug('Not implemented yet: Action.StartGlide case');
				break;
			}

			case Action.StopGlide: {
				this.logger.debug('Not implemented yet: Action.StopGlide case');
				break;
			}

			case Action.BuildDenied: {
				this.logger.debug('Not implemented yet: Action.BuildDenied case');
				break;
			}

			case Action.CrackBlock: {
				this.logger.debug('Not implemented yet: Action.CrackBlock case');
				break;
			}

			case Action.ChangeSkin: {
				this.logger.debug('Not implemented yet: Action.ChangeSkin case');
				break;
			}

			case Action.SetEnchantmentSeed: {
				this.logger.debug('Not implemented yet: Action.SetEnchantmentSeed case');
				break;
			}

			case Action.StartSwimming: {
				this.logger.debug('Not implemented yet: Action.StartSwimming case');
				break;
			}

			case Action.StopSwimming: {
				this.logger.debug('Not implemented yet: Action.StopSwimming case');
				break;
			}

			case Action.StartSpinAttack: {
				this.logger.debug('Not implemented yet: Action.StartSpinAttack case');
				break;
			}

			case Action.StopSpinAttack: {
				this.logger.debug('Not implemented yet: Action.StopSpinAttack case');
				break;
			}

			case Action.InteractBlock: {
				this.logger.debug('Not implemented yet: Action.InteractBlock case');
				break;
			}

			case Action.PredictDestroyBlock: {
				this.logger.debug('Not implemented yet: Action.PredictDestroyBlock case');
				break;
			}

			case Action.ContinueDestroyBlock: {
				this.logger.debug('Not implemented yet: Action.ContinueDestroyBlock case');
				break;
			}

			case Action.StartItemUseOn: {
				this.logger.debug('Not implemented yet: Action.StartItemUseOn case');
				break;
			}

			case Action.StopItemUseOn: {
				this.logger.debug('Not implemented yet: Action.StopItemUseOn case');
				break;
			}
		}
	}
}

export { PlayerActionHandler };
