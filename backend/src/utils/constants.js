export const userRolesEnum = {
  OWNER: "owner",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
  VIEWER: "viewer",
};

export const GLOBAL_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
};

export const PROJECT_ROLES = {
  ALL: Object.values(userRolesEnum),
  MANAGEMENT: [userRolesEnum.OWNER, userRolesEnum.PROJECT_ADMIN],
  EDITORS: [
    userRolesEnum.MEMBER,
    userRolesEnum.OWNER,
    userRolesEnum.PROJECT_ADMIN,
  ],
  VIEWERS: [
    userRolesEnum.VIEWER,
    userRolesEnum.MEMBER,
    userRolesEnum.OWNER,
    userRolesEnum.PROJECT_ADMIN,
  ],
};

export const GLOBAL_ROLES_LIST = Object.values(GLOBAL_ROLES);

export const availableUserRoles = Object.values(userRolesEnum);

export const taskStatusEnums = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  SUBMITTED: "submitted",
  DONE: "done",
};
export const availableTaskStatus = Object.values(taskStatusEnums);

export const taskDifficultyEnums = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  EXPERT: "expert",
};

export const availableTaskDifficulties = Object.values(taskDifficultyEnums);

export const taskPriorityEnums = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};
export const availableTaskPriorities = Object.values(taskPriorityEnums);