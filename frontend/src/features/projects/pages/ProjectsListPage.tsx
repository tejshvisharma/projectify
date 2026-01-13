import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * ProjectsListPage - Placeholder page for project list
 * Business logic will be implemented in later phases
 */
export default function ProjectsListPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and organize your projects
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Placeholder Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder Project Cards */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FolderKanban className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Project {i}</CardTitle>
                  <CardDescription>Sample project description</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>5 tasks</span>
                <span>3 members</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State Placeholder */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by creating your first project
          </p>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
