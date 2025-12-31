/**
 * File handling utilities for VictoryKit
 * Uses multer for uploads and fs-extra for file operations
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
const pino = require("pino");

const logger = pino({ name: "file-handler" });

// Base upload directory
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

// Ensure upload directory exists
fs.ensureDirSync(UPLOAD_DIR);

// File type configurations
const fileTypes = {
  // Malware analysis samples
  malware: {
    extensions: [".exe", ".dll", ".bin", ".zip", ".rar", ".7z", ".tar", ".gz"],
    maxSize: 100 * 1024 * 1024, // 100MB
    folder: "malware-samples",
  },
  // Log files for analysis
  logs: {
    extensions: [".log", ".txt", ".json", ".csv", ".xml"],
    maxSize: 50 * 1024 * 1024, // 50MB
    folder: "logs",
  },
  // Configuration files
  config: {
    extensions: [".json", ".yaml", ".yml", ".toml", ".ini", ".conf"],
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: "configs",
  },
  // Reports
  reports: {
    extensions: [".pdf", ".html", ".json", ".csv"],
    maxSize: 25 * 1024 * 1024, // 25MB
    folder: "reports",
  },
  // Code for analysis
  code: {
    extensions: [
      ".js",
      ".ts",
      ".py",
      ".java",
      ".c",
      ".cpp",
      ".go",
      ".rs",
      ".php",
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
    folder: "code",
  },
  // General documents
  documents: {
    extensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"],
    maxSize: 25 * 1024 * 1024, // 25MB
    folder: "documents",
  },
};

/**
 * Create multer storage configuration
 * @param {string} type - File type category
 * @returns {multer.StorageEngine}
 */
function createStorage(type) {
  const config = fileTypes[type] || fileTypes.documents;
  const folderPath = path.join(UPLOAD_DIR, config.folder);
  fs.ensureDirSync(folderPath);

  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Create date-based subdirectory
      const dateFolder = new Date().toISOString().split("T")[0];
      const destPath = path.join(folderPath, dateFolder);
      fs.ensureDirSync(destPath);
      cb(null, destPath);
    },
    filename: (req, file, cb) => {
      const uniqueId = uuidv4();
      const ext = path.extname(file.originalname);
      const safeName = `${uniqueId}${ext}`;
      cb(null, safeName);
    },
  });
}

/**
 * Create file filter for multer
 * @param {string} type - File type category
 * @returns {Function}
 */
function createFileFilter(type) {
  const config = fileTypes[type] || fileTypes.documents;

  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.extensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed for ${type} uploads`), false);
    }
  };
}

/**
 * Create multer upload middleware
 * @param {string} type - File type category
 * @param {object} options - Additional options
 * @returns {multer.Multer}
 */
function createUploader(type, options = {}) {
  const config = fileTypes[type] || fileTypes.documents;

  return multer({
    storage: createStorage(type),
    fileFilter: createFileFilter(type),
    limits: {
      fileSize: options.maxSize || config.maxSize,
      files: options.maxFiles || 10,
    },
  });
}

/**
 * Upload single file middleware
 * @param {string} fieldName - Form field name
 * @param {string} type - File type category
 */
function uploadSingle(fieldName, type) {
  return createUploader(type).single(fieldName);
}

/**
 * Upload multiple files middleware
 * @param {string} fieldName - Form field name
 * @param {number} maxCount - Maximum file count
 * @param {string} type - File type category
 */
function uploadMultiple(fieldName, maxCount, type) {
  return createUploader(type).array(fieldName, maxCount);
}

/**
 * Get file info
 * @param {string} filePath - Path to file
 * @returns {Promise<object>}
 */
async function getFileInfo(filePath) {
  const stats = await fs.stat(filePath);
  return {
    path: filePath,
    name: path.basename(filePath),
    extension: path.extname(filePath),
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    isDirectory: stats.isDirectory(),
  };
}

/**
 * Delete file safely
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>}
 */
async function deleteFile(filePath) {
  try {
    // Ensure file is within upload directory (security)
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
      throw new Error("Cannot delete files outside upload directory");
    }

    await fs.remove(filePath);
    logger.info({ filePath }, "File deleted");
    return true;
  } catch (error) {
    logger.error({ filePath, err: error }, "Failed to delete file");
    return false;
  }
}

/**
 * Move file to permanent storage
 * @param {string} sourcePath - Source file path
 * @param {string} destFolder - Destination folder (relative to UPLOAD_DIR)
 * @param {string} newName - Optional new filename
 * @returns {Promise<string>} New file path
 */
async function moveFile(sourcePath, destFolder, newName = null) {
  const destPath = path.join(UPLOAD_DIR, destFolder);
  await fs.ensureDir(destPath);

  const filename = newName || path.basename(sourcePath);
  const destination = path.join(destPath, filename);

  await fs.move(sourcePath, destination, { overwrite: true });
  logger.info({ from: sourcePath, to: destination }, "File moved");

  return destination;
}

/**
 * Read file contents
 * @param {string} filePath - Path to file
 * @param {string} encoding - File encoding (default: utf-8)
 * @returns {Promise<string|Buffer>}
 */
async function readFile(filePath, encoding = "utf-8") {
  return fs.readFile(filePath, encoding);
}

/**
 * Write file contents
 * @param {string} filePath - Path to file
 * @param {string|Buffer} content - File content
 * @returns {Promise<void>}
 */
async function writeFile(filePath, content) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);
  logger.info({ filePath }, "File written");
}

/**
 * List files in directory
 * @param {string} dirPath - Directory path
 * @param {object} options - Options
 * @returns {Promise<string[]>}
 */
async function listFiles(dirPath, options = {}) {
  const resolvedPath = path.join(UPLOAD_DIR, dirPath);

  if (options.recursive) {
    const files = [];
    const walk = async (dir) => {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stats = await fs.stat(itemPath);
        if (stats.isDirectory()) {
          await walk(itemPath);
        } else {
          files.push(itemPath.replace(UPLOAD_DIR, ""));
        }
      }
    };
    await walk(resolvedPath);
    return files;
  }

  return fs.readdir(resolvedPath);
}

/**
 * Cleanup old files
 * @param {number} maxAgeDays - Maximum file age in days
 * @returns {Promise<number>} Number of files deleted
 */
async function cleanupOldFiles(maxAgeDays = 30) {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  let deleted = 0;

  const cleanup = async (dir) => {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        await cleanup(itemPath);
        // Remove empty directories
        const remaining = await fs.readdir(itemPath);
        if (remaining.length === 0) {
          await fs.rmdir(itemPath);
        }
      } else if (stats.mtime.getTime() < cutoff) {
        await fs.remove(itemPath);
        deleted++;
      }
    }
  };

  await cleanup(UPLOAD_DIR);
  logger.info({ deleted, maxAgeDays }, "Cleanup completed");
  return deleted;
}

module.exports = {
  UPLOAD_DIR,
  fileTypes,
  createUploader,
  uploadSingle,
  uploadMultiple,
  getFileInfo,
  deleteFile,
  moveFile,
  readFile,
  writeFile,
  listFiles,
  cleanupOldFiles,
};
