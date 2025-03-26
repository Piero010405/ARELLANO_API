import sql from 'mssql';
import { getConnection } from '../database/db.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, invalidateUserRefreshTokens} from '../tokens/tokenManager.js';

export async function login(email, password) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('email', sql.NVarChar(255), email)
    .query('SELECT * FROM [dbo].[AS] WHERE EMAIL = @email');

  if (result.recordset.length === 0) {
    throw new Error('User not found');
  }

  const user = result.recordset[0];
  const isPasswordValid = bcrypt.compareSync(password, user.PASSWORD);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Antes de generar un nuevo `refreshToken`, invalidar los anteriores
  await invalidateUserRefreshTokens(user.id);

  const payload = { id: user.SUPERVISOR_ID, email: user.EMAIL, name: user.NOMBRE };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.SUPERVISOR_ID,
      admin: user.ADMIN,
      email: user.EMAIL,
      name: user.NOMBRE,
      photo: user.FOTO
    }
  };
}