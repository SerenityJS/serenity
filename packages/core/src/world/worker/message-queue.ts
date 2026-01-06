import { WorkerMessage } from "./message";

class MessageQueue {
  /**
   * The number of messages to process in a single batch.
   */
  public static readonly BATCH_SIZE = 50;

  /**
   * Enqueue a new message processing function.
   */
  private queue: Array<WorkerMessage> = [];

  /**
   * Gets the next batch of messages to process.
   * @returns The array of messages to process.
   */
  public getBatch(): Array<WorkerMessage> {
    return this.queue.splice(0, MessageQueue.BATCH_SIZE);
  }

  /**
   * Adds a new message to the queue.
   * @param message The message to add.
   */
  public add(message: WorkerMessage): void {
    this.queue.push(message);
  }
}

export { MessageQueue };
