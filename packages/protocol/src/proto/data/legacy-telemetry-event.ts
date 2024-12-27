import { Proto } from "@serenityjs/raknet";

import { Packet, TelemetryEventType } from "../../enums";
import { LegacyTelemetryEventData } from "../../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.LegacyTelemetryEvent)
class LegacyTelemetryEventPacket extends DataPacket {
  public unique_id!: bigint;
  public type!: TelemetryEventType;
  public use_player_id!: number;
  public event_data!:
    | LegacyTelemetryEventData[keyof LegacyTelemetryEventData]
    | undefined;

  public override serialize(): Buffer {
    this.writeVarInt(Packet.LegacyTelemetryEvent);
    this.writeVarLong(this.unique_id);
    this.writeVarInt(this.type);
    this.writeByte(this.use_player_id);

    switch (this.type) {
      case TelemetryEventType.AchievementAwarded: {
        this.writeVarInt(
          (this.event_data as LegacyTelemetryEventData["AchievementAwarded"])
            .achievementId
        );
        break;
      }
      case TelemetryEventType.EntityInteract: {
        const ei = this
          .event_data as LegacyTelemetryEventData["EntityInteract"];
        this.writeVarLong(ei.interactedEntityId);
        this.writeVarInt(ei.interactionType);
        this.writeVarInt(ei.interactionActorType);
        this.writeVarInt(ei.interactionActorVariant);
        this.writeUint8(ei.interactionActorColor);
        break;
      }
      case TelemetryEventType.PortalBuilt: {
        this.writeVarInt(
          (this.event_data as LegacyTelemetryEventData["PortalBuilt"])
            .dimensionId
        );
        break;
      }
      case TelemetryEventType.PortalUsed: {
        const pu = this.event_data as LegacyTelemetryEventData["PortalUsed"];
        this.writeVarInt(pu.fromDimensionId);
        this.writeVarInt(pu.toDimensionId);
        break;
      }
      case TelemetryEventType.MobKilled: {
        const mk = this.event_data as LegacyTelemetryEventData["MobKilled"];
        this.writeVarLong(mk.instigatorActorId);
        this.writeVarLong(mk.targetActorId);
        this.writeVarInt(mk.instigatorChildActorType);
        this.writeVarInt(mk.damageSource);
        this.writeVarInt(mk.tradeTier);
        this.writeVarString(mk.traderName);
        break;
      }
      case TelemetryEventType.CauldronUsed: {
        const cu = this.event_data as LegacyTelemetryEventData["CauldronUsed"];
        this.writeVarInt(cu.contentsColor);
        this.writeVarInt(cu.contentsType);
        this.writeVarInt(cu.fillLevel);
        break;
      }
      case TelemetryEventType.PlayerDeath: {
        const pd = this.event_data as LegacyTelemetryEventData["PlayerDeath"];
        this.writeVarLong(pd.instigatorActorId);
        this.writeVarInt(pd.instigatorMobVariant);
        this.writeVarInt(pd.damageSource);
        this.writeBool(pd.diedInRaid);
        break;
      }
      case TelemetryEventType.BossKilled: {
        const bk = this.event_data as LegacyTelemetryEventData["BossKilled"];
        this.writeVarLong(bk.bossActorId);
        this.writeVarInt(bk.partySize);
        this.writeVarInt(bk.bossType);
        break;
      }
      case TelemetryEventType.AgentCommand: {
        const ac = this.event_data as LegacyTelemetryEventData["AgentCommand"];
        this.writeVarInt(ac.result);
        this.writeVarInt(ac.resultNumber);
        this.writeVarString(ac.commandName);
        this.writeVarString(ac.resultKey);
        this.writeVarString(ac.resultString);
        break;
      }
      case TelemetryEventType.CommandExecuted: {
        const ce = this
          .event_data as LegacyTelemetryEventData["CommandExecuted"];
        this.writeVarInt(ce.successCount);
        this.writeVarInt(ce.errorCount);
        this.writeVarString(ce.commandName);
        this.writeVarString(ce.errorList);
        break;
      }
      case TelemetryEventType.MobBorn: {
        const mb = this.event_data as LegacyTelemetryEventData["MobBorn"];
        this.writeVarInt(mb.entityType);
        this.writeVarInt(mb.entityVariant);
        this.writeUint8(mb.color);
        break;
      }
      case TelemetryEventType.PetDied: {
        const petd = this.event_data as LegacyTelemetryEventData["PetDied"];
        this.writeVarInt(petd.killedPetEntityType);
        this.writeVarInt(petd.killedPetVariant);
        this.writeVarInt(petd.killerEntityType);
        this.writeVarInt(petd.killerVariant);
        this.writeVarInt(petd.damageSource);
        break;
      }
      case TelemetryEventType.CauldronBlockUsed:
      case TelemetryEventType.ComposterBlockUsed: {
        const cbu = this
          .event_data as LegacyTelemetryEventData["CauldronBlockUsed"];
        this.writeVarInt(cbu.blockInteractionType);
        this.writeVarInt(cbu.itemId);
        break;
      }
      case TelemetryEventType.BellBlockUsed: {
        this.writeVarInt(
          (this.event_data as LegacyTelemetryEventData["BellBlockUsed"]).itemId
        );
        break;
      }
      case TelemetryEventType.ActorDefinition: {
        this.writeVarString(
          (this.event_data as LegacyTelemetryEventData["ActorDefinition"])
            .eventName
        );
        break;
      }
      case TelemetryEventType.RaidUpdate: {
        const ru = this.event_data as LegacyTelemetryEventData["RaidUpdate"];
        this.writeVarInt(ru.currentRaidWave);
        this.writeVarInt(ru.totalRaidWaves);
        this.writeBool(ru.wonRaid);
        break;
      }
      case TelemetryEventType.TargetBlockHit: {
        this.writeVarInt(
          (this.event_data as LegacyTelemetryEventData["TargetBlockHit"])
            .redstoneLevel
        );
        break;
      }
      case TelemetryEventType.PiglinBarter: {
        const pb = this.event_data as LegacyTelemetryEventData["PiglinBarter"];
        this.writeVarInt(pb.itemId);
        this.writeBool(pb.wasTargetingBarteringPlayer);
        break;
      }
      case TelemetryEventType.WaxedOrUnwaxedCopper: {
        this.writeVarInt(
          (this.event_data as LegacyTelemetryEventData["WaxedOrUnwaxedCopper"])
            .playerWaxedOrUnwaxedCopperBlockId
        );
        break;
      }
      case TelemetryEventType.CodeBuilderRuntimeAction: {
        this.writeVarString(
          (
            this
              .event_data as LegacyTelemetryEventData["CodeBuilderRuntimeAction"]
          ).codeBuilderRuntimeAction
        );
        break;
      }
      case TelemetryEventType.CodeBuilderScoreboard: {
        const cbs = this
          .event_data as LegacyTelemetryEventData["CodeBuilderScoreboard"];
        this.writeVarString(cbs.objectiveName);
        this.writeVarInt(cbs.codeBuilderScoreboardScore);
        break;
      }
      case TelemetryEventType.ItemUsed: {
        const iu = this.event_data as LegacyTelemetryEventData["ItemUsed"];
        this.writeShort(iu.itemId);
        this.writeVarInt(iu.itemAux);
        this.writeVarInt(iu.useMethod);
        this.writeVarInt(iu.useCount);
        break;
      }
      case TelemetryEventType.AgentCreated:
      case TelemetryEventType.BannerPatternRemoved:
      case TelemetryEventType.FishBucketed:
      case TelemetryEventType.PlayerMovementAnomaly:
      case TelemetryEventType.PlayerMovementCorrected:
      case TelemetryEventType.HoneyHarvested:
      case TelemetryEventType.StriderRiddenInLavaInOverworld:
      case TelemetryEventType.SneakCloseToSculkSensor:
      case TelemetryEventType.CarefulRestoration: {
        break;
      }
      default: {
        break;
      }
    }

    return this.getBuffer();
  }
  public override deserialize(): this {
    this.readVarInt();
    this.unique_id = this.readVarLong();
    this.type = this.readVarInt() as TelemetryEventType;
    this.use_player_id = this.readByte();
    switch (this.type) {
      case TelemetryEventType.AchievementAwarded:
        this.event_data = { achievementId: this.readVarInt() };
        break;
      case TelemetryEventType.EntityInteract:
        this.event_data = {
          interactedEntityId: this.readVarLong(),
          interactionType: this.readVarInt(),
          interactionActorType: this.readVarInt(),
          interactionActorVariant: this.readVarInt(),
          interactionActorColor: this.readUint8()
        };
        break;
      case TelemetryEventType.PortalBuilt:
        this.event_data = { dimensionId: this.readVarInt() };
        break;
      case TelemetryEventType.PortalUsed:
        this.event_data = {
          fromDimensionId: this.readVarInt(),
          toDimensionId: this.readVarInt()
        };
        break;
      case TelemetryEventType.MobKilled:
        this.event_data = {
          instigatorActorId: this.readVarLong(),
          targetActorId: this.readVarLong(),
          instigatorChildActorType: this.readVarInt(),
          damageSource: this.readVarInt(),
          tradeTier: this.readVarInt(),
          traderName: this.readVarString()
        };
        break;
      case TelemetryEventType.CauldronUsed:
        this.event_data = {
          contentsColor: this.readVarInt(),
          contentsType: this.readVarInt(),
          fillLevel: this.readVarInt()
        };
        break;
      case TelemetryEventType.PlayerDeath:
        this.event_data = {
          instigatorActorId: this.readVarLong(),
          instigatorMobVariant: this.readVarInt(),
          damageSource: this.readVarInt(),
          diedInRaid: this.readBool()
        };
        break;
      case TelemetryEventType.BossKilled:
        this.event_data = {
          bossActorId: this.readVarLong(),
          partySize: this.readVarInt(),
          bossType: this.readVarInt()
        };
        break;
      case TelemetryEventType.AgentCommand:
        this.event_data = {
          result: this.readVarInt(),
          resultNumber: this.readVarInt(),
          commandName: this.readVarString(),
          resultKey: this.readVarString(),
          resultString: this.readVarString()
        };
        break;
      case TelemetryEventType.AgentCreated:
        this.event_data = {};
        break;
      case TelemetryEventType.BannerPatternRemoved:
        this.event_data = {};
        break;
      case TelemetryEventType.CommandExecuted:
        this.event_data = {
          successCount: this.readVarInt(),
          errorCount: this.readVarInt(),
          commandName: this.readVarString(),
          errorList: this.readVarString()
        };
        break;
      case TelemetryEventType.FishBucketed:
        this.event_data = {};
        break;
      case TelemetryEventType.MobBorn:
        this.event_data = {
          entityType: this.readVarInt(),
          entityVariant: this.readVarInt(),
          color: this.readUint8()
        };
        break;
      case TelemetryEventType.PetDied:
        this.event_data = {
          killedPetEntityType: this.readVarInt(),
          killedPetVariant: this.readVarInt(),
          killerEntityType: this.readVarInt(),
          killerVariant: this.readVarInt(),
          damageSource: this.readVarInt()
        };
        break;
      case TelemetryEventType.CauldronBlockUsed:
        this.event_data = {
          blockInteractionType: this.readVarInt(),
          itemId: this.readVarInt()
        };
        break;
      case TelemetryEventType.ComposterBlockUsed:
        this.event_data = {
          blockInteractionType: this.readVarInt(),
          itemId: this.readVarInt()
        };
        break;
      case TelemetryEventType.BellBlockUsed:
        this.event_data = { itemId: this.readVarInt() };
        break;
      case TelemetryEventType.ActorDefinition:
        this.event_data = { eventName: this.readVarString() };
        break;
      case TelemetryEventType.RaidUpdate:
        this.event_data = {
          currentRaidWave: this.readVarInt(),
          totalRaidWaves: this.readVarInt(),
          wonRaid: this.readBool()
        };
        break;
      case TelemetryEventType.PlayerMovementAnomaly:
        this.event_data = {};
        break;
      case TelemetryEventType.PlayerMovementCorrected:
        this.event_data = {};
        break;
      case TelemetryEventType.HoneyHarvested:
        this.event_data = {};
        break;
      case TelemetryEventType.TargetBlockHit:
        this.event_data = { redstoneLevel: this.readVarInt() };
        break;
      case TelemetryEventType.PiglinBarter:
        this.event_data = {
          itemId: this.readVarInt(),
          wasTargetingBarteringPlayer: this.readBool()
        };
        break;
      case TelemetryEventType.WaxedOrUnwaxedCopper:
        this.event_data = {
          playerWaxedOrUnwaxedCopperBlockId: this.readVarInt()
        };
        break;
      case TelemetryEventType.CodeBuilderRuntimeAction:
        this.event_data = { codeBuilderRuntimeAction: this.readVarString() };
        break;
      case TelemetryEventType.CodeBuilderScoreboard:
        this.event_data = {
          objectiveName: this.readVarString(),
          codeBuilderScoreboardScore: this.readVarInt()
        };
        break;
      case TelemetryEventType.StriderRiddenInLavaInOverworld:
        this.event_data = {};
        break;
      case TelemetryEventType.SneakCloseToSculkSensor:
        this.event_data = {};
        break;
      case TelemetryEventType.CarefulRestoration:
        this.event_data = {};
        break;
      case TelemetryEventType.ItemUsed:
        this.event_data = {
          itemId: this.readShort(),
          itemAux: this.readVarInt(),
          useMethod: this.readVarInt(),
          useCount: this.readVarInt()
        };
        break;
      default:
        this.event_data = undefined;
    }
    return this;
  }
}

export { LegacyTelemetryEventPacket };
