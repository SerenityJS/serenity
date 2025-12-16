import { DefaultWorldProperties } from "../../../constants";

import { CustomEnum } from ".";

const ruleSet = Object.entries(DefaultWorldProperties.gamerules);

class BoolGameRuleEnum extends CustomEnum {
  public static readonly identifier = "BoolGameRule";
  public static readonly options = ruleSet
    .filter((x) => typeof x[1] === "boolean")
    .map((x) => x[0]);
}

class IntGameRuleEnum extends CustomEnum {
  public static readonly identifier = "IntGameRule";
  public static readonly options = ruleSet
    .filter((x) => typeof x[1] === "number")
    .map((x) => x[0]);
}

export { BoolGameRuleEnum, IntGameRuleEnum };
