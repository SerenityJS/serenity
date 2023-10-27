"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
class EventEmitter {
    constructor(_maxListeners = 10) {
        this._maxListeners = _maxListeners;
        this._beforeHooks = new Map();
        this._afterHooks = new Map();
        this._listeners = new Map();
    }
    get maxListeners() {
        return this._maxListeners;
    }
    set maxListeners(value) {
        this._maxListeners = value;
    }
    // Returns true if all listeners were called. Returns false if a before hook returned false.
    async emit(event, ...args) {
        const beforeHooks = this._beforeHooks.get(event) ?? [];
        const listeners = this._listeners.get(event) ?? [];
        const afterHooks = this._afterHooks.get(event) ?? [];
        // TODO: Optional optimization point. Listeners can be called in parallel for promises.
        for (const hook of beforeHooks) {
            const result = await hook(...args);
            if (result === false)
                return false;
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
    _addListener(map, event, listener) {
        const listeners = map.get(event) ?? [];
        if (listeners.length >= this._maxListeners) {
            console.trace(`warning: possible EventEmitter memory leak detected. ${listeners.length} listeners added. Use #setMaxListeners() to increase limit`);
        }
        map.set(event, [...listeners, listener]);
        return this;
    }
    _addOnceListener(map, event, listener) {
        const wrapper = (...args) => {
            this._removeListener(map, event, wrapper);
            return listener(...args);
        };
        return this._addListener(map, event, wrapper);
    }
    _removeListener(map, event, listener) {
        const listeners = map.get(event);
        const index = listeners?.indexOf(listener);
        if (index !== undefined && index !== -1) {
            listeners?.splice(index, 1);
        }
        return this;
    }
    _removeAllListeners(map, event) {
        if (event) {
            map.delete(event);
        }
        else {
            map.clear();
        }
        return this;
    }
    on(event, listener) {
        return this._addListener(this._listeners, event, listener);
    }
    before(event, listener) {
        return this._addListener(this._beforeHooks, event, listener);
    }
    after(event, listener) {
        return this._addListener(this._afterHooks, event, listener);
    }
    once(event, listener) {
        return this._addOnceListener(this._listeners, event, listener);
    }
    onceBefore(event, listener) {
        return this._addOnceListener(this._beforeHooks, event, listener);
    }
    onceAfter(event, listener) {
        return this._addOnceListener(this._afterHooks, event, listener);
    }
    remove(event, listener) {
        return this._removeListener(this._listeners, event, listener);
    }
    removeBefore(event, listener) {
        return this._removeListener(this._beforeHooks, event, listener);
    }
    removeAfter(event, listener) {
        return this._removeListener(this._afterHooks, event, listener);
    }
    removeAll(event) {
        return this._removeAllListeners(this._listeners, event);
    }
    removeAllBefore(event) {
        return this._removeAllListeners(this._beforeHooks, event);
    }
    removeAllAfter(event) {
        return this._removeAllListeners(this._afterHooks, event);
    }
}
exports.EventEmitter = EventEmitter;
exports.default = EventEmitter;
