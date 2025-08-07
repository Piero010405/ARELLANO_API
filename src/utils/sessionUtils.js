export function generateSessionPayload(user, sessionId) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    admin: user.admin,
    photo: user.photo,
    sessionId
  };
}
