// Experimental Event Emitter
export type Awaitable<T> = PromiseLike<T> | T;
export type Listener<T extends any[], R = unknown> = (...args: T) => Awaitable<R>;
export type ForceArray<T> = T extends any[] ? T : never;

export class EventEmitter<T> {
	private readonly _beforeHooks = new Map<keyof T, Listener<ForceArray<T[any]>, boolean>[]>();
	private readonly _afterHooks = new Map<keyof T, Listener<ForceArray<T[any]>>[]>();
	private readonly _listeners = new Map<keyof T, Listener<ForceArray<T[any]>>[]>();

	public constructor(private _maxListeners = 10) {}

	public get maxListeners(): number {
		return this._maxListeners;
	}

	public set maxListeners(value: number) {
		this._maxListeners = value;
	}

	// Returns true if all listeners were called. Returns false if a before hook returned false.
	public async emit<K extends keyof T>(event: K, ...args: ForceArray<T[K]>): Promise<boolean> {
		const beforeHooks = this._beforeHooks.get(event) ?? [];
		const listeners = this._listeners.get(event) ?? [];
		const afterHooks = this._afterHooks.get(event) ?? [];

		// TODO: Optional optimization point. Listeners can be called in parallel for promises.
		for (const hook of beforeHooks) {
			const result = await hook(...args);
			if (result === false) return false;
		}

		for (const listener of listeners) {
			await listener(...args);
		}

		for (const hook of afterHooks) {
			await hook(...args);
		}

		return true;
	}

	// Register utility to reduce duplication in code.
	private _addListener<K extends keyof T>(
		map: Map<keyof T, Listener<ForceArray<T[any]>>[]>,
		event: K,
		listener: Listener<ForceArray<T[K]>>,
	): this {
		const listeners = map.get(event) ?? [];
		if (listeners.length >= this._maxListeners) {
			console.trace(
				`warning: possible EventEmitter memory leak detected. ${listeners.length} listeners added. Use #setMaxListeners() to increase limit`,
			);
		}

		map.set(event, [...listeners, listener]);

		return this;
	}

	private _addOnceListener<K extends keyof T>(
		map: Map<keyof T, Listener<ForceArray<T[any]>>[]>,
		event: K,
		listener: Listener<ForceArray<T[K]>>,
	): this {
		const wrapper = (...args: ForceArray<T[K]>) => {
			this._removeListener(map, event, wrapper);
			return listener(...args);
		};

		return this._addListener(map, event, wrapper);
	}

	private _removeListener<K extends keyof T>(
		map: Map<keyof T, Listener<ForceArray<T[any]>>[]>,
		event: K,
		listener: Listener<ForceArray<T[K]>>,
	): this {
		const listeners = map.get(event);
		const index = listeners?.indexOf(listener);
		if (index !== undefined && index !== -1) {
			listeners?.splice(index, 1);
		}

		return this;
	}

	private _removeAllListeners<K extends keyof T>(map: Map<keyof T, Listener<ForceArray<T[any]>>[]>, event?: K): this {
		if (event) {
			map.delete(event);
		} else {
			map.clear();
		}

		return this;
	}

	public on<K extends keyof T>(event: K, listener: Listener<ForceArray<T[K]>>): this {
		return this._addListener(this._listeners, event, listener);
	}

	public before<K extends keyof T>(event: K, listener: Listener<ForceArray<T[K]>, boolean>): this {
		return this._addListener(this._beforeHooks, event, listener);
	}

	public after<K extends keyof T>(event: K, listener: Listener<ForceArray<T[K]>>): this {
		return this._addListener(this._afterHooks, event, listener);
	}

	public once<K extends keyof T>(event: K, listener: Listener<ForceArray<T[K]>>): this {
		return this._addOnceListener(this._listeners, event, listener);
	}

	public onceBefore<K extends keyof T>(event: K, listener: Listener<ForceArray<T[K]>, boolean>): this {
		return this._addOnceListener(this._beforeHooks, event, listener);
	}

	public onceAfter<K extends keyof T>(event: K, listener: Listener<ForceArray<T[K]>>): this {
		return this._addOnceListener(this._afterHooks, event, listener);
	}

	public remove<K extends keyof T>(event: K, listener: Listener<ForceArray<T[K]>>): this {
		return this._removeListener(this._listeners, event, listener);
	}

	public removeBefore<K extends keyof T>(event: K, listener: Listener<ForceArray<T[K]>, boolean>): this {
		return this._removeListener(this._beforeHooks, event, listener);
	}

	public removeAfter<K extends keyof T>(event: K, listener: Listener<ForceArray<T[K]>>): this {
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

export default EventEmitter;
