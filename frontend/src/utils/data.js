import {
    LuLayoutDashboard,
    LuHandCoins,
    LuWalletMinimal,
    LuBuilding2,
    LuBriefcase,
    LuFolderKanban,
    LuMail,
    LuUsers,
    LuCalendarDays,
    LuShield,
} from 'react-icons/lu';
import { HiLogout } from 'react-icons/hi';

export const SideMenuData = [
    {
        id: '01',
        label: 'Dashboard',
        icon: LuLayoutDashboard,
        path: '/dashboard',
    },
    {
        id: '02',
        label: 'Workspaces',
        icon: LuBuilding2,
        path: '/workspaces',
    },
    {
        id: '03',
        label: 'Jobs',
        icon: LuBriefcase,
        path: '/jobs',
    },
    {
        id: '04',
        label: 'Work items',
        icon: LuFolderKanban,
        path: '/projects',
    },
    {
        id: '05',
        label: 'Finance / Income',
        icon: LuWalletMinimal,
        path: '/finance/income',
    },
    {
        id: '06',
        label: 'Finance / Expense',
        icon: LuHandCoins,
        path: '/finance/expense',
    },
    {
        id: '07',
        label: 'Email',
        icon: LuMail,
        path: '/email',
    },
    {
        id: '08',
        label: 'Employees',
        icon: LuUsers,
        path: '/employees',
    },
    {
        id: '09',
        label: 'Calendar',
        icon: LuCalendarDays,
        path: '/calendar',
    },
    {
        id: '10',
        label: 'Admin',
        icon: LuShield,
        path: '/admin',
        adminOnly: true,
    },
    {
        id: '99',
        label: 'Logout',
        icon: HiLogout,
        path: '/logout',
    },
];
