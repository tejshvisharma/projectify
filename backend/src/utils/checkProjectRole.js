import { projectMember } from "../models/projectmember.models.js";

const checkProjectRole = async (userId, projectId) => {
  
    const member = await projectMember.findOne({
    user: userId,
    project: projectId,
  });

  if (!member) throw new Error("Not a project member");

  return member.role;
};

export default checkProjectRole;