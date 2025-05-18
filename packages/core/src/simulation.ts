type SimulationCallback = (deltaTime: number) => void;
interface Simulation {
  /**
   * Whether or not the simulation is paused.
   */
  paused: boolean;
  /**
   * Frequency in seconds. The server game loop is capped at 100 simulations per second.
   * The max this frequency can be is 0.01 or 1/100th of a second.
   */
  frequency: number;
  /**
   * The last time the simulation was run in nanoseconds.
   */
  lastRunTime: bigint;
  /**
   * The callback to run when its time to simulate.
   */
  callback: SimulationCallback;
}

interface SimulationInstance {
  simulation: Simulation;
  /**
   * Pauses the simulation.
   */
  pause: () => void;
  /**
   * Unpauses the simulation. lastRunTime is set to the current time to avoid a massive time delta.
   */
  unpause: () => void;
  /**
   * Destroys the simulation.
   */
  destroy: () => void;
}

export { Simulation, SimulationCallback, SimulationInstance };
