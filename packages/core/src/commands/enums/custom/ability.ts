import { AbilityIndex } from "@serenityjs/protocol";

import { CustomEnum } from ".";

const identifiers = Object.values(AbilityIndex).filter(
  (id) => typeof id === "string"
) as Array<string>;

class AbilityEnum extends CustomEnum {
  public static readonly name = "ability";
  public static readonly options = identifiers;
}

export { AbilityEnum };
