export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_PATHS = {
    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        PROFILE: '/api/auth/profile',
    },
    DASHBOARD: {
        GET_DATA: '/api/dashboard',
    },
    BUSINESS: {
        SUMMARY: '/api/business/summary',
        DASHBOARD: '/api/business/dashboard',
        WORKSPACES: '/api/business/workspaces',
        WORKSPACE: (id) => `/api/business/workspaces/${id}`,
        WORKSPACE_MEMBERS: (id) => `/api/business/workspaces/${id}/members`,
        WORKSPACE_MEMBER: (wsId, userId) => `/api/business/workspaces/${wsId}/members/${userId}`,
        JOBS: '/api/business/jobs',
        JOB: (id) => `/api/business/jobs/${id}`,
        PROJECTS: '/api/business/projects',
        PROJECT_BY_ID: (id) => `/api/business/projects/${id}`,
        PROJECT: (id) => `/api/business/projects/${id}`,
        WORK_ITEMS: '/api/business/work-items',
        WORK_ITEM: (id) => `/api/business/work-items/${id}`,
        EMAILS: '/api/business/emails',
        EMAIL: (id) => `/api/business/emails/${id}`,
        EMAIL_UNREAD: '/api/business/emails/unread-count',
        EMPLOYEES: '/api/business/employees',
        EMPLOYEE: (id) => `/api/business/employees/${id}`,
        CALENDAR: '/api/business/calendar',
        CALENDAR_EVENT: (id) => `/api/business/calendar/${id}`,
    },
    ADMIN: {
        USERS: '/api/admin/users',
        USER_ROLE: (id) => `/api/admin/users/${id}/role`,
        USER_ACTIVE: (id) => `/api/admin/users/${id}/active`,
        STATS: '/api/admin/stats',
    },
    MODULES: {
        FINANCE: {
            DASHBOARD: '/api/modules/finance/dashboard',
            INCOME: {
                ADD: '/api/modules/finance/income',
                GET_ALL: '/api/modules/finance/income',
                DOWNLOAD_EXCEL: '/api/modules/finance/income/download',
                DELETE: (id) => `/api/modules/finance/income/${id}`,
            },
            EXPENSE: {
                ADD: '/api/modules/finance/expense',
                GET_ALL: '/api/modules/finance/expense',
                DOWNLOAD_EXCEL: '/api/modules/finance/expense/download',
                DELETE: (id) => `/api/modules/finance/expense/${id}`,
            },
            INCOME_CATEGORIES: {
                LIST: '/api/modules/finance/income-categories',
                CREATE: '/api/modules/finance/income-categories',
                UPDATE: (id) => `/api/modules/finance/income-categories/${id}`,
                DELETE: (id) => `/api/modules/finance/income-categories/${id}`,
            },
            EXPENSE_CATEGORIES: {
                LIST: '/api/modules/finance/expense-categories',
                CREATE: '/api/modules/finance/expense-categories',
                UPDATE: (id) => `/api/modules/finance/expense-categories/${id}`,
                DELETE: (id) => `/api/modules/finance/expense-categories/${id}`,
            },
        },
    },
};
