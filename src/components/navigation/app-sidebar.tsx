import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type {
  NavigationBrand,
  NavigationConfig,
  NavigationItem,
  NavigationProfile,
} from "./navigation.types";

interface AppSidebarProps {
  config: NavigationConfig;
  brand: NavigationBrand;
  profile?: NavigationProfile;
  collapsed?: boolean;
  mobile?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onNavigate?: () => void;
  className?: string;
}

function flattenItems(items: NavigationItem[]): NavigationItem[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenItems(item.children) : []),
  ]);
}

function findActiveId(config: NavigationConfig, pathname: string) {
  return config.sections
    .flatMap((section) => flattenItems(section.items))
    .filter(
      (item) =>
        item.to &&
        !item.disabled &&
        (pathname === item.to || pathname.startsWith(`${item.to}/`)),
    )
    .sort((a, b) => (b.to?.length ?? 0) - (a.to?.length ?? 0))[0]?.id;
}

function containsItem(items: NavigationItem[], itemId?: string): boolean {
  return Boolean(
    itemId &&
      items.some(
        (item) =>
          item.id === itemId ||
          (item.children && containsItem(item.children, itemId)),
      ),
  );
}

function getInitialGroups(config: NavigationConfig) {
  const defaults: Record<string, boolean> = {};
  for (const section of config.sections) {
    for (const item of flattenItems(section.items)) {
      if (item.children) defaults[item.id] = item.defaultOpen ?? false;
    }
  }
  if (!config.storageKey) return defaults;
  try {
    const stored = localStorage.getItem(`${config.storageKey}:groups`);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
}

export function AppSidebar({
  config,
  brand,
  profile,
  collapsed = false,
  mobile = false,
  onCollapsedChange,
  onNavigate,
  className,
}: AppSidebarProps) {
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    getInitialGroups(config),
  );
  const activeId = useMemo(
    () => findActiveId(config, pathname),
    [config, pathname],
  );
  const compact = collapsed && !mobile;

  useEffect(() => {
    if (!config.storageKey) return;
    localStorage.setItem(
      `${config.storageKey}:groups`,
      JSON.stringify(openGroups),
    );
  }, [config.storageKey, openGroups]);

  useEffect(() => {
    if (!activeId) return;
    const activeGroups = config.sections
      .flatMap((section) => flattenItems(section.items))
      .filter(
        (item) => item.children && containsItem(item.children, activeId),
      );
    if (!activeGroups.length) return;
    setOpenGroups((current) => {
      if (activeGroups.every((group) => current[group.id])) return current;
      return Object.fromEntries([
        ...Object.entries(current),
        ...activeGroups.map((group) => [group.id, true]),
      ]);
    });
  }, [activeId, config.sections]);

  const toggleGroup = (item: NavigationItem) => {
    if (compact) onCollapsedChange?.(false);
    setOpenGroups((current) => ({
      ...current,
      [item.id]: !current[item.id],
    }));
  };

  const withTooltip = (
    content: React.ReactNode,
    label: string,
    key?: React.Key,
  ) =>
    compact ? (
      <Tooltip key={key}>
        <TooltipTrigger render={content as React.ReactElement} />
        <TooltipContent side="right" sideOffset={10}>
          {label}
        </TooltipContent>
      </Tooltip>
    ) : (
      content
    );

  const renderItem = (item: NavigationItem, depth = 0): React.ReactNode => {
    const Icon = item.icon;
    const isActive = activeId === item.id;
    const hasActiveChild = containsItem(item.children ?? [], activeId);
    const hasChildren = Boolean(item.children?.length);

    if (hasChildren) {
      const expanded = Boolean(openGroups[item.id] || hasActiveChild);
      const trigger = (
        <button
          type="button"
          onClick={() => toggleGroup(item)}
          aria-expanded={expanded}
          aria-controls={compact ? undefined : `nav-group-${item.id}`}
          aria-label={compact ? item.label : undefined}
          className={cn(
            "group flex min-h-10 w-full items-center rounded-xl text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            compact ? "justify-center px-2" : "gap-3 px-3",
            hasActiveChild
              ? "text-sidebar-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          )}
        >
          {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
          {!compact && (
            <>
              <span className="min-w-0 flex-1 truncate text-left">
                {item.label}
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform motion-reduce:transition-none",
                  expanded && "rotate-180",
                )}
                aria-hidden="true"
              />
            </>
          )}
        </button>
      );
      return (
        <div key={item.id}>
          {withTooltip(trigger, item.label, item.id)}
          {!compact && expanded && (
            <div
              id={`nav-group-${item.id}`}
              className="mt-1 space-y-1"
              style={{ paddingLeft: `${Math.min(depth + 1, 3) * 12}px` }}
            >
              {item.children?.map((child) => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const link = (
      <Link
        key={item.id}
        to={item.to ?? pathname}
        onClick={(event) => {
          if (item.disabled) event.preventDefault();
          else onNavigate?.();
        }}
        aria-current={isActive ? "page" : undefined}
        aria-disabled={item.disabled || undefined}
        aria-label={compact ? item.label : undefined}
        tabIndex={item.disabled ? 0 : undefined}
        className={cn(
          "group flex min-h-10 items-center rounded-xl text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          compact ? "justify-center px-2" : "gap-3 px-3",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          item.disabled && "cursor-not-allowed opacity-45",
        )}
      >
        {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
        {!compact && (
          <>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  isActive
                    ? "bg-primary-foreground/15"
                    : "bg-sidebar-accent text-sidebar-foreground/75",
                )}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
    return withTooltip(link, item.label, item.id);
  };

  const BrandIcon = brand.icon;
  return (
    <TooltipProvider delay={250}>
      <nav
        aria-label={mobile ? "Mobile main navigation" : "Main navigation"}
        className={cn(
          "flex h-full flex-col overflow-hidden bg-sidebar p-3 text-sidebar-foreground",
          className,
        )}
      >
        <div
          className={cn(
            "mb-5 flex min-h-12 items-center",
            compact ? "justify-center" : "justify-between gap-2 px-1",
          )}
        >
          {withTooltip(
            <Link
              to={brand.to}
              onClick={onNavigate}
              aria-label={compact ? brand.name : undefined}
              className={cn(
                "flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
                compact && "justify-center",
              )}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                {BrandIcon && <BrandIcon className="size-5" aria-hidden="true" />}
              </span>
              {!compact && (
                <span className="min-w-0">
                  <span className="block truncate font-display text-xl leading-none">
                    {brand.name}
                  </span>
                  {brand.subtitle && (
                    <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/55">
                      {brand.subtitle}
                    </span>
                  )}
                </span>
              )}
            </Link>,
            brand.name,
          )}
          {!compact && !mobile && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onCollapsedChange?.(true)}
              aria-label="Collapse navigation"
              className="text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <PanelLeftClose />
            </Button>
          )}
        </div>

        <ScrollArea className="min-h-0 flex-1">
          {config.sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              role="group"
              aria-label={section.label}
              className={cn(sectionIndex > 0 && "mt-4")}
            >
              {sectionIndex > 0 && <Separator className="mb-4 bg-sidebar-border" />}
              {!compact && section.label && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => renderItem(item))}
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="mt-4">
          {compact && !mobile && (
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => onCollapsedChange?.(false)}
              aria-label="Expand navigation"
              className="mb-2 w-full text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <PanelLeftOpen />
            </Button>
          )}
          {profile && (
            <div
              aria-label={`${profile.name}${profile.detail ? `, ${profile.detail}` : ""}`}
              className={cn(
                "rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-2",
                compact ? "flex justify-center" : "flex items-center gap-3",
              )}
            >
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-[#e6b86e] text-[#342139]">
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
              {!compact && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{profile.name}</p>
                    {profile.detail && (
                      <p className="truncate text-xs text-sidebar-foreground/55">
                        {profile.detail}
                      </p>
                    )}
                  </div>
                  <Settings
                    className="size-4 text-sidebar-foreground/45"
                    aria-hidden="true"
                  />
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </TooltipProvider>
  );
}
