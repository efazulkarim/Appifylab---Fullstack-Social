import type { typeToFlatten } from "zod";

/**
 * Narrow user type for req.user — excludes sensitive fields like
 * passwordHash and googleId that should never leave the auth layer.
 */
export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      validationError?: typeToFlatten<any>;
    }
  }
}
