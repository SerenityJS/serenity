export class AsyncMap<K, V> {
  public readonly map = new Map<K, V>();

  // These methods are commonly overridden to send signals
  public async set(key: K, value: V): Promise<this> {
    this.map.set(key, value);
    return this;
  }

  public async delete(key: K): Promise<boolean> {
    return this.map.delete(key);
  }

  public async clear(): Promise<void> {
    this.map.clear();
  }

  // Poly fill the rest of the map methods
  public get(key: K): V | undefined {
    return this.map.get(key);
  }

  public has(key: K): boolean {
    return this.map.has(key);
  }

  public forEach(callback: (value: V, key: K, map: Map<K, V>) => void): void {
    this.map.forEach(callback);
  }

  public entries(): IterableIterator<[K, V]> {
    return this.map.entries();
  }

  public keys(): IterableIterator<K> {
    return this.map.keys();
  }

  public values(): IterableIterator<V> {
    return this.map.values();
  }

  public [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.map[Symbol.iterator]();
  }

  public get size(): number {
    return this.map.size;
  }
}
