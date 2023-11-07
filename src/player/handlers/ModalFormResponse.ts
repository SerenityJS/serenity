import { FormTypes, type ModalFormResponse } from '@serenityjs/protocol';
import type { Player } from '../Player';
import { PlayerHandler } from './PlayerHandler';

class ModalFormResponseHandler extends PlayerHandler {
	public static override handle(packet: ModalFormResponse, player: Player): void {
		const form = player.world.forms.get(packet.id);
		if (!form) return this.logger.error(`Form ${packet.id} not found`);

		// If the form was canceled, call the callback with null
		if (packet.canceled) return form.callback(null);

		// Trim the last 2 characters because it's a line return
		const trimed = packet.data.slice(0, packet.data.length - 1);

		// Switch on the form type
		switch (form.type) {
			case FormTypes.Modal: {
				const json = JSON.parse(trimed);
				return form.callback(json);
			}

			case FormTypes.Message: {
				// Message forms return with a boolean
				// Basically, if the first button was pressed, it returns true
				// If the second button was pressed, it returns false
				// If the form was canceled, it returns null
				const bool = trimed === 'true';
				return form.callback(bool);
			}

			case FormTypes.Action: {
				// Action forms return with a number
				// Basically, if the first button was pressed, it returns 0
				// If the second button was pressed, it returns 1
				// If the third button was pressed, it returns 2
				// If the fourth button was pressed, it returns 3. And so on...
				const number = Number(trimed);
				return form.callback(number);
			}
		}
	}
}

export { ModalFormResponseHandler };
