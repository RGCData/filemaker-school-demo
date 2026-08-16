import {
  BookOpen,
  CalendarDays,
  CircleGauge,
  ClipboardCheck,
  GalleryVerticalEnd,
  GraduationCap,
  Image,
  LayoutDashboard,
  Palette,
  Settings2,
  Users,
} from "lucide-react";

import type {
  NavigationBrand,
  NavigationConfig,
  NavigationProfile,
} from "./navigation.types";

export const schoolNavigation: NavigationConfig = {
  storageKey: "school-navigation",
  sections: [
    {
      id: "student",
      label: "Student",
      items: [
        {
          id: "student-overview",
          label: "Overview",
          to: "/student",
          icon: LayoutDashboard,
          description: "Your student dashboard",
        },
        {
          id: "student-learning",
          label: "Learning",
          icon: GraduationCap,
          defaultOpen: true,
          children: [
            {
              id: "student-classes",
              label: "Classes",
              to: "/student/classes",
              icon: BookOpen,
            },
            {
              id: "student-schedule",
              label: "Schedule",
              to: "/student/schedule",
              icon: CalendarDays,
            },
            {
              id: "student-assignments",
              label: "Assignments",
              to: "/student/assignments",
              icon: ClipboardCheck,
              badge: 3,
            },
          ],
        },
        {
          id: "student-showcase",
          label: "Showcase",
          icon: GalleryVerticalEnd,
          children: [
            {
              id: "student-portfolio",
              label: "Portfolio",
              to: "/student/portfolio",
              icon: Image,
            },
          ],
        },
      ],
    },
    {
      id: "administration",
      label: "Administration",
      items: [
        {
          id: "admin-overview",
          label: "Admin overview",
          to: "/admin",
          icon: CircleGauge,
        },
        {
          id: "admin-management",
          label: "Management",
          icon: Settings2,
          defaultOpen: true,
          children: [
            {
              id: "admin-students",
              label: "Students",
              to: "/admin/students",
              icon: Users,
            },
            {
              id: "admin-classes",
              label: "Classes",
              to: "/admin/classes",
              icon: BookOpen,
            },
          ],
        },
        {
          id: "admin-critiques",
          label: "Critique board",
          to: "/admin/critiques",
          icon: Palette,
          badge: "Live",
        },
      ],
    },
  ],
};

export const schoolBrand: NavigationBrand = {
  name: "School",
  subtitle: "College of Art",
  to: "/student",
  icon: Palette,
};

export const schoolProfile: NavigationProfile = {
  name: "Clara Voss",
  detail: "Painting · Year 3",
  initials: "CV",
};
