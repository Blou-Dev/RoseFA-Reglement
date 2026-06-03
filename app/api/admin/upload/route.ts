import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { assertAdminAccess } from "@/lib/auth-guard";

const allowedMimeTypes: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const folder = process.env.CLOUDINARY_FOLDER?.trim() || "rosefa-docs";

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder,
  };
}

async function uploadToCloudinary(file: File) {
  const config = getCloudinaryConfig();
  if (!config) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=${config.folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(`${paramsToSign}${config.apiSecret}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", config.folder);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(payload?.error?.message || "CLOUDINARY_UPLOAD_FAILED");
  }

  const payload = (await response.json()) as { secure_url?: string };
  if (!payload.secure_url) {
    throw new Error("CLOUDINARY_UPLOAD_FAILED");
  }

  return payload.secure_url;
}

async function uploadLocally(file: File) {
  const extension = allowedMimeTypes[file.type] ?? (path.extname(file.name) || ".png");
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const uploadPath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(uploadPath, Buffer.from(bytes));

  return `/uploads/${fileName}`;
}

export async function POST(request: Request) {
  try {
    await assertAdminAccess();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!allowedMimeTypes[file.type]) {
    return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  try {
    const cloudinaryUrl = await uploadToCloudinary(file);

    if (cloudinaryUrl) {
      return NextResponse.json({
        url: cloudinaryUrl,
        storage: "cloudinary",
      });
    }

    const localUrl = await uploadLocally(file);

    return NextResponse.json({
      url: localUrl,
      storage: "local",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload impossible",
      },
      { status: 500 },
    );
  }
}
