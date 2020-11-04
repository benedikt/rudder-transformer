const fetch = require("node-fetch");
const logger = require("../logger");
const stats = require("./stats");

const transformationCache = {};
const libraryCache = {};
// TODO: change config backend url to api.rudderlabs.com
const CONFIG_BACKEND_URL =
  process.env.CONFIG_BACKEND_URL ||
  "https://api.rudderlabs.com";
const getTransformationURL = `${CONFIG_BACKEND_URL}/transformation/getByVersionId`;
const getLibrariesUrl = `${CONFIG_BACKEND_URL}/transformationLibrary/getByVersionId`;

// Gets the transformation from config backend.
// Stores the transformation object in memory with time to live after which it expires.
// VersionId is updated any time user changes the code in transformation, so there wont be any stale code issues.
async function getTransformationCodeV1(versionId) {
  const transformation = transformationCache[versionId];
  if (transformation) return transformation;
  try {
    const startTime = new Date();
    const response = await fetch(
      `${getTransformationURL}?versionId=${versionId}`
    );
    stats.increment("get_transformation_code.success");
    stats.timing("get_transformation_code", startTime);
    const myJson = await response.json();
    transformationCache[versionId] = myJson;
    return myJson;
  } catch (error) {
    logger.error(error);
    stats.increment("get_transformation_code.error");
    throw error;
  }
}

async function getLibraryCodeV1(versionId) {
  const library = libraryCache[versionId];
  if (library) return library;
  try {
    const startTime = new Date();
    const response = await fetch(`${getLibrariesUrl}?versionId=${versionId}`);
    stats.increment("get_libraries_code.success");
    stats.timing("get_libraries_code", startTime);
    const myJson = await response.json();
    libraryCache[versionId] = myJson;
    return myJson;
  } catch (error) {
    logger.error(error);
    stats.increment("get_libraries_code.error");
    throw error;
  }
}

module.exports = { getTransformationCodeV1, getLibraryCodeV1 };
