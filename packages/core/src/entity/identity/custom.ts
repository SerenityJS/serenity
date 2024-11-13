import { EntityIdentifier } from "../../enums";

import { EntityType } from "./type";

class CustomEntityType extends EntityType {
  /**
   * Create a new custom entity type.
   * @param identifier The identifier of the custom entity type.
   * @param components The default components of the custom entity type.
   */
  public constructor(identifier: string) {
    super(identifier as EntityIdentifier);
  }
}

export { CustomEntityType };
