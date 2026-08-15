export type StudentStatus = "active" | "leave" | "graduating";
export type AssignmentStatus =
  "not-started" | "in-progress" | "submitted" | "graded";
export type CritiqueStatus =
  "to-review" | "in-critique" | "revision" | "complete";

export interface Student {
  id: string;
  name: string;
  program: string;
  year: number;
  status: StudentStatus;
  initials: string;
  email: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  initials: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  department: string;
  instructorId: string;
  room: string;
  days: string;
  startTime: string;
  endTime: string;
  credits: number;
  capacity: number;
  enrolled: number;
  gradient: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  feedback: string;
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  title: string;
  medium: string;
  year: number;
  gradient: string;
  description: string;
}

export interface CritiqueItem {
  id: string;
  studentId: string;
  courseId: string;
  title: string;
  status: CritiqueStatus;
  priority: "low" | "medium" | "high";
  dueDate: string;
}

export const students: Student[] = [
  {
    id: "s1",
    name: "Clara Voss",
    program: "Painting",
    year: 3,
    status: "active",
    initials: "CV",
    email: "clara.voss@school.demo",
  },
  {
    id: "s2",
    name: "Liam Chen",
    program: "Graphic Design",
    year: 2,
    status: "active",
    initials: "LC",
    email: "liam.chen@school.demo",
  },
  {
    id: "s3",
    name: "Zara Okafor",
    program: "Sculpture",
    year: 4,
    status: "graduating",
    initials: "ZO",
    email: "zara.okafor@school.demo",
  },
  {
    id: "s4",
    name: "Milo Torres",
    program: "Illustration",
    year: 1,
    status: "active",
    initials: "MT",
    email: "milo.torres@school.demo",
  },
  {
    id: "s5",
    name: "Iris Kim",
    program: "Photography",
    year: 3,
    status: "active",
    initials: "IK",
    email: "iris.kim@school.demo",
  },
  {
    id: "s6",
    name: "Ravi Patel",
    program: "Animation",
    year: 2,
    status: "active",
    initials: "RP",
    email: "ravi.patel@school.demo",
  },
  {
    id: "s7",
    name: "Sofia Reyes",
    program: "Printmaking",
    year: 4,
    status: "graduating",
    initials: "SR",
    email: "sofia.reyes@school.demo",
  },
  {
    id: "s8",
    name: "Theo Wright",
    program: "Painting",
    year: 1,
    status: "leave",
    initials: "TW",
    email: "theo.wright@school.demo",
  },
];

export const instructors: Instructor[] = [
  {
    id: "i1",
    name: "Dr. Anya Petrova",
    title: "Professor",
    specialty: "Color Theory",
    initials: "AP",
  },
  {
    id: "i2",
    name: "James Hale",
    title: "Associate Professor",
    specialty: "Digital Media",
    initials: "JH",
  },
  {
    id: "i3",
    name: "Maya Lin",
    title: "Assistant Professor",
    specialty: "Ceramics",
    initials: "ML",
  },
  {
    id: "i4",
    name: "Carlos Mendez",
    title: "Visiting Artist",
    specialty: "Mixed Media",
    initials: "CM",
  },
];

