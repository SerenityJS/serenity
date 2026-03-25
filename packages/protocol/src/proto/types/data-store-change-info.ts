import { DataType } from "@serenityjs/binarystream";

abstract class DataStoreChangeInfo extends DataType {
  /**
   * The type identifier of the data store update.
   */
  public abstract readonly typeId: number;

  /**
   * The name of the data store that was updated.
   */
  public abstract readonly dataStoreName: string;
}

export { DataStoreChangeInfo };
