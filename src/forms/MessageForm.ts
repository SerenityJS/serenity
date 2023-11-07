import { FormTypes, ModalFormRequest } from '@serenityjs/protocol';
import type { Player } from '../player';
import { Form } from './Form';

class MessageForm extends Form {
	public readonly type = FormTypes.Message;
	public readonly target: Player;
	public title: string;
	public content: string;
	public button1: string;
	public button2: string;

	public constructor(target?: Player) {
		super();
		this.target = target!;
		this.title = '';
		this.content = '';
		this.button1 = '';
		this.button2 = '';
	}

	public toString(): string {
		return JSON.stringify({
			type: this.type,
			title: this.title,
			content: this.content,
			button1: this.button1,
			button2: this.button2,
		});
	}

	public async send(): Promise<boolean | null> {
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

export { MessageForm };