export const courses: Course[] = [
  {
    id: "c1",
    code: "PAINT-301",
    title: "Advanced Oil Techniques",
    description:
      "Glazing, impasto, and expressive color through a contemporary studio practice.",
    department: "Painting",
    instructorId: "i1",
    room: "Studio A",
    days: "Mon / Wed",
    startTime: "9:00 AM",
    endTime: "11:50 AM",
    credits: 3,
    capacity: 16,
    enrolled: 14,
    gradient: "linear-gradient(135deg,#f6c7a5 0%,#9b4d69 48%,#3b214d 100%)",
  },
  {
    id: "c2",
    code: "GD-210",
    title: "Typography & Layout",
    description:
      "Grid systems, editorial rhythm, and expressive typographic composition.",
    department: "Graphic Design",
    instructorId: "i2",
    room: "Design Lab 2",
    days: "Tue / Thu",
    startTime: "1:00 PM",
    endTime: "3:50 PM",
    credits: 3,
    capacity: 20,
    enrolled: 18,
    gradient: "linear-gradient(135deg,#f6df8f 0%,#e36b45 50%,#602f5f 100%)",
  },
  {
    id: "c3",
    code: "SCULPT-401",
    title: "Found Object Assemblage",
    description:
      "Narrative sculpture created from reclaimed, collected, and altered materials.",
    department: "Sculpture",
    instructorId: "i3",
    room: "Foundry",
    days: "Wed / Fri",
    startTime: "2:00 PM",
    endTime: "4:50 PM",
    credits: 4,
    capacity: 12,
    enrolled: 10,
    gradient: "linear-gradient(135deg,#b8c9a4 0%,#677967 45%,#30303b 100%)",
  },
  {
    id: "c4",
    code: "ILLUS-150",
    title: "Narrative Illustration",
    description:
      "Sequential art and visual storytelling through image, pacing, and character.",
    department: "Illustration",
    instructorId: "i4",
    room: "Studio B",
    days: "Mon / Wed",
    startTime: "10:00 AM",
    endTime: "12:50 PM",
    credits: 3,
    capacity: 18,
    enrolled: 16,
    gradient: "linear-gradient(135deg,#8ed8d2 0%,#4a81a8 45%,#392d69 100%)",
  },
  {
    id: "c5",
    code: "PHOTO-320",
    title: "Studio Lighting",
    description:
      "Portrait and product lighting using strobes, modifiers, and crafted shadow.",
    department: "Photography",
    instructorId: "i2",
    room: "Photo Studio",
    days: "Tue / Thu",
    startTime: "9:00 AM",
    endTime: "11:50 AM",
    credits: 3,
    capacity: 14,
    enrolled: 12,
    gradient: "linear-gradient(135deg,#ebe8df 0%,#9ba4b5 45%,#2b3245 100%)",
  },
  {
    id: "c6",
    code: "ANIM-250",
    title: "2D Character Animation",
    description:
      "Timing, expression, and movement for character-driven animated scenes.",
    department: "Animation",
    instructorId: "i4",
    room: "Animation Lab",
    days: "Mon / Wed / Fri",
    startTime: "1:00 PM",
    endTime: "2:50 PM",
    credits: 4,
    capacity: 15,
    enrolled: 15,
    gradient: "linear-gradient(135deg,#efb8d5 0%,#b65a8d 45%,#503261 100%)",
  },
];

export const assignments: Assignment[] = [
  {
    id: "a1",
    courseId: "c1",
    title: "Self-Portrait in Glazing",
    dueDate: "Aug 18",
    status: "in-progress",
    feedback: "Build warmer highlights into the final pass.",
  },
  {
    id: "a2",
    courseId: "c2",
    title: "Magazine Spread Redesign",
    dueDate: "Aug 20",
    status: "graded",
    feedback: "Strong grid; refine optical kerning in the display type.",
  },
  {
    id: "a3",
    courseId: "c3",
    title: "Memory Box Assemblage",
    dueDate: "Aug 22",
    status: "submitted",
    feedback: "The narrative is clear and materially surprising.",
  },
  {
    id: "a4",
    courseId: "c4",
    title: "Three-Panel Comic",
    dueDate: "Aug 24",
    status: "not-started",
    feedback: "No feedback yet.",
  },
  {
    id: "a5",
    courseId: "c5",
    title: "Rembrandt Lighting Portrait",
    dueDate: "Aug 25",
    status: "submitted",
    feedback: "Dramatic shadow; lift the eye-side exposure slightly.",
  },
  {
    id: "a6",
    courseId: "c6",
    title: "Walk Cycle Test",
    dueDate: "Aug 27",
    status: "graded",
    feedback: "Smooth rhythm. Add more weight shift through the hips.",
  },
  {
    id: "a7",
    courseId: "c1",
    title: "Monochrome Color Study",
    dueDate: "Sep 1",
    status: "not-started",
    feedback: "No feedback yet.",
  },
  {
    id: "a8",
    courseId: "c2",
    title: "Identity Mark Iterations",
    dueDate: "Sep 3",
    status: "in-progress",
    feedback: "The third direction has the clearest silhouette.",
  },
];

