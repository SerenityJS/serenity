import { createHash } from "node:crypto";

import {
  ClientData,
  DisconnectReason,
  LoginPacket,
  LoginTokenData,
  LoginTokens,
  Packet,
  PlayStatus,
  PlayStatusPacket,
  ResourcePacksInfoPacket,
  SerializedSkin
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";
import {
  Authentication,
  AuthenticationType
} from "@bedrock-apis/carolina-authentication";

import { NetworkHandler } from "../network";
import { ClientSystemInfo, Player } from "../entity";
import { PlayerProperties } from "../types";
import { PlayerJoinSignal } from "../events";

class LoginHandler extends NetworkHandler {
  public static readonly packet = Packet.Login;

  public async auth(
    packet: LoginPacket,
    connection: Connection
  ): Promise<void> {
    const { AuthenticationType: type, Token, Certificate } = Authentication.parse(
      packet.tokens.identity
    );
    // Decode the tokens given by the client.
    // This contains the client data, identity data, and public key.
    // Along with the players XUID, display name, and uuid.

    if (type === AuthenticationType.OfflineSelfSigned && !this.serenity.properties.offlineMode)
      return void this.network.disconnectConnection(
        connection,
        "Offline mode is not supported. Please connect to xbox services",
        DisconnectReason.EmptyAuthFromDiscovery
      );

    // Handle authentication based on mode (online vs offline)
    let cpk: string;
    let xid: string;
    let xname: string;
    let uuid: string;

    if (type === AuthenticationType.OfflineSelfSigned) {
      // Offline mode: Token is empty, JWT chain is in Certificate
      // Certificate is JSON: {"chain": ["jwt1", ...]}
      if (!Certificate) {
        throw new Error("Invalid offline login: missing Certificate");
      }
      const offlineData = LoginHandler.parseOfflineCertificate(Certificate);
      cpk = offlineData.cpk;
      xname = offlineData.displayName;
      uuid = offlineData.identity || LoginHandler.getUUIDFromUsername(xname);
      // Generate a fake XUID from username for compatibility with plugins that use XUID for storage
      xid = LoginHandler.getOfflineXUID(xname);
    } else {
      // Online mode: verify with Xbox Live
      const onlineData = await Authentication.authenticate(Token);
      cpk = onlineData.cpk;
      xid = onlineData.xid;
      xname = onlineData.xname;
      uuid = LoginHandler.getUUIDFromXUID(xid);
    }
    const clientData = await Authentication.verify<ClientData>(
      packet.tokens.client,
      cpk
    );

    // Check if the player is already connected by XUID
    const existingPlayer = this.serenity.getPlayerByXuid(xid);
    
    if (existingPlayer) {
      // Disconnect the existing player.
      existingPlayer.disconnect(
        "You have been disconnected from the server because you logged in from another location.",
        DisconnectReason.LoggedInOtherLocation
      );
    }

    // Get the default world, and check if it is undefined.
    // If so, then disconnect the player.
    const world = this.serenity.getWorld();
    if (!world)
      return this.network.disconnectConnection(
        connection,
        "There are no worlds registered within the server process.",
        DisconnectReason.WorldCorruption
      );
    // Get the default dimension, and check if it is undefined.
    // If so, then disconnect the player.
    const dimension = world.getDimension();
    if (!dimension)
      return this.network.disconnectConnection(
        connection,
        "There are no dimensions registered within the world instance.",
        DisconnectReason.WorldCorruption
      );
    // Create a new ClientSystemInfo instance.
    const clientSystemInfo = new ClientSystemInfo(
      clientData.DeviceId,
      clientData.DeviceModel,
      clientData.DeviceOS,
      clientData.MaxViewDistance,
      clientData.MemoryTier
    );

    // Read the player storage data from the world provider.
    const storage = world.provider.readPlayer(uuid);

    // Get the skin from the client data.
    const skin = SerializedSkin.from(clientData);

    // Create the properties for the player
    const properties: Partial<PlayerProperties> = {
      username: xname,
      xuid: xid,
      uuid,
      clientSystemInfo,
      skin
    };

    // Assign the storage if it exists.
    if (storage) properties.storage = storage;

    // Create a new player instance.
    const player = new Player(dimension, connection, properties);

    // Set the players xuid and username.
    this.serenity.players.set(connection, player);

    // Create a new PlayerJoinSignal
    const signal = new PlayerJoinSignal(player).emit();

    // Check if the signal was cancelled.
    if (!signal)
      return void player.disconnect(
        "Failed to join the server.",
        DisconnectReason.Kicked
      );

    // TODO: Enable encryption, the public key is given in the tokens
    // This is with the ClientToSeverHandshake packet & the ServerToClientHandshake packet
    // But for now, we will just send the player the login status, this will skip the encryption
    const login = new PlayStatusPacket();
    login.status = PlayStatus.LoginSuccess;

    // Create a new ResourcePacksInfoPacket
    const resources = new ResourcePacksInfoPacket();
    resources.mustAccept = this.serenity.resources.properties.mustAccept;
    resources.hasAddons = false;
    resources.hasScripts = false;
    resources.forceDisableVibrantVisuals = false;
    resources.worldTemplateUuid = "00000000-0000-0000-0000-000000000000";
    resources.worldTemplateVersion = "";
    resources.packs = this.serenity.resources.getAllPackDescriptors();

    // Log the join event to the console
    world.logger.info(
      `§8[§9${player.username}§8] Event:§r Player joined the server.`
    );

    // Send the player the login status packet and the resource pack info packet.
    player.send(login, resources);
  }

  public handle(packet: LoginPacket, connection: Connection): void {
    this.auth(packet, connection).catch((reason) =>
      this.network.disconnectConnection(
        connection,
        "Your client is not authenticated or your authentication token expired. Error:\n" +
          reason,
        DisconnectReason.NotAuthenticated
      )
    );
  }

  public static getUUIDFromXUID(xuid: string): string {
    return uuidFromBytes(
      new TextEncoder().encode(`pocket-auth-1-xuid:${xuid}`)
    );
  }

  public static getUUIDFromUsername(username: string): string {
    return uuidFromBytes(
      new TextEncoder().encode(`OfflinePlayer:${username}`)
    );
  }

  /**
   * Generates a deterministic fake XUID for offline players
   * Uses a hash of the username to create a consistent 16-digit numeric string
   * @param username The player's username
   * @returns A fake XUID string
   */
  public static getOfflineXUID(username: string): string {
    const hash = createHash("sha256")
      .update(`OfflineXUID:${username}`)
      .digest();
    // Take first 8 bytes and convert to a numeric string
    // XUIDs are typically 16-digit numbers
    const num = hash.readBigUInt64BE(0);
    return num.toString().padStart(16, "0").slice(0, 16);
  }

  /**
   * Parses an offline mode certificate to extract player identity
   * @param certificate The Certificate string containing the JWT chain
   * @returns The parsed offline player data
   */
  public static parseOfflineCertificate(certificate: string): {
    cpk: string;
    displayName: string;
    identity: string;
  } {
    // Certificate is JSON: {"chain": ["jwt1", ...]}
    const certData = JSON.parse(certificate) as { chain: string[] };
    
    // Find the token with extraData (contains player identity)
    for (const jwt of certData.chain) {
      // JWT format: header.payload.signature - we need the payload (middle part)
      const parts = jwt.split(".");
      if (parts.length !== 3) continue;
      
      // Decode base64url payload
      const payload = JSON.parse(
        Buffer.from(parts[1]!, "base64url").toString("utf8")
      ) as {
        extraData?: {
          displayName: string;
          identity: string;
          XUID?: string;
        };
        identityPublicKey?: string;
      };
      
      if (payload.extraData) {
        return {
          cpk: payload.identityPublicKey || "",
          displayName: payload.extraData.displayName,
          identity: payload.extraData.identity
        };
      }
    }
    
    throw new Error("Invalid offline certificate: missing extraData");
  }

  /**
   * Decodes the login tokens and returns the data
   * @param tokens The login tokens
   * @returns The decoded login token data
   */
  public static decode(tokens: LoginTokens): LoginTokenData {
    return {
      clientData: Authentication.partialParse(
        Authentication.split(tokens.client)[1]
      ),
      identityData: null!,
      publicKey: null!
    };
  }
}

function uuidFromBytes(input: Uint8Array): string {
  const bytes = createHash("md5").update(input).digest();
  bytes[6] = (bytes[6]! & 0x0f) | 0x30; // version 3
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // RFC 4122 variant
  return `${bytes.subarray(0, 4).toHex()}-${bytes.subarray(4, 6).toHex()}-${bytes.subarray(6, 8).toHex()}-${bytes.subarray(8, 10).toHex()}-${bytes.subarray(10, 16).toHex()}`;
}

export { LoginHandler };
