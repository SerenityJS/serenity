// Experimental Event Emitter
export type Listener<T extends Array<unknown>, R = unknown> = (
	...arguments_: T
) => R;
export type ForceArray<T> = T extends Array<unknown> ? T : never;

export class Emitter<T> {
	private readonly _beforeHooks = new Map<
		keyof T,
		Array<Listener<ForceArray<T[never]>, boolean>>
	>();

	private readonly _afterHooks = new Map<
		keyof T,
		Array<Listener<ForceArray<T[never]>>>
	>();

	private readonly _listeners = new Map<
		keyof T,
		Array<Listener<ForceArray<T[never]>>>
	>();

	public constructor(private _maxListeners = 10) {}

	public get maxListeners(): number {
		return this._maxListeners;
	}

	public set maxListeners(value: number) {
		this._maxListeners = value;
	}

	// Returns true if all listeners were called. Returns false if a before hook returned false.
	public emit<K extends keyof T>(
		event: K,
		...arguments_: ForceArray<T[K]>
	): boolean {
		const beforeHooks = this._beforeHooks.get(event) ?? [];
		const listeners = this._listeners.get(event) ?? [];
		const afterHooks = this._afterHooks.get(event) ?? [];

		// TODO: Optional optimization point. Listeners can be called in parallel for promises.
		for (const hook of beforeHooks) {
			const result = hook(...(arguments_ as ForceArray<T[never]>));
			if (result === false) return false;
		}

		for (const listener of listeners) {
			listener(...(arguments_ as ForceArray<T[never]>));
		}

		process.nextTick(() => {
			for (const hook of afterHooks) {
				hook(...(arguments_ as ForceArray<T[never]>));
			}
		});

		return true;
	}

	// Register utility to reduce duplication in code.
	private _addListener<K extends keyof T>(
		map: Map<keyof T, Array<Listener<ForceArray<T[never]>>>>,
		event: K,
		listener: Listener<ForceArray<T[K]>>
	): this {
		const listeners = map.get(event) ?? [];
		if (listeners.length >= this._maxListeners) {
			console.trace(
				`warning: possible EventEmitter memory leak detected. ${listeners.length} listeners added. Use #setMaxListeners() to increase limit`
			);
		}

		map.set(event, [...listeners, listener]);

		return this;
	}

	private _addOnceListener<K extends keyof T>(
		map: Map<keyof T, Array<Listener<ForceArray<T[never]>>>>,
		event: K,
		listener: Listener<ForceArray<T[K]>>
	): this {
		const wrapper = (...arguments_: ForceArray<T[K]>) => {
			this._removeListener(map, event, wrapper);
			return listener(...arguments_);
		};

		return this._addListener(map, event, wrapper);
	}

	private _removeListener<K extends keyof T>(
		map: Map<keyof T, Array<Listener<ForceArray<T[never]>>>>,
		event: K,
		listener: Listener<ForceArray<T[K]>>
	): this {
		const listeners = map.get(event);
		const index = listeners?.indexOf(listener);
		if (index !== undefined && index !== -1) {
			listeners?.splice(index, 1);
		}

		return this;
	}

	private _removeAllListeners<K extends keyof T>(
		map: Map<keyof T, Array<Listener<ForceArray<T[never]>>>>,
		event?: K
	): this {
		if (event) {
			map.delete(event);
		} else {
			map.clear();
		}

		return this;
	}

	public on<K extends keyof T>(
		event: K,
		listener: Listener<ForceArray<T[K]>>
	): this {
		return this._addListener(this._listeners, event, listener);
	}

	public before<K extends keyof T>(
		event: K,
		listener: Listener<ForceArray<T[K]>, boolean>
	): this {
		return this._addListener(this._beforeHooks, event, listener);
	}

	public after<K extends keyof T>(
		event: K,
		listener: Listener<ForceArray<T[K]>>
	): this {
		return this._addListener(this._afterHooks, event, listener);
	}

	public once<K extends keyof T>(
		event: K,
		listener: Listener<ForceArray<T[K]>>
	): this {
		return this._addOnceListener(this._listeners, event, listener);
	}

	public onceBefore<K extends keyof T>(
		event: K,
		listener: Listener<ForceArray<T[K]>, boolean>
	): this {
		return this._addOnceListener(this._beforeHooks, event, listener);
	}

	public onceAfter<K extends keyof T>(
		event: K,
		listener: Listener<ForceArray<T[K]>>
	): this {
		return this._addOnceListener(this._afterHooks, event, listener);
	}

	public remove<K extends keyof T>(
		event: K,
		listener: Listener<ForceArray<T[K]>>
	): this {
		return this._removeListener(this._listeners, event, listener);
	}

	public removeBefore<K extends keyof T>(
		event: K,
		listener: Listener<ForceArray<T[K]>, boolean>
	): this {
		return this._removeListener(this._beforeHooks, event, listener);
	}

	public removeAfter<K extends keyof T>(
		event: K,
		listener: Listener<ForceArray<T[K]>>
	): this {
		return this._removeListener(this._afterHooks, event, listener);
	}

	public removeAll<K extends keyof T>(event?: K): this {
		return this._removeAllListeners(this._listeners, event);
	}

	public removeAllBefore<K extends keyof T>(event?: K): this {
		return this._removeAllListeners(this._beforeHooks, event);
	}

	public removeAllAfter<K extends keyof T>(event?: K): this {
		return this._removeAllListeners(this._afterHooks, event);
	}
}

export default Emitter;
