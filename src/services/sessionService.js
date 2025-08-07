import { createOrUpdateActiveSession, getActiveSession, deleteActiveSession } from '../models/sessionModel.js';
import { v4 as uuidv4 } from 'uuid';

export async function assignUserSession(userId) {
  const sessionId = uuidv4();
  await createOrUpdateActiveSession(userId, sessionId);
  return sessionId;
}

export async function validateUserSession(userId, sessionId) {
  const currentSession = await getActiveSession(userId);
  return currentSession && currentSession.SESSION_ID === sessionId;
}

export async function clearUserSession(userId) {
  await deleteActiveSession(userId);
}
