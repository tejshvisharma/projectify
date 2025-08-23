import { body, param } from "express-validator";
import {
  availableTaskStatus,
  availableTaskPriorities,
  availableTaskDifficulties,
} from "../utils/constants.js";

export const createNoteValidator = ()=>{
    return [
        param("projectId")
            .notEmpty()
            .withMessage("projectId is mandatory")
            .isMongoId()
            .withMessage("ProjectId is invalid"),
        body("content")
            .notEmpty()
            .withMessage("Note's content is mandatory")
            .trim()
            
    ]
}

export const updateNoteValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("projectId is mandatory")
      .isMongoId()
      .withMessage("ProjectId is invalid"),
    param("noteId")
      .notEmpty()
      .withMessage("projectId is mandatory")
      .isMongoId()
      .withMessage("ProjectId is invalid"),
    body("content")
      .notEmpty()
      .withMessage("Note's content is mandatory")
      .trim(),
  ];
};