import dotenv from 'dotenv'

dotenv.config({
  path: `.env`
});

export const {
  PORT,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
} = process.env;
