import mongoose from "mongoose";
import ApiError from "./api-error.js";

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @param {string} fieldName - Name of the field for error message
 * @throws {ApiError} If the ID is invalid
 */
export const validateObjectId = (id, fieldName = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${fieldName} format`);
  }
};

/**
 * Validates multiple ObjectIds at once
 * @param {Object} ids - Object with field names as keys and IDs as values
 * @throws {ApiError} If any ID is invalid
 */
export const validateObjectIds = (ids) => {
  for (const [fieldName, id] of Object.entries(ids)) {
    if (id) {
      validateObjectId(id, fieldName);
    }
  }
};
