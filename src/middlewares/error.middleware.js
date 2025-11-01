import { Prisma } from "@prisma/client";

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Known Prisma errors (DB constraint issues, etc.)
    switch (err.code) {
      case "P2002":
        return res.status(409).json({ error: "Duplicate field value" });
      case "P2003":
        return res.status(400).json({ error: "Foreign key constraint failed" });
      case "P2025":
        return res.status(404).json({ error: "Record not found" });
      default:
        return res.status(500).json({ error: "Database operation failed" });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: "Invalid data format or missing field" });
  }

  // Unknown or generic error
  return res.status(500).json({ error: "Internal Server Error" });
}
