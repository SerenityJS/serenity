import { Dimension } from "./dimension";

import type { World } from "./world";

class TickSchedule {
  /**
   * The amount of ticks to wait before the schedule is complete.
   */
  public scheduledTick: bigint;

  /**
   * The tick at which the schedule will be complete.
   */
  public completeTick: bigint;

  /**
   * The callbacks to call when the schedule is complete.
   */
  public readonly callbacks = new Set<() => void>();

  /**
   * Creates a new tick schedule.
   * @param scheduledTick The amount of ticks to wait before the schedule is complete.
   * @param worldOrDimension The world or dimension to schedule the tick in.
   */
  public constructor(
    scheduledTick: bigint | number,
    worldOrDimension: World | Dimension
  ) {
    // Set the scheduled tick
    this.scheduledTick = BigInt(scheduledTick);

    // Get the world from the constructor
    const world =
      worldOrDimension instanceof Dimension
        ? worldOrDimension.world
        : worldOrDimension;

    // Get the current tick
    const currentTick = world.currentTick;

    // Calculate the complete tick
    this.completeTick = currentTick + this.scheduledTick;
  }

  /**
   * Executes all the callbacks in the schedule.
   */
  public execute(): void {
    // Call all the callbacks
    for (const callback of this.callbacks) callback();
  }

  /**
   * Adds a callback to the schedule.
   * @param callback The callback to add.
   */
  public on(callback: () => void): void {
    // Add the callback to the schedule
    this.callbacks.add(callback);
  }

  /**
   * Cancels the schedule.
   */
  public cancel(): void {
    // Clear all the callbacks
    this.callbacks.clear();
  }
}

export { TickSchedule };
