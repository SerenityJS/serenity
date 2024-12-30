import {
  AvailableActorIdentifiersPacket,
  Difficulty,
  DisconnectReason,
  ItemComponentPacket,
  MINECRAFT_VERSION,
  Packet,
  PlayStatus,
  PlayStatusPacket,
  ResourceIdVersions,
  ResourcePackClientResponsePacket,
  ResourcePackDataInfoPacket,
  ResourcePackResponse,
  ResourcePackStackPacket,
  StartGamePacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";
import { CompoundTag, TagType } from "@serenityjs/nbt";

import { NetworkHandler } from "../network";
import { ResourcePack } from "../resource-packs";
import { ItemType } from "../item";
import { CustomBlockType } from "../block";
import { EntityType } from "../entity";

class ResourcePackClientResponseHandler extends NetworkHandler {
  public static readonly packet = Packet.ResourcePackClientResponse;

  public handle(
    packet: ResourcePackClientResponsePacket,
    connection: Connection
  ): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the players current world
    const world = player.dimension.world;

    this.serenity.resourcePacks.logger.debug(
      `Player '${player.username}' responded to resource packs with response '${ResourcePackResponse[packet.response]}' (${packet.response})`
    );

    switch (packet.response) {
      default: {
        // Debug the unhandled ResourcePackClientResponse
        this.serenity.logger.debug(
          `Unhandled ResourcePackClientResponse: ${ResourcePackResponse[packet.response]}`
        );
        break;
      }

      case ResourcePackResponse.Refused: {
        // This means the resource packs must be accepted but the client didn't accept them
        player.disconnect(
          "Must accept resource packs.",
          DisconnectReason.Kicked
        );

        this.serenity.resourcePacks.logger.info(
          `Kicked player '${player.username}' for refusing required resource packs.`
        );

        return;
      }

      case ResourcePackResponse.SendPacks: {
        this.serenity.resourcePacks.logger.info(
          `Player '${player.username}' requested ${packet.packs.length} resource packs.`
        );

        for (const packId of packet.packs) {
          const pack = this.serenity.resourcePacks.getPack(packId);

          // This should never happen
          if (!pack) {
            this.serenity.resourcePacks.logger.error(
              `Player '${player.username}' requested pack '${packId}' which cannot be found.`
            );
            // Not sure if this blocks the login process, may need to kick the player if so.
            // More testing needed, especially if we plan to implement dynamically changing the pack stack while the server is running.
            continue;
          }

          const dataInfoPacket = new ResourcePackDataInfoPacket();

          dataInfoPacket.packId = packId;
          dataInfoPacket.maxChunkSize = ResourcePack.MAX_CHUNK_SIZE;
          dataInfoPacket.chunkCount = pack.getChunkCount();
          dataInfoPacket.fileSize = pack.compressedSize;
          dataInfoPacket.fileHash = pack.getHash();
          dataInfoPacket.isPremium = false;
          dataInfoPacket.packType = pack.packType;

          player.send(dataInfoPacket);
        }

        return;
      }

      case ResourcePackResponse.HaveAllPacks: {
        // Create a new ResourcePackStackPacket
        const stack = new ResourcePackStackPacket();
        stack.mustAccept = false; // this.serenity.resourcePacks.mustAcceptResourcePacks;
        stack.behaviorPacks = [];
        stack.gameVersion = MINECRAFT_VERSION;
        stack.experiments = [];
        stack.experimentsPreviouslyToggled = false;
        stack.hasEditorPacks = false;

        stack.texturePacks = [];
        for (const pack of this.serenity.resourcePacks.getPacks()) {
          const packInfo = new ResourceIdVersions(
            pack.name,
            pack.uuid,
            pack.version
          );

          stack.texturePacks.push(packInfo);
        }

        // Send the ResourcePackStackPacket to the player
        return player.send(stack);
      }

      case ResourcePackResponse.Completed: {
        const packet = new StartGamePacket();
        packet.entityId = player.uniqueId;
        packet.runtimeEntityId = player.runtimeId;
        packet.playerGamemode = player.gamemode;
        packet.playerPosition = player.position;
        packet.pitch = player.rotation.pitch;
        packet.yaw = player.rotation.yaw;
        packet.seed = BigInt(player.dimension.generator.properties.seed);
        packet.biomeType = 0;
        packet.biomeName = "plains";
        packet.dimension = player.dimension.type;
        packet.generator = 1;
        packet.worldGamemode = 0;
        packet.hardcore = false;
        packet.difficulty = Difficulty.Easy;
        packet.spawnPosition = player.dimension.spawnPosition;
        packet.achievementsDisabled = true;
        packet.editorWorldType = 0;
        packet.createdInEdior = false;
        packet.exportedFromEdior = false;
        packet.dayCycleStopTime = player.dimension.world.dayTime;
        packet.eduOffer = 0;
        packet.eduFeatures = true;
        packet.eduProductUuid = "";
        packet.rainLevel = 0;
        packet.lightningLevel = 0;
        packet.confirmedPlatformLockedContent = false;
        packet.multiplayerGame = true;
        packet.broadcastToLan = true;
        packet.xblBroadcastMode = 6;
        packet.platformBroadcastMode = 6;
        packet.commandsEnabled = true;
        packet.texturePacksRequired = false;
        packet.gamerules = [
          {
            name: "commandblockoutput",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "dodaylightcycle",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "doentitydrops",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "dofiretick",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "recipesunlock",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "dolimitedcrafting",
            editable: true,
            type: 1,
            value: false
          },
          {
            name: "domobloot",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "domobspawning",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "dotiledrops",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "doweathercycle",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "drowningdamage",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "falldamage",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "firedamage",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "keepinventory",
            editable: true,
            type: 1,
            value: false
          },
          {
            name: "mobgriefing",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "pvp",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "showcoordinates",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "naturalregeneration",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "tntexplodes",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "sendcommandfeedback",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "maxcommandchainlength",
            editable: true,
            type: 2,
            value: 65_535
          },
          {
            name: "doinsomnia",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "commandblocksenabled",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "randomtickspeed",
            editable: true,
            type: 2,
            value: 1
          },
          {
            name: "doimmediaterespawn",
            editable: true,
            type: 1,
            value: false
          },
          {
            name: "showdeathmessages",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "functioncommandlimit",
            editable: true,
            type: 2,
            value: 10_000
          },
          {
            name: "spawnradius",
            editable: true,
            type: 2,
            value: 10
          },
          {
            name: "showtags",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "freezedamage",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "respawnblocksexplode",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "showbordereffect",
            editable: true,
            type: 1,
            value: true
          },
          {
            name: "playerssleepingpercentage",
            editable: true,
            type: 2,
            value: 100
          }
        ];
        packet.experiments = [];
        packet.experimentsPreviouslyToggled = false;
        packet.bonusChest = false;
        packet.mapEnabled = false;
        packet.permissionLevel = player.permission;
        packet.serverChunkTickRange = player.dimension.simulationDistance >> 4;
        packet.hasLockedBehaviorPack = false;
        packet.hasLockedResourcePack = false;
        packet.isFromLockedWorldTemplate = false;
        packet.useMsaGamertagsOnly = false;
        packet.isFromWorldTemplate = false;
        packet.isWorldTemplateOptionLocked = false;
        packet.onlySpawnV1Villagers = false;
        packet.personaDisabled = false;
        packet.customSkinsDisabled = false;
        packet.emoteChatMuted = false;
        packet.gameVersion = MINECRAFT_VERSION;
        packet.limitedWorldWidth = 16;
        packet.limitedWorldLength = 16;
        packet.isNewNether = false;
        packet.eduResourceUriButtonName = "";
        packet.eduResourceUriLink = "";
        packet.experimentalGameplayOverride = false;
        packet.chatRestrictionLevel = 0;
        packet.disablePlayerInteractions = false;
        packet.serverIdentfier = "SerenityJS";
        packet.worldIdentifier = player.dimension.world.identifier;
        packet.scenarioIdentifier = "SerenityJS";
        packet.levelId = "SerenityJS";
        packet.worldName = player.dimension.world.identifier;
        packet.premiumWorldTemplateId = "00000000-0000-0000-0000-000000000000";
        packet.isTrial = false;
        packet.movementAuthority = 2;
        packet.rewindHistorySize = 0;
        packet.serverAuthoritativeBlockBreaking = true;
        packet.currentTick = player.dimension.world.currentTick;
        packet.enchantmentSeed = 0;

        // Map the custom blocks to the packet
        packet.blockProperties = world.blockPalette
          .getAllCustomTypes()
          .map((block) => CustomBlockType.toBlockProperty(block));

        // Map the custom items to the packet
        packet.items = world.itemPalette
          .getAllTypes()
          .map((item) => ItemType.toItemData(item));

        packet.multiplayerCorrelationId = "<raknet>a555-7ece-2f1c-8f69";
        packet.serverAuthoritativeInventory = true;
        packet.engine = "*";
        packet.propertyData1 = 0x0a;
        packet.propertyData2 = 0x00;
        packet.propertyData3 = 0x00;
        packet.blockPaletteChecksum = 0n;
        packet.worldTemplateId = "00000000000000000000000000000000";
        packet.clientSideGeneration = false;
        packet.blockNetworkIdsAreHashes = true;
        packet.serverControlledSounds = true;

        // Get all the custom item properties
        const items = new ItemComponentPacket();
        items.items = world.itemPalette.getAllCustomTypes().map((item) => {
          return { name: item.identifier, data: item.nbt };
        });

        // Get the available actor identifiers
        const actors = new AvailableActorIdentifiersPacket();
        actors.data = new CompoundTag();

        // Create a new list tag for the entities
        const list = actors.data.createListTag<CompoundTag<unknown>>({
          name: "idlist",
          value: [],
          listType: TagType.Compound
        });

        // Push all the entity types to the list
        for (const entry of world.entityPalette.getAllTypes()) {
          // Create a new compound tag for the entity
          const entity = EntityType.toNbt(entry);

          // Push the entity to the list
          list.value.push(entity);
        }

        const status = new PlayStatusPacket();
        status.status = PlayStatus.PlayerSpawn;

        player.sendImmediate(packet, status, actors, items);
      }
    }
  }
}

export { ResourcePackClientResponseHandler };
