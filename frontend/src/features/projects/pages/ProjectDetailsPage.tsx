import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FolderKanban,
  Github,
  LayoutDashboard,
  StickyNote,
  Tag,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { useGetProjectQuery, useGetProjectMembersQuery } from '../api';
import ProjectHeader from '../components/ProjectHeader';
import KanbanBoard from '../components/KanbanBoard';
import ProjectSettingsTab from '../components/ProjectSettingsTab';
import NotesPanel from '@/features/notes/components/NotesPanel';
import ProjectLeaderboardTab from '../components/ProjectLeaderboardTab';

function formatDate(dateString?: string) {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getRepositoryLabel(repoUrl?: string) {
  if (!repoUrl) return 'Not connected';
  try {
    const parsed = new URL(repoUrl);
    return parsed.hostname.replace('www.', '');
  } catch {
    return 'Connected';
  }
}

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
      <div className="relative space-y-6 overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-28 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />

        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-32 rounded-full" />
              <Skeleton className="h-9 w-40" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-9 w-72" />
              <Skeleton className="h-5 w-[32rem] max-w-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <Skeleton className="h-11 w-full rounded-xl" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error: project not found or API failure 
  if (projectError || !project) {
    return (
      <Alert variant="destructive" className="max-w-xl border-destructive/50 bg-destructive/5">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load project. It may have been deleted or you don't have access.
        </AlertDescription>
        <p className="text-sm opacity-90">Error: {projectId ? projectId : 'Missing project ID'}</p>
      </Alert>
    );
  }

  const dueDate = formatDate(project.endDate);
  const createdOn = formatDate(project.createdAt);
  const repository = getRepositoryLabel(project.githubRepo);
  const isOverdue = Boolean(project.endDate && new Date(project.endDate) < new Date());
  const totalMembers = members?.length ?? 0;

  // Success: render the full page 
  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-500/10" />

      <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />

        <CardContent className="relative space-y-6 p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge
              variant="outline"
              className="border-primary/25 bg-primary/10 text-primary dark:border-primary/35 dark:bg-primary/15"
            >
              Project Workspace
            </Badge>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-primary/30 bg-background/70 transition-all duration-200 hover:border-primary/50 hover:bg-primary/10"
            >
              <Link to={`/projects/${projectId}/dashboard`}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Open Dashboard
              </Link>
            </Button>
          </div>

          {/* Project Header — name, description, tags, members */}
          <ProjectHeader
            project={project}
            members={members ?? []}
            membersLoading={membersLoading}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="group rounded-xl border border-border/70 bg-card/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Members</span>
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                {membersLoading ? '...' : totalMembers}
              </p>
              <p className="text-xs text-muted-foreground">Active collaborators in this project</p>
            </div>

            <div className="group rounded-xl border border-border/70 bg-card/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Tags</span>
              </div>
              <p className="text-2xl font-semibold tracking-tight">{project.tags.length}</p>
              <p className="text-xs text-muted-foreground">Organized categories and domains</p>
            </div>

            <div className="group rounded-xl border border-border/70 bg-card/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Deadline</span>
              </div>
              <p className="text-base font-semibold tracking-tight">{dueDate}</p>
              <p className="text-xs text-muted-foreground">
                {isOverdue ? 'Overdue' : `Started ${createdOn}`}
              </p>
            </div>

            <div className="group rounded-xl border border-border/70 bg-card/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Github className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Repository</span>
              </div>
              <p className="truncate text-base font-semibold tracking-tight">{repository}</p>
              <p className="text-xs text-muted-foreground">
                {project.githubRepo ? 'Integration active' : 'No repository linked'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="p-3 md:p-4">
          {/* Tabs: Board / Tasks / Notes / Settings */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl bg-muted/70 p-2 md:grid-cols-5">
              <TabsTrigger
                value="board"
                className="h-11 justify-start gap-2 rounded-lg px-3 text-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <FolderKanban className="h-4 w-4" />
                Board
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="h-11 justify-start gap-2 rounded-lg px-3 text-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger
                value="Leaderboard"
                className="h-11 justify-start gap-2 rounded-lg px-3 text-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="h-11 justify-start gap-2 rounded-lg px-3 text-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <StickyNote className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="h-11 justify-start gap-2 rounded-lg px-3 text-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Kanban Board Tab */}
            <TabsContent value="board" className="mt-5 animate-in fade-in-50 duration-300">
              <KanbanBoard
                projectId={projectId}
                projectEndDate={project.endDate}
              />
            </TabsContent>

            {/* Tasks List Tab — coming in next step */}
            <TabsContent value="tasks" className="mt-5 animate-in fade-in-50 duration-300">
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Task list view — coming soon</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use the Board tab to manage and track current work.
                </p>
              </div>
            </TabsContent>

            {/* Leaderboard Tab — coming in next step */}
            <TabsContent value="Leaderboard" className="mt-5 animate-in fade-in-50 duration-300">
              <ProjectLeaderboardTab />
            </TabsContent>

            {/* Notes Tab — coming in next step */}
            <TabsContent value="notes" className="mt-5 animate-in fade-in-50 duration-300">
              <NotesPanel projectId={projectId} />
            </TabsContent>

            <TabsContent value="settings" className="mt-5 animate-in fade-in-50 duration-300">
              <ProjectSettingsTab
                project={project}
                projectId={projectId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}