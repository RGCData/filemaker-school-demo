# Reusable app navigation

`AppSidebar` is a data-driven shadcn-style navigation component. It supports:

- labeled sections;
- links and optional Lucide icons;
- nested collapsible groups at any configuration depth;
- badges;
- automatic active-route selection;
- a full desktop sidebar and compact icon rail;
- tooltip labels in rail mode;
- mobile Sheet composition;
- persisted group and sidebar state.

Edit `navigation.config.ts` to change the School menu. A link needs `id`, `label`, and `to`. A group uses `children` instead of `to`:

```ts
{
  id: "reports",
  label: "Reports",
  icon: ChartNoAxesCombined,
  defaultOpen: true,
  children: [
    {
      id: "reports-attendance",
      label: "Attendance",
      to: "/admin/reports/attendance",
      icon: ClipboardCheck,
    },
  ],
}
```

The icon is optional. Add another `children` array to create another level. Route links should remain unique, and every `id` must be stable and unique across the complete configuration.

`AppLayout` owns the desktop collapsed state and supplies the same config to the mobile Sheet. This keeps the component reusable while allowing each product shell to choose its widths, persistence policy, and mobile trigger.
