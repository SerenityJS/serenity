import { CustomEnum } from ".";

class TimeOpertation extends CustomEnum {
  public static readonly identifier = "time_operation";
  public static readonly options = ["set", "add", "query"];
}

export { TimeOpertation };
