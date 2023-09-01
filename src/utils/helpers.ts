export function isAdmin(meta: UserPublicMetadata | undefined) {
  return (meta?.isAdmin as boolean | undefined) || false;
}

export function isVIP(meta: UserPublicMetadata | undefined) {
  return (meta?.isVIP as boolean | undefined) || false;
}
