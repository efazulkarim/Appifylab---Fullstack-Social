import type { User } from "@prisma/client";
import type { typeToFlatten } from "zod";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      validationError?: typeToFlatten<any>;
    }
  }
}

