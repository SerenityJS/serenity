// Contains the current protocol version and Minecraft version

const PROTOCOL_VERSION = 844;
const MINECRAFT_SEM_VERSION: [number, number, number] = [1, 21, 110];
const MINECRAFT_VERSION = MINECRAFT_SEM_VERSION.join(".");
const MINECRAFT_TICK_SPEED = 50;

const BLOCK_STATE_VERSION =
  (MINECRAFT_SEM_VERSION[0] << 24) |
  (MINECRAFT_SEM_VERSION[1] << 16) |
  (MINECRAFT_SEM_VERSION[2] << 8);

const SHIELD_NETWORK_ID = 380;

export {
  PROTOCOL_VERSION,
  MINECRAFT_SEM_VERSION,
  MINECRAFT_VERSION,
  MINECRAFT_TICK_SPEED,
  BLOCK_STATE_VERSION,
  SHIELD_NETWORK_ID
};

export * from "./default-ability-values";
