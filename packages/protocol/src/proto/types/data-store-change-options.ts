import { DataStoreChangeAction } from "../../enums";
import { DataStorePropertyValueKind } from "../../types/data-store-property-value-kind";

class DataStoreChangeOptions {
  public static createClear: (dataStoreId: string) => DataStoreChangeOptions = (
    dataStoreId: string
  ) => {
    return new DataStoreChangeOptions(
      DataStoreChangeAction.ClearDataStore,
      dataStoreId
    );
  };
  public static createSetProperty: (
    dataStore: string,
    property: string,
    value: DataStorePropertyValueKind
  ) => DataStoreChangeOptions;
  public static createSetPropertyPath: (
    dataStore: string,
    property: string,
    path: string,
    value: DataStorePropertyValueKind
  ) => DataStoreChangeOptions;
  public readonly action: DataStoreChangeAction;
  public readonly dataStoreId: string;
  protected constructor(action: DataStoreChangeAction, dataStoreId: string) {
    this.action = action;
    this.dataStoreId = dataStoreId;
  }
}

export { DataStoreChangeOptions };
