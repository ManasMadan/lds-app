import { Role } from "@prisma/client";
import { GitGraph, Home, Text, User2, UserPlus, Users } from "lucide-react";

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon?: any;
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  userRolesList: Role[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          label: "Manage Users",
          active: false,
          icon: Users,
          submenus: [
            {
              label: "New User",
              active: pathname === "/admin/new-user",
              href: "/admin/new-user",
            },
            {
              label: "Edit Users",
              active: pathname === "/admin/edit-users",
              href: "/admin/edit-users",
            },
          ],
          href: "/admin",
        },
        {
          label: "Questions",
          active: false,
          icon: Text,
          submenus: [],
          href: "/admin/questions",
        },
        {
          label: "Stats",
          active: false,
          icon: GitGraph,
          submenus: [
            {
              label: "All",
              active: pathname === "/admin/stats",
              href: "/admin/stats",
            },
            {
              label: "By Users",
              active: pathname === "/admin/stats/by-user",
              href: "/admin/stats/by-user",
            },
          ],
          href: "/admin",
        },
      ],
      userRolesList: ["ADMIN"],
    },
    {
      groupLabel: "",
      menus: [
        {
          label: "Home",
          active: false,
          icon: Home,
          submenus: [],
          href: "/sme",
        },
        {
          label: "Manage Questions",
          active: false,
          icon: Users,
          submenus: [
            {
              label: "New Question",
              active: pathname === "/sme/new-question",
              href: "/sme/new-question",
            },
            {
              label: "Edit Questions",
              active: pathname === "/sme/edit-questions",
              href: "/sme/edit-questions",
            },
          ],
          href: "/sme",
        },
        {
          label: "Stats",
          active: pathname === "/sme/stats",
          icon: GitGraph,
          submenus: [],
          href: "/sme/stats",
        },
      ],
      userRolesList: ["SME"],
    },
    {
      groupLabel: "",
      menus: [
        {
          label: "Home",
          active: false,
          icon: Home,
          submenus: [],
          href: "/qc",
        },
        {
          label: "Questions",
          active: false,
          icon: Users,
          submenus: [
            {
              label: "Review All",
              active: pathname === "/qc/review",
              href: "/qc/review",
            },
            {
              label: "Reviewed by me",
              active: pathname === "/qc/my-reviewed",
              href: "/qc/my-reviewed",
            },
            {
              label: "Reviewed by users",
              active: pathname === "/qc/by-users",
              href: "/qc/by-users",
            },
          ],
          href: "/qc",
        },
        {
          label: "Stats",
          active: pathname === "/qc/stats",
          icon: GitGraph,
          submenus: [],
          href: "/qc/stats",
        },
      ],
      userRolesList: ["QC"],
    },
  ];
}
