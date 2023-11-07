import { FormTypes, ModalFormRequest } from '@serenityjs/protocol';
import type { Player } from '../player';
import { Form } from './Form';

interface ActionFormButton {
	image?: ActionFormImage;
	text: string;
}

interface ActionFormImage {
	data: string;
	type: 'path' | 'url';
}

class ActionForm extends Form {
	public readonly type = FormTypes.Action;
	public readonly target: Player;
	public readonly buttons: ActionFormButton[] = [];
	public title: string;
	public content: string;

	public constructor(target?: Player) {
		super();
		this.target = target!;
		this.title = '';
		this.content = '';
	}

	public toString(): string {
		return JSON.stringify({
			type: this.type,
			title: this.title,
			content: this.content,
			buttons: this.buttons,
		});
	}

	public addButton(text: string, image?: ActionFormImage): void {
		this.buttons.push({ text, image });
	}

	public async send(): Promise<number | null> {
		return new Promise((resolve) => {
			const packet = new ModalFormRequest();
			packet.id = this.target.world.forms.generateId();
			packet.data = this.toString();
			this.target.world.forms.set(packet.id, {
				callback: resolve,
				type: this.type,
			});
			this.target.sendPacket(packet);
		});
	}
}

export { ActionForm };
