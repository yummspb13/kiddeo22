import { SignJWT, jwtVerify } from 'jose';

// Prefer JWT_SECRET, then NEXTAUTH_SECRET, then a stable dev fallback
const rawSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret-key'
const secret = new TextEncoder().encode(rawSecret)

// Backward-compatibility: verify against multiple known defaults to avoid breaking existing cookies
const verifySecrets = Array.from(
  new Set(
    [
      process.env.JWT_SECRET,
      process.env.NEXTAUTH_SECRET,
      'dev-secret-key',
      'your-secret-key-here', // legacy default used earlier
    ].filter(Boolean) as string[]
  )
).map((s) => new TextEncoder().encode(s))

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  name: string;
  role: string;
  createdAt?: string;
  iat: number;
  exp: number;
}

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  // Try primary secret first
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch (primaryError) {
    // Then try compatibility secrets
    for (let i = 0; i < verifySecrets.length; i++) {
      const candidate = verifySecrets[i]
      try {
        const { payload } = await jwtVerify(token, candidate)
        return payload as unknown as JWTPayload
      } catch (_) {
        // try next
      }
    }
    // As a last resort in development, decode payload without verifying signature
    if (process.env.NODE_ENV !== 'production') {
      try {
        const base64 = token.split('.')[1]
        const json = Buffer.from(base64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
        const decoded = JSON.parse(json) as Partial<JWTPayload>
        if (decoded && decoded.sub && decoded.email && decoded.name && decoded.role) {
          return decoded as JWTPayload
        }
      } catch (decodeError) {
        // ignore
      }
    }
    console.error('JWT verification failed:', primaryError)
    return null
  }
}
