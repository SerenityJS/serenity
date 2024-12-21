interface LegacyTelemetryEventData {
  AchievementAwarded: { achievementId: number };
  EntityInteract: {
    interactedEntityId: bigint;
    interactionType: number;
    interactionActorType: number;
    interactionActorVariant: number;
    interactionActorColor: number;
  };
  PortalBuilt: { dimensionId: number };
  PortalUsed: { fromDimensionId: number; toDimensionId: number };
  MobKilled: {
    instigatorActorId: bigint;
    targetActorId: bigint;
    instigatorChildActorType: number;
    damageSource: number;
    tradeTier: number;
    traderName: string;
  };
  CauldronUsed: {
    contentsColor: number;
    contentsType: number;
    fillLevel: number;
  };
  PlayerDeath: {
    instigatorActorId: bigint;
    instigatorMobVariant: number;
    damageSource: number;
    diedInRaid: boolean;
  };
  BossKilled: { bossActorId: bigint; partySize: number; bossType: number };
  AgentCommand: {
    result: number;
    resultNumber: number;
    commandName: string;
    resultKey: string;
    resultString: string;
  };
  AgentCreated: Record<string, never>;
  BannerPatternRemoved: Record<string, never>;
  CommandExecuted: {
    successCount: number;
    errorCount: number;
    commandName: string;
    errorList: string;
  };
  FishBucketed: Record<string, never>;
  MobBorn: { entityType: number; entityVariant: number; color: number };
  PetDied: {
    killedPetEntityType: number;
    killedPetVariant: number;
    killerEntityType: number;
    killerVariant: number;
    damageSource: number;
  };
  CauldronBlockUsed: { blockInteractionType: number; itemId: number };
  ComposterBlockUsed: { blockInteractionType: number; itemId: number };
  BellBlockUsed: { itemId: number };
  ActorDefinition: { eventName: string };
  RaidUpdate: {
    currentRaidWave: number;
    totalRaidWaves: number;
    wonRaid: boolean;
  };
  PlayerMovementA: Record<string, never>;
  PlayerMovementCorrected: Record<string, never>;
  HoneyHarvested: Record<string, never>;
  TargetBlockHit: { redstoneLevel: number };
  PiglinBarter: { itemId: number; wasTargetingBarteringPlayer: boolean };
  WaxedOrUnwaxedCopper: { playerWaxedOrUnwaxedCopperBlockId: number };
  CodeBuilderRuntimeAction: { codeBuilderRuntimeAction: string };
  CodeBuilderScoreboard: {
    objectiveName: string;
    codeBuilderScoreboardScore: number;
  };
  StriderRiddenInLavaInOverworld: Record<string, never>;
  SneakCloseToSculkSensor: Record<string, never>;
  CarefulRestoration: Record<string, never>;
  ItemUsed: {
    itemId: number;
    itemAux: number;
    useMethod: number;
    useCount: number;
  };
}

export { LegacyTelemetryEventData };
