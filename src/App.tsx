import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  GripVertical,
  Image,
  Menu,
  MoreHorizontal,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import {
  schoolBrand,
  schoolNavigation,
  schoolProfile,
} from "@/components/navigation/navigation.config";
import {
  announcements,
  assignments,
  courses,
  critiques,
  instructors,
  portfolio,
  students,
  type CritiqueItem,
  type CritiqueStatus,
  type PortfolioItem,
  type Student,
} from "@/data";

const statusLabels: Record<CritiqueStatus, string> = {
  "to-review": "To review",
  "in-critique": "In critique",
  revision: "Revision requested",
  complete: "Complete",
};
const instructorName = (id: string) =>
  instructors.find((item) => item.id === id)?.name ?? "Studio faculty";
const studentName = (id: string) =>
  students.find((item) => item.id === id)?.name ?? "Student";
const courseTitle = (id: string) =>
  courses.find((item) => item.id === id)?.title ?? "Studio course";

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("school-navigation:collapsed") === "true",
  );
  const changeSidebar = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem("school-navigation:collapsed", String(collapsed));
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border transition-[width] duration-200 motion-reduce:transition-none md:block ${sidebarCollapsed ? "w-[76px]" : "w-72"}`}
      >
        <AppSidebar
          config={schoolNavigation}
          brand={schoolBrand}
          profile={schoolProfile}
          collapsed={sidebarCollapsed}
          onCollapsedChange={changeSidebar}
        />
      </aside>
      <div
        className={`transition-[padding] duration-200 motion-reduce:transition-none ${sidebarCollapsed ? "md:pl-[76px]" : "md:pl-72"}`}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" size="icon" className="md:hidden" />
                }
              >
                <Menu />
                <span className="sr-only">Open navigation</span>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] p-0"
                showCloseButton={false}
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>School navigation</SheetTitle>
                  <SheetDescription>
                    Navigate student and administration demo pages.
                  </SheetDescription>
                </SheetHeader>
                <AppSidebar
                  config={schoolNavigation}
                  brand={schoolBrand}
                  profile={schoolProfile}
                  mobile
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <Sparkles className="size-4 text-primary" />
              <span>Fall studio term · Demo workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="View notifications"
              className="relative"
            >
              <Bell />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#d1624e]" />
            </Button>
            <Avatar className="size-8 sm:hidden">
              <AvatarFallback>CV</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function StudentDashboard() {
  return (
    <>
      <PageHeading
        eyebrow="Student workspace"
        title="Good morning, Clara."
        description="Your studio week at a glance—classes, critiques, and the work that needs your attention."
        action={
          <Link
            to="/student/classes"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Explore classes <ArrowRight className="size-4" />
          </Link>
        }
      />
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Student metrics"
      >
        {(
          [
            [
              "Current classes",
              "6",
              "18 credits",
              BookOpen,
              "bg-[#f0dfc2] text-[#71432f]",
            ],
            [
              "Attendance",
              "94%",
              "+2% this month",
              ClipboardCheck,
              "bg-[#dce8db] text-[#365c49]",
            ],
            [
              "Due this week",
              "3",
              "1 high priority",
              Clock3,
              "bg-[#eadbec] text-[#5d3864]",
            ],
            [
              "Portfolio works",
              "12",
              "2 in review",
              Image,
              "bg-[#d7e5ee] text-[#33586e]",
            ],
          ] as const
        ).map(([label, value, note, Icon, tone]) => (
          <Card
            key={String(label)}
            className="border-border/70 bg-card shadow-sm"
          >
            <CardContent className="p-5">
              <div
                className={`mb-5 grid size-10 place-items-center rounded-xl ${tone}`}
              >
                <Icon className="size-5" />
              </div>
              <p className="text-3xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-sm font-medium">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{note}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="flex-row items-center justify-between border-b border-border/70">
            <div>
              <CardTitle className="font-display text-xl">
                Today in the studios
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Friday, August 15
              </p>
            </div>
            <Link
              to="/student/schedule"
              className="text-sm font-medium text-primary hover:underline"
            >
              Full schedule
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-5">
            {courses.slice(0, 3).map((course, index) => (
              <Link
                key={course.id}
                to={`/student/classes/${course.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-border/70 p-3 transition hover:border-primary/40 hover:bg-muted/50"
              >
                <div className="hidden w-16 text-center sm:block">
                  <p className="text-xs text-muted-foreground">
                    {index === 0 ? "9:00" : index === 1 ? "1:00" : "3:30"}
                  </p>
                  <p className="text-[10px] uppercase text-muted-foreground">
                    {index === 0 ? "AM" : "PM"}
                  </p>
                </div>
                <div
                  className="h-12 w-1 rounded-full"
                  style={{ background: course.gradient }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {course.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {course.room} · {instructorName(course.instructorId)}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Upcoming work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignments.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                to="/student/assignments"
                className="block border-b border-border/70 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {courseTitle(item.courseId)}
                    </p>
                  </div>
                  <Badge variant="outline">{item.dueDate}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 border-border/70 shadow-sm">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-xl">Campus notes</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              What is happening across School.
            </p>
          </div>
          <Badge variant="secondary">4 new</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {announcements.map((note) => (
            <button
              key={note.id}
              onClick={() => window.alert(note.body)}
              className="rounded-2xl border border-border/70 p-4 text-left transition hover:border-primary/40 hover:bg-muted/40"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline">{note.tag}</Badge>
                <span className="text-xs text-muted-foreground">
                  {note.date}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold">{note.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {note.body}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function ClassesPage() {
  const [query, setQuery] = useState("");
  const visible = courses.filter((course) =>
    `${course.title} ${course.code} ${course.department}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="Academic studio"
        title="Classes"
        description="Explore your current courses, instructors, studio times, and assignment progress."
      />
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search classes or departments"
          className="pl-9"
          aria-label="Search classes"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((course) => (
          <Link
            key={course.id}
            to={`/student/classes/${course.id}`}
            className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg"
          >
            <div
              className="relative h-36"
              style={{ background: course.gradient }}
            >
              <Badge className="absolute left-4 top-4 bg-background/90 text-foreground backdrop-blur">
                {course.code}
              </Badge>
              <span className="absolute bottom-4 right-4 rounded-full bg-black/25 px-3 py-1 text-xs text-white backdrop-blur">
                {course.credits} credits
              </span>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {course.department}
              </p>
              <h2 className="mt-2 font-display text-xl leading-tight">
                {course.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {course.description}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                <div>
                  <p className="text-sm font-medium">
                    {instructorName(course.instructorId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {course.days} · {course.room}
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function ClassDetailPage() {
  const { classId } = useParams();
  const course = courses.find((item) => item.id === classId);
  if (!course) return <Navigate to="/student/classes" replace />;
  const instructor = instructors.find(
    (item) => item.id === course.instructorId,
  );
  const courseAssignments = assignments.filter(
    (item) => item.courseId === course.id,
  );
  return (
    <>
      <Link
        to="/student/classes"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to classes
      </Link>
      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
        <div
          className="relative min-h-52 p-6 text-white sm:p-8"
          style={{ background: course.gradient }}
        >
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative max-w-2xl">
            <Badge className="bg-white/20 text-white backdrop-blur">
              {course.code}
            </Badge>
            <h1 className="mt-5 font-display text-3xl sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
              {course.description}
            </p>
          </div>
        </div>
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_280px] lg:p-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="roster">Roster</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <h2 className="font-display text-2xl">Studio focus</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                This studio balances guided demonstrations, independent making,
                and weekly critique. Students document process, test material
                decisions, and present finished work in a supportive review
                setting.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  "Material research",
                  "Weekly critique",
                  "Final exhibition",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl bg-muted p-4 text-sm font-medium"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="assignments" className="mt-6 space-y-3">
              {courseAssignments.length ? (
                courseAssignments.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.feedback}
                      </p>
                    </div>
                    <Badge variant="outline">{item.dueDate}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No assignments posted yet.
                </p>
              )}
            </TabsContent>
            <TabsContent
              value="roster"
              className="mt-6 grid gap-3 sm:grid-cols-2"
            >
              {students
                .slice(0, course.enrolled > 15 ? 8 : 6)
                .map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 rounded-2xl border border-border p-3"
                  >
                    <Avatar>
                      <AvatarFallback>{student.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.program} · Year {student.year}
                      </p>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
          <aside className="rounded-2xl bg-muted/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Instructor
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarFallback>{instructor?.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{instructor?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {instructor?.title}
                </p>
              </div>
            </div>
            <Separator className="my-5" />
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Schedule</dt>
                <dd className="mt-1 font-medium">
                  {course.days}
                  <br />
                  {course.startTime}–{course.endTime}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Location</dt>
                <dd className="mt-1 font-medium">{course.room}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Enrollment</dt>
                <dd className="mt-1 font-medium">
                  {course.enrolled} of {course.capacity} seats
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </>
  );
}

function SchedulePage() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return (
    <>
      <PageHeading
        eyebrow="Fall term"
        title="Weekly schedule"
        description="A clear view of studio time, critique sessions, and independent work blocks."
        action={
          <Button variant="outline">
            <CalendarDays />
            August 11–15
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-5">
        {days.map((day, dayIndex) => {
          const dayCourses = courses.filter(
            (_, index) =>
              index % 5 === dayIndex || (dayIndex === 2 && index < 3),
          );
          return (
            <section
              key={day}
              className="min-h-44 rounded-2xl border border-border/70 bg-card p-3 shadow-sm"
            >
              <h2 className="mb-3 text-sm font-semibold">
                {day}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {11 + dayIndex}
                </span>
              </h2>
              <div className="space-y-3">
                {dayCourses.length ? (
                  dayCourses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/student/classes/${course.id}`}
                      className="block overflow-hidden rounded-xl border border-border/60 bg-background transition hover:border-primary/40"
                    >
                      <div
                        className="h-1.5"
                        style={{ background: course.gradient }}
                      />
                      <div className="p-3">
                        <p className="text-xs font-semibold leading-5">
                          {course.title}
                        </p>
                        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock3 className="size-3" />
                          {course.startTime}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {course.room}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Independent studio
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function AssignmentsPage() {
  const [filter, setFilter] = useState<"all" | "open" | "graded">("all");
  const visible = assignments.filter(
    (item) =>
      filter === "all" ||
      (filter === "graded"
        ? item.status === "graded"
        : item.status !== "graded"),
  );
  return (
    <>
      <PageHeading
        eyebrow="Coursework"
        title="Assignments & feedback"
        description="Track what is due, what is in progress, and the feedback shaping your next revision."
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", "open", "graded"] as const).map((item) => (
          <Button
            key={item}
            variant={filter === item ? "default" : "outline"}
            onClick={() => setFilter(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </Button>
        ))}
      </div>
      <div className="space-y-3">
        {visible.map((item) => (
          <Card key={item.id} className="border-border/70 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{courseTitle(item.courseId)}</Badge>
                  <Badge
                    variant={item.status === "graded" ? "secondary" : "outline"}
                  >
                    {item.status.replace("-", " ")}
                  </Badge>
                </div>
                <h2 className="mt-3 font-display text-xl">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Instructor note: {item.feedback}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 lg:w-48 lg:flex-col lg:items-end">
                <div>
                  <p className="text-xs text-muted-foreground">Due date</p>
                  <p className="text-sm font-semibold">{item.dueDate}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.alert("Demo: assignment details would open here.")
                  }
                >
                  View details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function PortfolioPage() {
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  return (
    <>
      <PageHeading
        eyebrow="Student work"
        title="Portfolio gallery"
        description="Selected work from across disciplines, presented as a living studio archive."
        action={
          <Button
            onClick={() => window.alert("Demo: upload flow is visual only.")}
          >
            <Image />
            Add artwork
          </Button>
        }
      />
      <div className="grid auto-rows-[170px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {portfolio.map((work, index) => (
          <button
            key={work.id}
            onClick={() => setSelected(work)}
            className={`group relative overflow-hidden rounded-2xl text-left shadow-sm ${index === 0 || index === 5 ? "sm:row-span-2" : ""}`}
            style={{ background: work.gradient }}
          >
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="block font-display text-xl">{work.title}</span>
              <span className="mt-1 block text-xs text-white/75">
                {studentName(work.studentId)} · {work.medium}
              </span>
            </span>
            <span className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              <ArrowRight className="size-4" />
            </span>
          </button>
        ))}
      </div>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          {selected && (
            <>
              <div
                className="h-64 sm:h-80"
                style={{ background: selected.gradient }}
              />
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">
                    {selected.title}
                  </DialogTitle>
                  <DialogDescription>
                    {studentName(selected.studentId)} · {selected.medium} ·{" "}
                    {selected.year}
                  </DialogDescription>
                </DialogHeader>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {selected.description}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function AdminDashboard() {
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="College operations"
        description="A visual snapshot of enrollment, studio capacity, reviews, and academic activity."
        action={<Badge variant="secondary">Demo administration</Badge>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active students", "248", "+12 this term"],
          ["Studio utilization", "82%", "Peak: Tue 2 PM"],
          ["Pending reviews", "18", "6 due today"],
          ["Faculty", "34", "8 departments"],
        ].map(([label, value, note]) => (
          <Card key={label} className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
              <p className="mt-2 text-xs text-primary">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Enrollment by discipline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              ["Painting", 72],
              ["Graphic Design", 88],
              ["Sculpture", 54],
              ["Photography", 66],
              ["Animation", 78],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="text-muted-foreground">
                    {value} students
                  </span>
                </div>
                <Progress value={Number(value)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Administrative queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Approve fall exhibition list",
              "Review studio safety forms",
              "Confirm visiting artist travel",
              "Publish critique schedule",
            ].map((item, index) => (
              <button
                key={item}
                onClick={() => window.alert(`Demo task opened: ${item}`)}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left hover:bg-muted"
              >
                <span className="grid size-7 place-items-center rounded-lg bg-muted text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{item}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StudentsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const visible = students.filter((student) =>
    `${student.name} ${student.program}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Student management"
        description="Search student records and inspect program, status, and contact details."
        action={
          <Button
            onClick={() =>
              window.alert("Demo: new student form would open here.")
            }
          >
            <Users />
            Add student
          </Button>
        }
      />
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search students"
          className="pl-9"
        />
      </div>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((student) => (
              <TableRow
                key={student.id}
                tabIndex={0}
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                onClick={() => setSelected(student)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    setSelected(student)
                  }
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback>{student.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{student.program}</TableCell>
                <TableCell>{student.year}</TableCell>
                <TableCell>
                  <Badge variant="outline">{student.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Open ${student.name}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Sheet
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="w-full sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">
                  {selected.name}
                </SheetTitle>
                <SheetDescription>
                  Fictional student record · Demo only
                </SheetDescription>
              </SheetHeader>
              <div className="px-4">
                <div className="flex items-center gap-4 rounded-2xl bg-muted p-4">
                  <Avatar className="size-14">
                    <AvatarFallback>{selected.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selected.program}</p>
                    <p className="text-sm text-muted-foreground">
                      Year {selected.year} · {selected.status}
                    </p>
                  </div>
                </div>
                <dl className="mt-6 space-y-5 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="mt-1 font-medium">{selected.email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Academic advisor</dt>
                    <dd className="mt-1 font-medium">Dr. Anya Petrova</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      Current credit load
                    </dt>
                    <dd className="mt-1 font-medium">15 credits</dd>
                  </div>
                </dl>
                <Button
                  className="mt-8 w-full"
                  onClick={() =>
                    window.alert("Demo: changes are not persisted.")
                  }
                >
                  Edit demo record
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ClassManagementPage() {
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Class management"
        description="Review capacity, schedules, rooms, and faculty assignments for the current term."
        action={
          <Button
            onClick={() =>
              window.alert("Demo: create-class form would open here.")
            }
          >
            <BookOpen />
            Create class
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden border-border/70 shadow-sm"
          >
            <div className="h-2" style={{ background: course.gradient }} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline">{course.code}</Badge>
                  <h2 className="mt-3 font-display text-xl">{course.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {instructorName(course.instructorId)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.alert(`Demo settings: ${course.title}`)}
                  aria-label={`Open settings for ${course.title}`}
                >
                  <MoreHorizontal />
                </Button>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Room</p>
                  <p className="mt-1 font-medium">{course.room}</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Schedule</p>
                  <p className="mt-1 font-medium">{course.days}</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Seats</p>
                  <p className="mt-1 font-medium">
                    {course.enrolled}/{course.capacity}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function CritiqueBoardPage() {
  const [board, setBoard] = useState<Record<string, CritiqueItem[]>>(() =>
    Object.fromEntries(
      Object.keys(statusLabels).map((status) => [
        status,
        critiques.filter((item) => item.status === status),
      ]),
    ),
  );
  const moveItem = (itemId: string, direction: -1 | 1) => {
    const keys = Object.keys(statusLabels);
    const fromIndex = keys.findIndex((key) =>
      board[key].some((item) => item.id === itemId),
    );
    const toIndex = Math.min(
      keys.length - 1,
      Math.max(0, fromIndex + direction),
    );
    if (fromIndex === toIndex) return;
    const item = board[keys[fromIndex]].find((entry) => entry.id === itemId);
    if (!item) return;
    setBoard({
      ...board,
      [keys[fromIndex]]: board[keys[fromIndex]].filter(
        (entry) => entry.id !== itemId,
      ),
      [keys[toIndex]]: [
        ...board[keys[toIndex]],
        { ...item, status: keys[toIndex] as CritiqueStatus },
      ],
    });
  };
  return (
    <>
      <PageHeading
        eyebrow="ReUI component demo"
        title="Critique workflow"
        description="Drag cards between review stages or use the accessible arrow buttons. Changes are local to this demo session."
        action={
          <Badge variant="secondary">
            {Object.values(board).flat().length} projects
          </Badge>
        }
      />
      <Kanban
        value={board}
        onValueChange={setBoard}
        getItemValue={(item) => item.id}
        className="overflow-x-auto pb-4"
      >
        <KanbanBoard className="min-w-[1050px] grid-cols-4">
          {Object.entries(board).map(([status, items]) => (
            <KanbanColumn
              key={status}
              value={status}
              className="rounded-2xl border border-border/70 bg-muted/45 p-3"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-semibold">
                    {statusLabels[status as CritiqueStatus]}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {items.length} projects
                  </p>
                </div>
                <KanbanColumnHandle className="opacity-100">
                  <GripVertical className="size-4 text-muted-foreground" />
                </KanbanColumnHandle>
              </div>
              <KanbanColumnContent value={status}>
                {items.map((item) => (
                  <KanbanItem key={item.id} value={item.id}>
                    <Card className="border-border/70 bg-card shadow-sm">
                      <CardContent className="p-4">
                        <KanbanItemHandle className="flex items-center justify-between">
                          <Badge
                            variant={
                              item.priority === "high"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {item.priority}
                          </Badge>
                          <GripVertical className="size-4 text-muted-foreground" />
                        </KanbanItemHandle>
                        <h3 className="mt-4 text-sm font-semibold leading-5">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {studentName(item.studentId)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {courseTitle(item.courseId)}
                        </p>
                        <Separator className="my-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">
                            {item.dueDate}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              disabled={status === "to-review"}
                              onClick={() => moveItem(item.id, -1)}
                              aria-label={`Move ${item.title} to previous stage`}
                            >
                              <ArrowLeft />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              disabled={status === "complete"}
                              onClick={() => moveItem(item.id, 1)}
                              aria-label={`Move ${item.title} to next stage`}
                            >
                              <ArrowRight />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </KanbanItem>
                ))}
              </KanbanColumnContent>
            </KanbanColumn>
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          <div className="h-36 rounded-2xl border-2 border-dashed border-primary/50 bg-card/90 shadow-xl" />
        </KanbanOverlay>
      </Kanban>
    </>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          404
        </p>
        <h1 className="mt-3 font-display text-4xl">That studio is empty.</h1>
        <p className="mt-3 text-muted-foreground">
          The requested demo page does not exist.
        </p>
        <Link
          to="/student"
          className="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/classes" element={<ClassesPage />} />
        <Route path="/student/classes/:classId" element={<ClassDetailPage />} />
        <Route path="/student/schedule" element={<SchedulePage />} />
        <Route path="/student/assignments" element={<AssignmentsPage />} />
        <Route path="/student/portfolio" element={<PortfolioPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/classes" element={<ClassManagementPage />} />
        <Route path="/admin/critiques" element={<CritiqueBoardPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
