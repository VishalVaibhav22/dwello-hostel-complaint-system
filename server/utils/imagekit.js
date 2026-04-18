const path = require("path");
const crypto = require("crypto");
const ImageKitModule = require("@imagekit/nodejs");

const ImageKit = ImageKitModule.default || ImageKitModule;
const { toFile } = ImageKitModule;

const REQUIRED_ENV = [
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",
];

const missingImageKitEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
const isImageKitConfigured = missingImageKitEnv.length === 0;

const imageKit = isImageKitConfigured
  ? new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    })
  : null;

const buildSafeFileName = (originalName = "image") => {
  const ext = path.extname(originalName || "").toLowerCase() || ".jpg";
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "");
  const safeBase = base || "complaint-image";
  const random = crypto.randomBytes(8).toString("hex");
  return `${safeBase}-${Date.now()}-${random}${ext}`;
};

const uploadComplaintImages = async (files, userId) => {
  if (!files || files.length === 0) {
    return [];
  }

  if (!imageKit || typeof toFile !== "function") {
    throw new Error("ImageKit is not configured on the server");
  }

  const uploadedUrls = await Promise.all(
    files.map(async (file) => {
      const uploadFile = await toFile(
        file.buffer,
        file.originalname || "image",
      );
      const response = await imageKit.files.upload({
        file: uploadFile,
        fileName: buildSafeFileName(file.originalname),
        folder: `/complaints/${userId}`,
      });

      return response.url;
    }),
  );

  return uploadedUrls;
};

module.exports = {
  uploadComplaintImages,
  isImageKitConfigured,
  missingImageKitEnv,
};