export const portfolio: PortfolioItem[] = [
  {
    id: "p1",
    studentId: "s1",
    title: "Ephemeral Landscapes",
    medium: "Oil on canvas",
    year: 2026,
    gradient: "linear-gradient(145deg,#e6ba76,#8d485e 48%,#2f2847)",
    description: "A study of remembered terrain and shifting light.",
  },
  {
    id: "p2",
    studentId: "s2",
    title: "Urban Rhythms",
    medium: "Digital print",
    year: 2026,
    gradient: "linear-gradient(145deg,#d9d4c8,#e15c3c 42%,#24354b)",
    description: "Editorial fragments sampled from the daily commute.",
  },
  {
    id: "p3",
    studentId: "s3",
    title: "Resonant Forms",
    medium: "Steel and glass",
    year: 2025,
    gradient: "linear-gradient(145deg,#c5d2cd,#738b7b 42%,#27343b)",
    description: "A suspended conversation between weight and reflection.",
  },
  {
    id: "p4",
    studentId: "s4",
    title: "Night Orchard",
    medium: "Ink and gouache",
    year: 2026,
    gradient: "linear-gradient(145deg,#d8b7d5,#6f5793 45%,#29263d)",
    description: "Sequential illustrations about a garden after dark.",
  },
  {
    id: "p5",
    studentId: "s5",
    title: "Soft Architecture",
    medium: "Archival photograph",
    year: 2026,
    gradient: "linear-gradient(145deg,#f0d9cb,#b16f6f 45%,#514052)",
    description: "Light, fabric, and temporary structures in the studio.",
  },
  {
    id: "p6",
    studentId: "s7",
    title: "Common Ground",
    medium: "Relief print",
    year: 2025,
    gradient: "linear-gradient(145deg,#e0c791,#a25b43 45%,#393b36)",
    description: "Layered maps of community gardens and shared spaces.",
  },
];

export const critiques: CritiqueItem[] = [
  {
    id: "k1",
    studentId: "s1",
    courseId: "c1",
    title: "Glazing self-portrait",
    status: "to-review",
    priority: "high",
    dueDate: "Today",
  },
  {
    id: "k2",
    studentId: "s2",
    courseId: "c2",
    title: "Editorial type system",
    status: "to-review",
    priority: "medium",
    dueDate: "Tomorrow",
  },
  {
    id: "k3",
    studentId: "s5",
    courseId: "c5",
    title: "Studio light study",
    status: "in-critique",
    priority: "high",
    dueDate: "Today",
  },
  {
    id: "k4",
    studentId: "s4",
    courseId: "c4",
    title: "Silent sequence",
    status: "in-critique",
    priority: "medium",
    dueDate: "Aug 19",
  },
  {
    id: "k5",
    studentId: "s3",
    courseId: "c3",
    title: "Memory assemblage",
    status: "revision",
    priority: "medium",
    dueDate: "Aug 21",
  },
  {
    id: "k6",
    studentId: "s6",
    courseId: "c6",
    title: "Character walk cycle",
    status: "revision",
    priority: "low",
    dueDate: "Aug 23",
  },
  {
    id: "k7",
    studentId: "s7",
    courseId: "c2",
    title: "Community print series",
    status: "complete",
    priority: "low",
    dueDate: "Complete",
  },
  {
    id: "k8",
    studentId: "s8",
    courseId: "c1",
    title: "Monochrome interior",
    status: "complete",
    priority: "medium",
    dueDate: "Complete",
  },
];

export const announcements = [
  {
    id: "n1",
    title: "Fall exhibition submissions",
    body: "Portfolio submissions close Friday at 5:00 PM.",
    date: "Today",
    tag: "Exhibition",
  },
  {
    id: "n2",
    title: "Studio access extended",
    body: "North studios remain open until midnight this week.",
    date: "Yesterday",
    tag: "Campus",
  },
  {
    id: "n3",
    title: "Visiting artist lecture",
    body: "Carlos Mendez speaks in the Forum on Thursday.",
    date: "Aug 12",
    tag: "Events",
  },
  {
    id: "n4",
    title: "Materials exchange",
    body: "Drop off usable surplus materials in the library atrium.",
    date: "Aug 10",
    tag: "Community",
  },
];
