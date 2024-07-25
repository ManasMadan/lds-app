import { Role } from "@prisma/client";
import { Home, User2, UserPlus, Users } from "lucide-react";

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
          label: "Review Questions",
          active: false,
          icon: Users,
          submenus: [
            {
              label: "All",
              active: pathname === "/qc/review",
              href: "/qc/review",
            },
          ],
          href: "/qc",
        },
      ],
      userRolesList: ["QC"],
    },
  ];
}
