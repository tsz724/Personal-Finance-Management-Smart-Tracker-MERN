export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_PATHS = {
    AUTH:{
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        PROFILE: '/api/auth/profile',
    },
    DASHBOARD: {
        GET_DATA: '/api/dashboard',
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