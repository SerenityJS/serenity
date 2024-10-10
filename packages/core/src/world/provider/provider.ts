import { Chunk } from "../chunk/chunk";

class WorldProvider {
  /**
   * The identifier of the provider.
   */
  public static readonly identifier: string;

  /**
   * The identifier of the provider.
   */
  public readonly identifier = (this.constructor as typeof WorldProvider)
    .identifier;

  /**
   * Create a new world provider.
   * @param parameters The parameters to use for the provider.
   */
  public constructor(..._parameters: Array<unknown>) {
    return this;
  }

  /**
   * Called when the provider is started.
   */
  public onStartup(): void {}

  /**
   * Called when the provider is shutdown.
   */
  public onShutdown(): void {}

  /**
   * Called when the provider is saved.
   */
  public onSave(): void {}

  /**
   * Reads a chunk for a specified dimension from the provider.
   * @param cx The chunk x coordinate.
   * @param cz The chunk z coordinate.
   * @param index The dimension index to read the chunk from.
   */
  public readChunk(_cx: number, _cz: number, _index: number): Chunk {
    throw new Error(`${this.identifier}.readChunk() is not implemented!`);
  }

  /**
   * Writes a chunk for a specified dimension to the provider.
   * @param chunk The chunk to write.
   * @param index The dimension index to write the chunk to.
   */
  public writeChunk(_chunk: Chunk, _index: number): void {
    throw new Error(`${this.identifier}.writeChunk() is not implemented!`);
  }
}

export { WorldProvider };
