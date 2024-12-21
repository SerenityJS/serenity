import { EntityType } from "../../../entity";

import { CustomEnum } from ".";

const identifiers = EntityType.getAll()
  .map((entity) =>
    entity.identifier.startsWith("minecraft:")
      ? entity.identifier.slice(10)
      : entity.identifier
  )
  .filter((identifier) => identifier != "player");

class EntityEnum extends CustomEnum {
  public static readonly identifier = "entities";
  public static readonly options = identifiers;
}

export { EntityEnum };
