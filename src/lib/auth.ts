import jwt from 'jsonwebtoken';

// Секретные ключи для подписи токенов
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-secret-key-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key-change-in-production';

// Время жизни токенов
const ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15 минут
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 дней

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

export class AuthManager {
  /**
   * Создает access токен для авторизованного пользователя
   */
  static generateAccessToken(userId: string, username: string, role: string = 'admin'): string {
    const payload: TokenPayload = {
      userId,
      username,
      role
    };

    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
  }

  /**
   * Создает refresh токен для обновления access токена
   */
  static generateRefreshToken(userId: string): string {
    const payload: RefreshTokenPayload = {
      userId,
      type: 'refresh'
    };

    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });
  }

  /**
   * Проверяет и декодирует access токен
   */
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      console.error('Access token verification failed:', error);
      return null;
    }
  }

  /**
   * Проверяет и декодирует refresh токен
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
      if (decoded.type !== 'refresh') {
        return null;
      }
      return decoded;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  /**
   * Обновляет access токен используя refresh токен
   */
  static refreshAccessToken(refreshToken: string): { accessToken: string; refreshToken: string } | null {
    const decoded = this.verifyRefreshToken(refreshToken);
    if (!decoded) {
      return null;
    }

    // Создаем новый access токен
    const newAccessToken = this.generateAccessToken(decoded.userId, 'admin', 'admin');
    
    // Создаем новый refresh токен (ротация токенов для безопасности)
    const newRefreshToken = this.generateRefreshToken(decoded.userId);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Проверяет credentials пользователя с базой данных
   */
  static async validateCredentials(username: string, password: string): Promise<{ userId: string; username: string; role: string } | null> {
    try {
      // Импортируем необходимые модули
      const { User } = await import('@/lib/db/models/User');
      const { connectToDatabase } = await import('@/lib/db/mongodb');
      const bcrypt = await import('bcryptjs');
      
      await connectToDatabase();

      // Ищем пользователя по email, username, login, name
      const user = await User.findOne({
        $or: [
          { email: username },
          { username: username },
          { login: username },
          { name: username }
        ],
        isActive: true
      });

      if (!user) {
        return null;
      }

      // Проверяем пароль
      const isMatch = await bcrypt.default.compare(password, user.password);
      if (!isMatch) {
        return null;
      }

      return {
        userId: user._id.toString(),
        username: user.username || user.login || user.name || 'Unknown',
        role: user.role || 'admin'
      };
    } catch (error) {
      console.error('Error validating credentials:', error);
      return null;
    }
  }

  /**
   * Создает пару токенов для пользователя
   */
  static async createTokenPair(userId: string, username: string, role: string = 'admin'): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(userId, username, role);
    const refreshToken = this.generateRefreshToken(userId);

    return {
      accessToken,
      refreshToken
    };
  }
}

/**
 * Проверяет, является ли токен валидным access токеном
 */
export function isValidAccessToken(token: string): boolean {
  const decoded = AuthManager.verifyAccessToken(token);
  return decoded !== null;
}

/**
 * Проверяет, является ли токен валидным refresh токеном
 */
export function isValidRefreshToken(token: string): boolean {
  const decoded = AuthManager.verifyRefreshToken(token);
  return decoded !== null;
}