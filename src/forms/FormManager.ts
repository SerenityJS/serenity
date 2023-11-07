import type { FormTypes } from '@serenityjs/protocol';

interface FormCallback {
	callback(value: any): void;
	type: FormTypes;
}

class FormManager {
	private id = 0;
	public readonly forms: Map<number, FormCallback> = new Map();

	public generateId(): number {
		return this.id++;
	}

	public set(id: number, callback: FormCallback): void {
		this.forms.set(id, callback);
	}

	public get(id: number): FormCallback | undefined {
		return this.forms.get(id);
	}
}

export { FormManager };
