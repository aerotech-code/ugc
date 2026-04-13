import jwt from 'jsonwebtoken'

const ACCESS_TOKEN= process.env.JWT_SECRET || process.env.ACCESS_TOKEN || "devsecret"
const REFRESH_TOKEN=process.env.REFRESH_TOKEN_SECRET || process.env.REFRESH_TOKEN || "devsecret"


export function generateAccessToken(payload: {userId: string; role: string;}) {
  return jwt.sign(payload, ACCESS_TOKEN, {
    expiresIn: "15m"
  });
}


export function generateRefreshToken(payload: {userId: string}) {
  return jwt.sign(payload, REFRESH_TOKEN, {
    expiresIn: "7d"
  });
}   


export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_TOKEN);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_TOKEN);
}

