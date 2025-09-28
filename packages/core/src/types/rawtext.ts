export interface RawText {
  /**
   * @remarks
   * A serialization of the current value of an associated sign.
   *
   */
  rawtext?: Array<RawMessage>;
}

export interface RawMessage extends RawText {
  /**
   * @remarks
   * Provides a token that will get replaced with the value of a
   * score.
   *
   */
  score?: RawMessageScore;

  /**
   * @remarks
   * Provides a string literal value to use.
   *
   */
  text?: string;

  /**
   * @remarks
   * Provides a translation token where, if the client has an
   * available resource in the players' language which matches
   * the token, will get translated on the client.
   *
   */
  translate?: string;

  /**
   * @remarks
   * Arguments for the translation token. Can be either an array
   * of strings or RawMessage containing an array of raw text
   * objects.
   */
  with?: Array<string> | RawMessage;
}

export interface RawMessageScore {
  /**
   * @remarks
   * Name of the score value to match.
   *
   */
  name?: string;

  /**
   * @remarks
   * Name of the score value to match.
   *
   */
  objective?: string;
}
