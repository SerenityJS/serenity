/**
 * The type of a sound data update (SoundDataEventType).
 * Since v2225, this is written as the leading uint8 tag of the update.
 */
enum SoundDataUpdateType {
  Stop = 0,
  SetVolume = 1,
  SetPitch = 2,
  Fade = 3,
  SeekTo = 4,
  Pause = 5,
  Resume = 6
}

export { SoundDataUpdateType };
