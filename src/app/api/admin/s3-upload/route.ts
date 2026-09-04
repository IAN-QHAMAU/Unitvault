import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 Client targeting Supabase S3 Protocol
const s3Client = new S3Client({
  region: process.env.SUPABASE_S3_REGION!,
  endpoint: process.env.SUPABASE_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for Supabase S3 compatibility
});

export async function POST(request: NextRequest) {
  try {
    const { filename, fileType } = await request.json();

    if (!filename || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields: filename or fileType" },
        { status: 400 }
      );
    }

    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "unit-vault-materials";
    // Sanitize filename to avoid spaces/special characters issue
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `materials/${Date.now()}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      ContentType: fileType,
    });

    // Generate a presigned URL valid for 5 minutes (300 seconds)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Construct the public URL for retrieving the file after upload
    const publicUrl = `${process.env.SUPABASE_S3_ENDPOINT}/${bucketName}/${filePath}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      filePath,
    });
  } catch (error: any) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate presigned upload URL" },
      { status: 500 }
    );
  }
}