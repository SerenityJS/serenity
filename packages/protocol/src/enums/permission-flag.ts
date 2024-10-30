enum PermissionFlag {
  Build = 0b1,
  Mine = 0b10,
  DoorsAndSwitches = 0b100,
  OpenContainers = 0b1000,
  AttackPlayers = 0b10000,
  AttackMobs = 0b100000,
  OperatorCommands = 0b1000000,
  Teleport = 0b10000000
}

export { PermissionFlag };
