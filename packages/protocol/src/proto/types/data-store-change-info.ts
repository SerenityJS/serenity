import { DataType } from "@serenityjs/binarystream";

abstract class DataStoreChangeInfo extends DataType {
  /**
   * The type identifier of the data store update.
   */
  public abstract readonly typeId: number;
}

export { DataStoreChangeInfo };
