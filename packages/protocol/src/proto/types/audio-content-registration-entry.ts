import { BinaryStream, DataType } from "@serenityjs/binarystream";

/**
 * Represents a signed audio content registration sent by the client.
 * Each signed audio content is serialized as a compact JWT string.
 */
class AudioContentRegistrationEntry extends DataType {
  /**
   * The identifier of the audio content.
   */
  public audioContentId: string;

  /**
   * The signed shared metadata of the audio content, as a compact JWT.
   */
  public sharedMetadata: string;

  /**
   * The signed server content of the audio content, as a compact JWT.
   */
  public serverContent: string;

  /**
   * The signed playback content of the audio content, as a compact JWT.
   */
  public playbackContent: string;

  /**
   * Creates a new audio content registration entry.
   * @param audioContentId The identifier of the audio content.
   * @param sharedMetadata The signed shared metadata of the audio content.
   * @param serverContent The signed server content of the audio content.
   * @param playbackContent The signed playback content of the audio content.
   */
  public constructor(
    audioContentId: string,
    sharedMetadata: string,
    serverContent: string,
    playbackContent: string
  ) {
    super();
    this.audioContentId = audioContentId;
    this.sharedMetadata = sharedMetadata;
    this.serverContent = serverContent;
    this.playbackContent = playbackContent;
  }

  public static read(
    stream: BinaryStream
  ): Array<AudioContentRegistrationEntry> {
    // Read the amount of registrations
    const amount = stream.readVarInt();

    // Prepare an array to store the registrations
    const registrations: Array<AudioContentRegistrationEntry> = [];

    // Read each registration
    for (let index = 0; index < amount; index++) {
      const audioContentId = stream.readVarString();
      const sharedMetadata = stream.readVarString();
      const serverContent = stream.readVarString();
      const playbackContent = stream.readVarString();

      registrations.push(
        new this(audioContentId, sharedMetadata, serverContent, playbackContent)
      );
    }

    // Return the registrations
    return registrations;
  }

  public static write(
    stream: BinaryStream,
    value: Array<AudioContentRegistrationEntry>
  ): void {
    // Write the amount of registrations
    stream.writeVarInt(value.length);

    // Write each registration
    for (const registration of value) {
      stream.writeVarString(registration.audioContentId);
      stream.writeVarString(registration.sharedMetadata);
      stream.writeVarString(registration.serverContent);
      stream.writeVarString(registration.playbackContent);
    }
  }
}

export { AudioContentRegistrationEntry };
