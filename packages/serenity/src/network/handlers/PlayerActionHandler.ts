import type { PlayerAction } from '@serenityjs/bedrock-protocol';
import { ActionIds, DisconnectReason } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class PlayerActionHandler extends NetworkHandler {
	public static override async handle(packet: PlayerAction, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// console.log(packet);

		// switch (packet.ActionType) {
		// 	case ActionIds.StartBreak:
		// 		console.log('Received PlayerAction StartBreak');
		// 		break;
		// 	case ActionIds.AbortBreak:
		// 		console.log('Received PlayerAction AbortBreak');
		// 		break;
		// 	case ActionIds.StopBreak:
		// 		console.log('Received PlayerAction StopBreak');
		// 		break;
		// 	case ActionIds.GetUpdatedBlock:
		// 		console.log('Received PlayerAction GetUpdatedBlock');
		// 		break;
		// 	case ActionIds.DropItem:
		// 		console.log('Received PlayerAction DropItem');
		// 		break;
		// 	case ActionIds.StartSleeping:
		// 		console.log('Received PlayerAction StartSleeping');
		// 		break;
		// 	case ActionIds.StopSleeping:
		// 		console.log('Received PlayerAction StopSleeping');
		// 		break;
		// 	case ActionIds.Respawn:
		// 		console.log('Received PlayerAction Respawn');
		// 		break;
		// 	case ActionIds.Jump:
		// 		console.log('Received PlayerAction Jump');
		// 		break;
		// 	case ActionIds.StartSprint:
		// 		console.log('Received PlayerAction StartSprint');
		// 		break;
		// 	case ActionIds.StopSprint:
		// 		console.log('Received PlayerAction StopSprint');
		// 		break;
		// 	case ActionIds.StartSneak:
		// 		console.log('Received PlayerAction StartSneak');
		// 		break;
		// 	case ActionIds.StopSneak:
		// 		console.log('Received PlayerAction StopSneak');
		// 		break;
		// 	case ActionIds.CreativePlayerDestroyBlock:
		// 		console.log('Received PlayerAction CreativePlayerDestroyBlock');
		// 		break;
		// 	case ActionIds.DimensionChangeAck:
		// 		console.log('Received PlayerAction DimensionChangeAck');
		// 		break;
		// 	case ActionIds.StartGlide:
		// 		console.log('Received PlayerAction StartGlide');
		// 		break;
		// 	case ActionIds.StopGlide:
		// 		console.log('Received PlayerAction StopGlide');
		// 		break;
		// 	case ActionIds.BuildDenied:
		// 		console.log('Received PlayerAction BuildDenied');
		// 		break;
		// 	case ActionIds.CrackBreak:
		// 		console.log('Received PlayerAction CrackBreak');
		// 		break;
		// 	case ActionIds.ChangeSkin:
		// 		console.log('Received PlayerAction ChangeSkin');
		// 		break;
		// 	case ActionIds.SetEnchantmentSeed:
		// 		console.log('Received PlayerAction SetEnchantmentSeed');
		// 		break;
		// 	case ActionIds.Swimming:
		// 		console.log('Received PlayerAction Swimming');
		// 		break;
		// 	case ActionIds.StopSwimming:
		// 		console.log('Received PlayerAction StopSwimming');
		// 		break;
		// 	case ActionIds.StartSpinAttack:
		// 		console.log('Received PlayerAction StartSpinAttack');
		// 		break;
		// 	case ActionIds.StopSpinAttack:
		// 		console.log('Received PlayerAction StopSpinAttack');
		// 		break;
		// 	case ActionIds.InteractBlock:
		// 		console.log('Received PlayerAction InteractBlock');
		// 		break;
		// 	case ActionIds.PredictBreak:
		// 		console.log('Received PlayerAction PredictBreak');
		// 		break;
		// 	case ActionIds.ContinueBreak:
		// 		console.log('Received PlayerAction ContinueBreak');
		// 		break;
		// 	case ActionIds.StartItemUseOn:
		// 		console.log('Received PlayerAction StartItemUseOn');
		// 		break;
		// 	case ActionIds.StopItemUseOn:
		// 		console.log('Received PlayerAction StopItemUseOn');
		// 		break;
		// 	case ActionIds.HandledTeleport:
		// 		console.log('Received PlayerAction HandledTeleport');
		// 		break;
		// 	case ActionIds.MissedSwing:
		// 		console.log('Received PlayerAction MissedSwing');
		// 		break;
		// 	case ActionIds.StartCrawling:
		// 		console.log('Received PlayerAction StartCrawling');
		// 		break;
		// 	case ActionIds.StopCrawling:
		// 		console.log('Received PlayerAction StopCrawling');
		// 		break;
		// 	case ActionIds.StartFlying:
		// 		console.log('Received PlayerAction StartFlying');
		// 		break;
		// 	case ActionIds.StopFlying:
		// 		console.log('Received PlayerAction StopFlying');
		// 		break;
		// 	case ActionIds.ReceivedServerData:
		// 		console.log('Received PlayerAction ReceivedServerData');
		// 		break;
		// 	default:
		// 		console.log(`Unhandled action: ${packet.ActionType}`);
		// }
	}
}

export { PlayerActionHandler };
