import { AbilityIndex } from "../enums";

const DefaultAbilityValues = {
  [AbilityIndex.Build]: true,
  [AbilityIndex.Mine]: true,
  [AbilityIndex.DoorsAndSwitches]: true,
  [AbilityIndex.OpenContainers]: true,
  [AbilityIndex.AttackPlayers]: true,
  [AbilityIndex.AttackMobs]: true,
  [AbilityIndex.OperatorCommands]: false,
  [AbilityIndex.Teleport]: false,
  [AbilityIndex.Invulnerable]: false,
  [AbilityIndex.Flying]: false,
  [AbilityIndex.MayFly]: false,
  [AbilityIndex.InstantBuild]: false,
  [AbilityIndex.Lightning]: false,
  [AbilityIndex.FlySpeed]: true,
  [AbilityIndex.WalkSpeed]: true,
  [AbilityIndex.Muted]: false,
  [AbilityIndex.WorldBuilder]: false,
  [AbilityIndex.NoClip]: false,
  [AbilityIndex.PrivilegedBuilder]: false,
  [AbilityIndex.Count]: false
};

export { DefaultAbilityValues };
