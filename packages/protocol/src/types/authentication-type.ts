enum AuthenticationType {
  Full = 0, // The player's own token
  Guest = 1, // Split screen sessions, the player is using the host's token
  SelfSigned = 2 // Not authenticated
}

export { AuthenticationType }