import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  to?: string;
  icon?: LucideIcon;
  badge?: string | number;
  description?: string;
  disabled?: boolean;
  children?: NavigationItem[];
  defaultOpen?: boolean;
}

export interface NavigationSection {
  id: string;
  label?: string;
  items: NavigationItem[];
}

export interface NavigationConfig {
  sections: NavigationSection[];
  storageKey?: string;
}

export interface NavigationBrand {
  name: string;
  subtitle?: string;
  to: string;
  icon?: LucideIcon;
}

export interface NavigationProfile {
  name: string;
  detail?: string;
  initials: string;
}
