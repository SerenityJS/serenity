/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFilePath } from "./get-path";

// Event Listener Types
export type Listener<T extends Array<unknown>, R = unknown> = (
  ...arguments_: T
) => R;
export type ForceArray<T> = T extends Array<unknown> ? T : never;
export type AfterListener<T extends Array<unknown>> = Listener<[...T, boolean]>;

export class Emitter<T> {
  private readonly _beforeHooks = new Map<
    keyof T,
    Array<Listener<ForceArray<T[never]>, boolean>>
  >();

  private readonly _afterHooks = new Map<
    keyof T,
    Array<AfterListener<ForceArray<T[never]>>>
  >();

  private readonly _listeners = new Map<
    keyof T,
    Array<Listener<ForceArray<T[never]>>>
  >();

  private readonly _paths = new Map<
    Listener<any>,
    { event: keyof T; path: string }
  >();

  public constructor(
    private _maxListeners = 10,
    onError: Listener<[Error]> | null = null
  ) {
    this.errorCallback = onError;
  }

  private errorCallback: Listener<[Error]> | null = null;

  public get maxListeners(): number {
    return this._maxListeners;
  }

  public set maxListeners(value: number) {
    this._maxListeners = value;
  }

  public onError(callback: Listener<[Error]> | null): void {
    this.errorCallback = callback;
  }

  public emit<K extends keyof T>(
    event: K,
    ...arguments_: ForceArray<T[K]>
  ): boolean {
    const beforeHooks = this._beforeHooks.get(event) ?? [];
    const listeners = this._listeners.get(event) ?? [];
    const afterHooks = this._afterHooks.get(event) ?? [];

    let canceled = false;

    for (const hook of beforeHooks) {
      try {
        const result = hook(...(arguments_ as ForceArray<T[never]>));
        if (result === false) {
          canceled = true;
          break;
        }
      } catch (reason) {
        if (this.errorCallback) {
          this.errorCallback(reason as Error);
        } else {
          throw reason;
        }
      }
    }

    if (!canceled) {
      for (const listener of listeners) {
        try {
          listener(...(arguments_ as ForceArray<T[never]>));
        } catch (reason) {
          if (this.errorCallback) {
            this.errorCallback(reason as Error);
          } else {
            throw reason;
          }
        }
      }
    }

    const afterArgs = [...arguments_, canceled] as [
      ...ForceArray<T[never]>,
      boolean
    ];

    process.nextTick(() => {
      for (const hook of afterHooks) {
        try {
          hook(...afterArgs);
        } catch (reason) {
          if (this.errorCallback) {
            this.errorCallback(reason as Error);
          } else {
            throw reason;
          }
        }
      }
    });

    return !canceled;
  }

  public async emitAsync<K extends keyof T>(
    event: K,
    ...arguments_: ForceArray<T[K]>
  ): Promise<boolean> {
    const beforeHooks = this._beforeHooks.get(event) ?? [];
    const listeners = this._listeners.get(event) ?? [];
    const afterHooks = this._afterHooks.get(event) ?? [];

    let canceled = false;

    for (const hook of beforeHooks) {
      const result = await hook(...(arguments_ as ForceArray<T[never]>));
      if (result === false) {
        canceled = true;
        break;
      }
    }

    if (!canceled) {
      for (const listener of listeners) {
        await listener(...(arguments_ as ForceArray<T[never]>));
      }
    }

    const afterArgs = [...arguments_, canceled] as [
      ...ForceArray<T[never]>,
      boolean
    ];

    for (const hook of afterHooks) {
      await hook(...afterArgs);
    }

    return !canceled;
  }

  private _addListener<K extends keyof T, L>(
    map: Map<K, Array<L>>,
    event: K,
    listener: L
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

  private _addOnceListener<K extends keyof T, L>(
    map: Map<K, Array<L>>,
    event: K,
    listener: L
  ): this {
    const wrapper = (...args: Array<any>) => {
      this._removeListener(map, event, wrapper as L);
      return (listener as any)(...args);
    };

    return this._addListener(map, event, wrapper as L);
  }

  private _removeListener<K extends keyof T, L>(
    map: Map<K, Array<L>>,
    event: K,
    listener: L
  ): this {
    const listeners = map.get(event);
    const index = listeners?.indexOf(listener);
    if (index !== undefined && index !== -1) {
      listeners?.splice(index, 1);
    }
    return this;
  }

  private _removeAllListeners<K extends keyof T, L>(
    map: Map<K, Array<L>>,
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
    const path = getFilePath();
    if (path) this._paths.set(listener, { event, path });

    return this._addListener(this._listeners, event, listener);
  }

  public before<K extends keyof T>(
    event: K,
    listener: Listener<ForceArray<T[K]>, boolean>
  ): this {
    const path = getFilePath();
    if (path) this._paths.set(listener, { event, path });

    return this._addListener(this._beforeHooks, event, listener);
  }

  public after<K extends keyof T>(
    event: K,
    listener: AfterListener<ForceArray<T[K]>>
  ): this {
    const path = getFilePath();
    if (path) this._paths.set(listener, { event, path });

    return this._addListener(this._afterHooks, event, listener);
  }

  public once<K extends keyof T>(
    event: K,
    listener: Listener<ForceArray<T[K]>>
  ): this {
    const path = getFilePath();
    if (path) this._paths.set(listener, { event, path });

    return this._addOnceListener(this._listeners, event, listener);
  }

  public onceBefore<K extends keyof T>(
    event: K,
    listener: Listener<ForceArray<T[K]>, boolean>
  ): this {
    const path = getFilePath();
    if (path) this._paths.set(listener, { event, path });

    return this._addOnceListener(this._beforeHooks, event, listener);
  }

  public onceAfter<K extends keyof T>(
    event: K,
    listener: AfterListener<ForceArray<T[K]>>
  ): this {
    const path = getFilePath();
    if (path) this._paths.set(listener, { event, path });

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
    listener: AfterListener<ForceArray<T[K]>>
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

  public removePath(path: string): this {
    for (const [listener, { event, path: listenerPath }] of this._paths) {
      if (listenerPath.includes(path)) {
        this.remove(event as never, listener as never);
        this.removeBefore(event as never, listener as never);
        this.removeAfter(event as never, listener as never);
      }
      this._paths.delete(listener);
    }
    return this;
  }
}

export default Emitter;
