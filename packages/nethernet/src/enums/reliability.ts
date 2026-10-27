/**
 * The data channel a message is sent or received on.
 */
enum Reliability {
  /**
   * The reliable and ordered data channel, which supports segmented messages.
   */
  Reliable,

  /**
   * The unreliable and unordered data channel, which only carries unsegmented messages.
   */
  Unreliable
}

export { Reliability };
