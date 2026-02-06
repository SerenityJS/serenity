import { DataStoreChangeAction } from "../../enums";
import { DataStorePropertyValueKind } from "../../types/data-store-property-value-kind";

import { DataStoreChangeOptions } from "./data-store-change-options";

class DataStoreSetPropertyOptions extends DataStoreChangeOptions {
  public readonly property: string;
  public readonly value: DataStorePropertyValueKind;
  protected constructor(
    action: DataStoreChangeAction,
    dataStoreId: string,
    property: string,
    value: DataStorePropertyValueKind
  ) {
    super(action, dataStoreId);
    this.property = property;
    this.value = value;
  }
  static {
    DataStoreChangeOptions.createSetProperty = (dataStoreId, property, value) =>
      new DataStoreSetPropertyOptions(
        DataStoreChangeAction.SetPropertyValue,
        dataStoreId,
        property!,
        value!
      );
  }
}

export { DataStoreSetPropertyOptions };
