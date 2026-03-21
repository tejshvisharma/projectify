import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import { useGetProjectQuery, useGetProjectMembersQuery } from '../api';
import ProjectHeader from '../components/ProjectHeader';
import KanbanBoard from '../components/KanbanBoard';
import ProjectSettingsTab from '../components/ProjectSettingsTab';
import NotesPanel from '@/features/notes/components/NotesPanel';

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState('board');

  // Guard: if no projectId in URL, redirect to projects list
  if (!projectId) return <Navigate to="/projects" replace />;

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useGetProjectQuery(projectId);

  const {
    data: members,
    isLoading: membersLoading,
  } = useGetProjectMembersQuery(projectId);

  // Loading: show skeleton for the header area 
  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error: project not found or API failure 
  if (projectError || !project) {
    return (
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load project. It may have been deleted or you don't have access.
        </AlertDescription>
        <p>Error: {projectId? projectId : 'Missing project ID'}</p>
      </Alert>
    );
  }

  // Success: render the full page 
  return (
    <div className="space-y-6">
      {/* Project Header — name, description, tags, members */}
      <ProjectHeader
        project={project}
        members={members ?? []}
        membersLoading={membersLoading}
      />

      {/* Tabs: Board / Tasks / Notes / Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger> 
        </TabsList>

        {/* Kanban Board Tab */}
        <TabsContent value="board" className="mt-6">
          <KanbanBoard 
          projectId={projectId} 
          projectEndDate={project.endDate}
          />
        </TabsContent>

        {/* Tasks List Tab — coming in next step */}
        <TabsContent value="tasks" className="mt-6">
          <p className="text-muted-foreground">Task list view — coming soon</p>
        </TabsContent>

        {/* Notes Tab — coming in next step */}
        <TabsContent value="notes" className="mt-6">
          <NotesPanel projectId={projectId} />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
        <ProjectSettingsTab
          project={project}
          projectId={projectId}
        />
        </TabsContent>
      </Tabs>
    </div>
  );
}