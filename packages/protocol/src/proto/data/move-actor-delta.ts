import { Proto } from "@serenityjs/raknet";
import { Endianness } from "@serenityjs/binarystream";

import { MoveDeltaFlags, Packet } from "../../enums";
import { RotationByte } from "../types";

import { DataPacket } from "./data-packet";

/**
 * Moves an actor relative to its last known position.
 * Since v2168, the packed flag header is replaced by optional fields (whose presence is given by the
 * `Has*` flags) and standalone booleans; `flags` is kept as the bitmask of both.
 */
@Proto(Packet.MoveActorDelta)
class MoveActorDeltaPacket extends DataPacket {
  public runtimeId!: bigint;

  /**
   * The flags of the movement, see {@link MoveDeltaFlags}.
   */
  public flags!: number;

  public x!: number;
  public y!: number;
  public z!: number;
  public pitch!: number;
  public yaw!: number;
  public headYaw!: number;

  /**
   * The tick of the movement.
   */
  public ticks = 0n;

  public override serialize(): Buffer {
    // Reset the offset, as the same packet may be serialized more than once (e.g. when broadcasting)
    this.offset = 0;

    // Write the packet id and the runtime id of the actor
    this.writeVarInt(Packet.MoveActorDelta);
    this.writeVarLong(this.runtimeId);

    // Write the optional position fields
    this.writeOptionalFloat(MoveDeltaFlags.HasX, this.x);
    this.writeOptionalFloat(MoveDeltaFlags.HasY, this.y);
    this.writeOptionalFloat(MoveDeltaFlags.HasZ, this.z);

    // Write the optional rotation fields
    this.writeOptionalRotation(MoveDeltaFlags.HasRotationX, this.pitch);
    this.writeOptionalRotation(MoveDeltaFlags.HasRotationY, this.yaw);
    this.writeOptionalRotation(MoveDeltaFlags.HasRotationZ, this.headYaw);

    // Write the standalone booleans
    this.writeBool(this.hasFlag(MoveDeltaFlags.OnGround));
    this.writeBool(this.hasFlag(MoveDeltaFlags.Teleport));
    this.writeBool(this.hasFlag(MoveDeltaFlags.ForceMove));
    this.writeBool(this.hasFlag(MoveDeltaFlags.ForceCompletion));

    // Write the tick of the movement
    this.writeVarLong(this.ticks);

    return this.getBuffer();
  }

  public override deserialize(): this {
    // Read the packet id and the runtime id of the actor
    this.readVarInt();
    this.runtimeId = this.readVarLong();
    this.flags = 0;

    // Read the optional position fields
    this.x = this.readOptionalFloat(MoveDeltaFlags.HasX);
    this.y = this.readOptionalFloat(MoveDeltaFlags.HasY);
    this.z = this.readOptionalFloat(MoveDeltaFlags.HasZ);

    // Read the optional rotation fields
    this.pitch = this.readOptionalRotation(MoveDeltaFlags.HasRotationX);
    this.yaw = this.readOptionalRotation(MoveDeltaFlags.HasRotationY);
    this.headYaw = this.readOptionalRotation(MoveDeltaFlags.HasRotationZ);

    // Read the standalone booleans
    if (this.readBool()) this.flags |= MoveDeltaFlags.OnGround;
    if (this.readBool()) this.flags |= MoveDeltaFlags.Teleport;
    if (this.readBool()) this.flags |= MoveDeltaFlags.ForceMove;
    if (this.readBool()) this.flags |= MoveDeltaFlags.ForceCompletion;

    // Read the tick of the movement
    this.ticks = this.readVarLong();

    return this;
  }

  private hasFlag(flag: MoveDeltaFlags): boolean {
    return (this.flags & flag) === flag;
  }

  private writeOptionalFloat(flag: MoveDeltaFlags, value: number): void {
    const present = this.hasFlag(flag);
    this.writeBool(present);
    if (present) this.writeFloat32(value, Endianness.Little);
  }

  private writeOptionalRotation(flag: MoveDeltaFlags, value: number): void {
    const present = this.hasFlag(flag);
    this.writeBool(present);
    if (present) RotationByte.write(this, value);
  }

  private readOptionalFloat(flag: MoveDeltaFlags): number {
    if (!this.readBool()) return 0;
    this.flags |= flag;
    return this.readFloat32(Endianness.Little);
  }

  private readOptionalRotation(flag: MoveDeltaFlags): number {
    if (!this.readBool()) return 0;
    this.flags |= flag;
    return RotationByte.read(this);
  }
}

export { MoveActorDeltaPacket };
