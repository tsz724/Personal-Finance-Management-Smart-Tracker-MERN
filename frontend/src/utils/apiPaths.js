export const API_BASE_URL = 'https://expensa-7a6f.onrender.com';

export const API_PATHS = {
    AUTH:{
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        PROFILE: '/api/auth/profile',
    },
    DASHBOARD: {
        GET_DATA: '/api/dashboard',
    },
    INCOME: {
        ADD: '/api/income/add',
        GET_ALL: '/api/income/get',
        DOWNLOAD_EXCEL: '/api/income/downloadexcel',
        DELETE: (id) => `/api/income/delete/${id}`,
    },
    EXPENSE: {
        ADD: '/api/expense/add',
        GET_ALL: '/api/expense/get',
        DOWNLOAD_EXCEL: '/api/expense/downloadexcel',
        DELETE: (id) => `/api/expense/delete/${id}`,
    },
};