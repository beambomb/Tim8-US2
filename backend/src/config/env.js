export const DEV_JWT_FALLBACK = "rahasia_jwt_carikos_123";

/**
 * Mengambil secret JWT dan memblokir fallback dev saat berjalan di production.
 */
export function getJwtSecret() {
  const configured = process.env.JWT_SECRET?.trim();
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && (!configured || configured === DEV_JWT_FALLBACK)) {
    throw new Error(
      "JWT_SECRET wajib diset dan tidak boleh memakai nilai default di production"
    );
  }

  return configured || DEV_JWT_FALLBACK;
}

/**
 * Mem-parse daftar origin CORS yang diizinkan dari CORS_ORIGIN atau CLIENT_URL.
 */
export function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN || process.env.CLIENT_URL || "";
  const origins = raw
    .split(",")
    .map((item) => item.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return [...new Set(origins)];
}

/**
 * Membangun opsi CORS bersama untuk Express dan Socket.IO.
 */
export function getCorsOptions() {
  const allowedOrigins = getAllowedOrigins();
  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

  if (allowedOrigins.length === 0) {
    return { origin: "*", methods };
  }

  return {
    origin(origin, callback) {
      const normalized = origin ? origin.replace(/\/+$/, "") : "";
      if (!origin || allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      const err = new Error("Origin tidak diizinkan oleh CORS");
      err.status = 403;
      return callback(err);
    },
    credentials: true,
    methods,
  };
}

/**
 * Memvalidasi environment variable kritikal saat server startup.
 */
export function validateRuntimeEnv() {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    getJwtSecret();

    if (!process.env.MONGO_URI?.trim()) {
      throw new Error("MONGO_URI wajib diset di environment production");
    }

    if (getAllowedOrigins().length === 0) {
      console.warn(
        "[env] Peringatan: CORS_ORIGIN/CLIENT_URL belum diset di production, CORS memakai wildcard (*)"
      );
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
      !process.env.CLOUDINARY_API_KEY?.trim() ||
      !process.env.CLOUDINARY_API_SECRET?.trim()
    ) {
      console.warn(
        "[env] Peringatan: Kredensial CLOUDINARY_* belum lengkap, upload gambar akan gagal"
      );
    }
  }
}
