enum CodeBuilderOperation {
  None,
  Get,
  Set,
  Reset
}

enum CodeBuilderCategory {
  None,
  CodeStatus,
  Instantiation
}

enum CodeBuilderCodeStatus {
  None,
  NotStarted,
  InProgress,
  Paused,
  Error,
  Succeded
}

export { CodeBuilderOperation, CodeBuilderCategory, CodeBuilderCodeStatus };
