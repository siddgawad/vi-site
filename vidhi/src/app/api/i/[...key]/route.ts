// src/app/api/i/[...key]/route.ts   ← or app/... if you don’t use /src
export const runtime = "nodejs"; // AWS SDK needs Node

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { s3 } from "@/lib/s3";

interface S3Error {
  $metadata?: { httpStatusCode?: number };
  Code?: string;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  // 1) join + sanitize
  const { key: keyArray } = await params;
  const key = (keyArray || []).join("/");

  // DEBUG - remove after testing
  console.log("=== DEBUG INFO ===");
  console.log("Raw keyArray:", keyArray);
  console.log("Joined key:", key);
  console.log("S3_BUCKET:", process.env.S3_BUCKET);
  console.log("S3_PREFIX:", process.env.S3_PREFIX);
  console.log("AWS_REGION:", process.env.AWS_REGION);
  console.log("Has AWS_ACCESS_KEY_ID:", !!process.env.AWS_ACCESS_KEY_ID);
  console.log("==================");
  



  if (key.includes("..") || key.startsWith("/")) {
    return new Response("bad key", { status: 400 });
  }

  // 2) allowlist prefix
  const prefix = process.env.S3_PREFIX ?? "love/";
  if (!key.startsWith(prefix)) {
    return new Response("forbidden", { status: 403 });
  }

  try {
    // 3) fetch
    const r = await s3.send(
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key })
    );

    // 4) stream + headers
    const web = Readable.toWeb(r.Body as Readable);
    const h = new Headers();
    h.set("Content-Type", r.ContentType ?? "application/octet-stream");
    if (r.ETag) h.set("ETag", r.ETag);
    if (r.LastModified) h.set("Last-Modified", r.LastModified.toUTCString());
    h.set("Cache-Control", "public, max-age=0, s-maxage=31536000, immutable");

    return new Response(web as BodyInit, { headers: h });
  } catch (err: unknown) {
    // 5) friendly errors
    if ((err as S3Error)?.$metadata?.httpStatusCode === 404 || (err as S3Error)?.Code === "NoSuchKey") {
      return new Response("not found", { status: 404 });
    }
    return new Response("server error", { status: 500 });
  }
}
