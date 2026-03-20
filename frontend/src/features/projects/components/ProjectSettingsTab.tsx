import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, UserPlus, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/stores/auth.store';
import { useGetProjectMembersQuery } from '@/features/members/api';
import { useDeleteProjectMutation } from '../api';
import { type ProjectRole } from '@/features/members/types';
import type { Project } from '../types';
import MembersList from '@/features/members/components/MembersList';
import AddMemberModal from '@/features/members/components/AddMemberModal';
import EditProjectForm from './EditProjectForm';

interface ProjectSettingsTabProps {
  project: Project;
  projectId: string;
}

export default function ProjectSettingsTab({
  project,
  projectId,
}: ProjectSettingsTabProps) {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const navigate = useNavigate();

  const currentUser = useAuthStore((s) => s.user);
  const { data: members = [], isLoading: membersLoading } =
    useGetProjectMembersQuery(projectId);

  const deleteProject = useDeleteProjectMutation(projectId);

  // Derive current user's role
  const currentMember = members.find(
    (m) => m.user._id === currentUser?._id
  );
  const currentUserRole = (currentMember?.role ?? null) as ProjectRole | null;
  const isOwner         = currentUserRole === 'owner';
  const canManage       = isOwner || currentUserRole === 'project_admin';

  // Existing member IDs for AddMemberModal duplicate check
  const existingMemberIds = members.map((m) => m.user._id);

  const handleDeleteProject = async () => {
    await deleteProject.mutateAsync();
    navigate('/projects'); // redirect after deletion
  };

  return (
    <div className="max-w-2xl space-y-8">

      {/* ── Members Section ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Members</h2>
            <p className="text-sm text-muted-foreground">
              Manage who has access to this project
            </p>
          </div>
          {canManage && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddMemberOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          )}
        </div>

        <MembersList
          projectId={projectId}
          members={members}
          isLoading={membersLoading}
          currentUserRole={currentUserRole}
        />
      </section>

      <Separator />

      {/* ── Project Details Section ──────────────────────────────────────── */}
      {canManage && (
        <>
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Project Details</h2>
              <p className="text-sm text-muted-foreground">
                Update your project information
              </p>
            </div>
            <EditProjectForm project={project} />
          </section>

          <Separator />
        </>
      )}

      {/* ── Danger Zone ─────────────────────────────────────────────────── */}
      {isOwner && (
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-destructive">
              Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground">
              Irreversible actions — proceed with caution
            </p>
          </div>

          <div className="border border-destructive/30 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Delete this project</p>
                <p className="text-xs text-muted-foreground">
                  Permanently deletes all tasks, comments, subtasks,
                  and members. This cannot be undone.
                </p>
              </div>
            </div>

            {/* AlertDialog = confirmation before destructive action */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="shrink-0"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete "{project.name}"?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the project and all its
                    tasks, comments, subtasks, and members.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProject}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={deleteProject.isPending}
                  >
                    {deleteProject.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Yes, delete project'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        projectId={projectId}
        existingMemberIds={existingMemberIds}
      />

    </div>
  );
}