import {
  DeviceOS,
  InputMode,
  InteractionMode,
  MemoryTier,
  PlayMode
} from "@serenityjs/protocol";

class ClientSystemInfo {
  /**
   * The identifier of the device.
   * This is a uuid string.
   */
  public readonly identifier: string;

  /**
   * The model of the device.
   */
  public readonly model: string;

  /**
   * The operating system of the device.
   */
  public readonly os: DeviceOS;

  /**
   * The maximum view distance of the device.
   */
  public readonly maxViewDistance: number;

  /**
   * The memory tier of the device.
   */
  public readonly memoryTier: MemoryTier;

  /**
   * The input mode of the device.
   */
  public inputMode: InputMode = InputMode.Unknown;

  /**
   * The interaction mode of the device.
   */
  public interactionMode: InteractionMode = InteractionMode.Classic;

  /**
   * The play mode of the device.
   */
  public playMode: PlayMode = PlayMode.Normal;

  /**
   * Creates a new device information object.
   * @param identifier The identifier of the device.
   * @param model The model of the device.
   * @param os The operating system of the device.
   * @param maxViewDistance The maximum view distance of the device.
   * @param memoryTier The memory tier of the device.
   */
  public constructor(
    identifier: string,
    model: string,
    os: DeviceOS,
    maxViewDistance: number,
    memoryTier: MemoryTier
  ) {
    this.identifier = identifier;
    this.model = model;
    this.os = os;
    this.maxViewDistance = maxViewDistance;
    this.memoryTier = memoryTier;
  }

  /**
   * Returns an empty device object.
   * @returns An empty device object.
   */
  public static empty(): ClientSystemInfo {
    return new ClientSystemInfo(
      "",
      "",
      DeviceOS.Undefined,
      0,
      MemoryTier.Undetermined
    );
  }
}

export { ClientSystemInfo };
