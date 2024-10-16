enum MoveDeltaFlags {
  HasX = 0x01,
  HasY = 0x02,
  HasZ = 0x04,
  HasRotationX = 0x08,
  HasRotationY = 0x10,
  HasRotationZ = 0x20,
  OnGround = 0x40,
  Teleport = 0x80,
  ForceMove = 0x100,
  All = 0x3f
}

export { MoveDeltaFlags };
