import dotenv from "dotenv";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import { validateRuntimeEnv } from "./config/env.js";

dotenv.config();

/**
 * Mengecek konektivitas live MongoDB dan Cloudinary secara read-only tanpa mengubah data.
 */
async function runSmokeCheck() {
  validateRuntimeEnv();

  const mongoUri = process.env.MONGO_URI?.trim();
  if (!mongoUri) {
    throw new Error("MONGO_URI belum diset untuk smoke check");
  }

  await mongoose.connect(mongoUri);
  await mongoose.connection.db.admin().ping();
  console.log("[smoke] MongoDB ping: ok");

  const hasCloudinary =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME?.trim()) &&
    Boolean(process.env.CLOUDINARY_API_KEY?.trim()) &&
    Boolean(process.env.CLOUDINARY_API_SECRET?.trim());

  if (!hasCloudinary) {
    throw new Error("Kredensial CLOUDINARY_* belum lengkap untuk smoke check");
  }

  const cloudResult = await cloudinary.api.ping();
  if (cloudResult?.status !== "ok") {
    throw new Error(`Cloudinary ping gagal: ${JSON.stringify(cloudResult)}`);
  }
  console.log("[smoke] Cloudinary ping: ok");

  await mongoose.disconnect();
}

runSmokeCheck()
  .then(() => {
    console.log("[smoke] Semua pengecekan koneksi live berhasil.");
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("[smoke] Gagal:", err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    process.exit(1);
  });
