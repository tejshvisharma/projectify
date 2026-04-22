import type { UserSummary } from '@/features/projects/types';

export type ProjectRole = 'viewer' | 'member' | 'project_admin' | 'owner';

export interface ProjectMember {
    _id: string;
    user: UserSummary;
    project: string;
    role: ProjectRole;
    createdAt: string;
    updatedAt: string;
}

export interface AddMemberPayload {
    userId: string;
    role: ProjectRole;
}

export interface UpdateMemberRolePayload {
    memberId: string;
    role: ProjectRole;
}

export interface SearchUsersMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface SearchUsersResponse {
    users: UserSummary[];
    meta: SearchUsersMeta;
}

// Role display config — single source of truth for colors + labels
export const ROLE_CONFIG: Record<ProjectRole, { label: string; className: string }> = {
    owner: {
        label: 'Owner',
        className: 'bg-purple-100 text-purple-700 border-purple-200',
    },
    project_admin: {
        label: 'Admin',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    member: {
        label: 'Member',
        className: 'bg-green-100 text-green-700 border-green-200',
    },
    viewer: {
        label: 'Viewer',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
    },
};

// Roles that can be assigned — owner not included
// you can't assign someone as owner directly
export const ASSIGNABLE_ROLES: ProjectRole[] = [
    'viewer',
    'member',
    'project_admin',
];
