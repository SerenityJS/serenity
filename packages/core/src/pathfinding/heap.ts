class BinaryHeap<T extends BinaryItem> {
  private heap: Array<T> = [];

  public get size(): number {
    return this.heap.length;
  }

  public insert(item: T): void {
    this.heap.push(item);
    this.heapUp(this.heap.length - 1);
  }

  public pop(): T | undefined {
    if (this.size === 0) return undefined;
    const item = this.heap[0];
    const last = this.heap.pop()!;

    if (this.size > 0) {
      this.heap[0] = last;
      this.heapDown(0);
    }
    return item;
  }

  public has(predicate: (item: T) => boolean) {
    return this.heap.some(predicate);
  }

  private heapUp(index: number): void {
    let i = index;

    while (i > 0) {
      const parentIndex = ((i - 1) / 2) << 0;

      if (this.heap[i]!.compareTo(this.heap[parentIndex]!) > 0) break;
      this.swap(i, parentIndex);
      i = parentIndex;
    }
  }

  private heapDown(index: number): void {
    let i = index;

    while (true) {
      const leftChildIndex = 2 * i + 1;
      const rightChildIndex = 2 * i + 2;
      let smallestChildIndex = i;

      if (
        leftChildIndex < this.heap.length &&
        this.heap[leftChildIndex]!.compareTo(this.heap[smallestChildIndex]!) < 0
      ) {
        smallestChildIndex = leftChildIndex;
      }

      if (
        rightChildIndex < this.heap.length &&
        this.heap[rightChildIndex]!.compareTo(this.heap[smallestChildIndex]!) <
          0
      ) {
        smallestChildIndex = rightChildIndex;
      }

      if (smallestChildIndex === i) break;
      this.swap(i, smallestChildIndex);
      i = smallestChildIndex;
    }
  }

  private swap(indexA: number, indexB: number): void {
    [this.heap[indexA], this.heap[indexB]] = [
      this.heap[indexB]!,
      this.heap[indexA]!
    ];
  }
}

interface BinaryItem {
  compareTo(other: BinaryItem): number;
}

export { BinaryItem, BinaryHeap };
