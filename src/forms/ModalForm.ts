import { FormTypes, ModalFormRequest } from '@serenityjs/protocol';
import type { Player } from '../player';
import { Form } from './Form';

interface ModalFormContent {
	default?: boolean | number | string;
	max?: number;
	min?: number;
	options?: string[];
	placeholder?: string;
	step?: number;
	steps?: string[];
	text: string;
	type: 'dropdown' | 'input' | 'label' | 'slider' | 'step_slider' | 'toggle';
}

type ModalFormResponseData = boolean | number | string | null;

class ModalForm extends Form {
	public readonly type = FormTypes.Modal;
	public readonly target: Player;
	public readonly content: ModalFormContent[] = [];
	public title: string;

	public constructor(target?: Player) {
		super();
		this.target = target!;
		this.title = '';
	}

	public toString(): string {
		return JSON.stringify({
			type: this.type,
			title: this.title,
			content: this.content,
		});
	}

	public addLabel(text: string): void {
		this.content.push({ type: 'label', text });
	}

	public addToggle(text: string, defaultState = false): void {
		this.content.push({ type: 'toggle', text, default: defaultState });
	}

	public addSlider(text: string, min: number, max: number, step = 1, defaultState = min): void {
		this.content.push({ type: 'slider', text, min, max, step, default: defaultState });
	}

	public addStepSlider(text: string, steps: string[], defaultState = 0): void {
		this.content.push({ type: 'step_slider', text, steps, default: defaultState });
	}

	public addDropdown(text: string, options: string[], defaultState = 0): void {
		this.content.push({ type: 'dropdown', text, options, default: defaultState });
	}

	public addInput(text: string, placeholder = '', defaultState = ''): void {
		this.content.push({ type: 'input', text, placeholder, default: defaultState });
	}

	public addContent(content: ModalFormContent): void {
		this.content.push(content);
	}

	public async send(): Promise<ModalFormResponseData[] | null> {
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

export { ModalForm };
