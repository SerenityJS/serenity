import { DataStoreChangeAction } from "../../enums";

import { DataStoreChangeOptions } from "./data-store-change-options";
import { DataStoreSetPropertyOptions } from "./data-store-set-property-options";

class DataStoreSetPropertyPathOptions extends DataStoreSetPropertyOptions {
  public readonly path: string;
  protected constructor(
    action: DataStoreChangeAction,
    dataStoreId: string,
    property: string,
    value: string | boolean | number | object,
    path: string
  ) {
    super(action, dataStoreId, property, value);
    this.path = path;
  }
  static {
    DataStoreChangeOptions.createSetPropertyPath = (
      dataStoreId,
      property,
      path,
      value
    ) =>
      new this(
        DataStoreChangeAction.SetPropertyPathValue,
        dataStoreId,
        property,
        value,
        path
      );
  }
}

export { DataStoreSetPropertyPathOptions };
