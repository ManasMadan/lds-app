import { Role } from "@prisma/client";
import { User2, UserPlus, Users } from "lucide-react";

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
          href: "/admin/manage-users",
        },
      ],
      userRolesList: ["ADMIN"],
    },
  ];
}
