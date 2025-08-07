export function generateSessionPayload(user, sessionId) {
  return {
    id: user.SUPERVISOR_ID,
    email: user.EMAIL,
    name: user.NOMBRE,
    admin: user.ADMIN,
    photo: user.FOTO,
    sessionId,
  };
}
