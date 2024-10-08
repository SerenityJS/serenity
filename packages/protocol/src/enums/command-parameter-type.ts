enum CommandParameterType {
  Int = 1,
  Float = 3,
  Value = 4,
  WildcardInt = 5,
  Operator = 6,
  CompareOperator = 7,
  Target = 8,
  WildcardTarget = 10,
  Filepath = 17,
  FullIntegerRange = 23,
  EquipmentSlot = 47,
  String = 48,
  IntPosition = 64,
  FloatPosition = 65,
  Message = 67,
  RawText = 70,
  Json = 74,
  BlockState = 84,
  Command = 87
}

export { CommandParameterType };
