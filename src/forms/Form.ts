import type { FormTypes } from '@serenityjs/protocol';

abstract class Form {
	public abstract readonly type: FormTypes;
	public abstract toString(): string;
}

export { Form };
