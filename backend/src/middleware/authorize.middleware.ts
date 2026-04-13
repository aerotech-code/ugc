import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {

 
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    const role = req.user.role;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        error: "Forbidden: you don't have access"
      });
    }

    next();
  };
}
