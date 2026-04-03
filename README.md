# Expensa-Smart Expense Tracker

A modern React-based frontend for the Expense Tracker application built with Vite, Tailwind CSS, and Recharts.

🚀 Project Status

🌐 Deployment:(https://premshuk-expensa.vercel.app/)

🔄 Future Enhancements:

Advanced analytics & charts

Export reports in multiple formats

Improved UI/UX and performance optimizations


## 🚀 Quick Start

npm install

npm run dev

The application will open at http://localhost:5173


📦 Project Setup
Installation-cd frontend

npm install

Development Server-npm run dev

Runs the app in development mode with hot module replacement (HMR).

Build for Production-npm run build

Creates an optimized production build in the dist/ folder.

Preview Production Build-npm run preview



🎯 Key Features

Authentication

User registration and login

JWT token-based authentication

Protected routes

User context for state management

Dashboard

Financial overview with charts

Income tracking

Expense tracking

Recent transactions

Income and expense lists

Last 60 days analytics

Reports

Download income reports as Excel

Download expense reports as Excel

Data visualization with Recharts

Profile

User profile management

🛠️ Tech Stack

React 19 - UI framework

Vite - Build tool and dev server

Tailwind CSS - Utility-first CSS framework

Recharts - Data visualization library

React Router - Client-side routing

Axios - HTTP client for API calls

React Icons - Icon library


📱 Available Components

Layout Components

Navbar - Top navigation bar

SideMenu - Sidebar navigation

AuthLayout - Authentication pages layout

DashboardLayout - Dashboard pages layout

Card Components

InfoCard - Display financial information

TransactionInfoCard - Display transaction details

Dashboard Components

ExpenseOverview - Expense summary

IncomeOverview - Income summary

FinanceOverview - Overall financial view

ExpensesList - List of expenses

IncomeList - List of income entries

RecentTransactions - Recent activity

Last60DaysExpenses - Expense chart

IncomeLast60Days - Income chart


🔗 API Integration

The frontend communicates with the backend API. Key endpoints:

# Authentication

POST /api/auth/register - User registration

POST /api/auth/login - User login

GET /api/auth/profile - Get current user

# Legacy Finance (backward-compatible)

GET /api/income/get - Get all income

POST /api/income/add - Add income

DELETE /api/income/:id - Delete income

GET /api/income/downloadexcel - Download income report

GET /api/expense/get - Get all expenses

POST /api/expense/add - Add expense

DELETE /api/expense/:id - Delete expense

GET /api/expense/downloadexcel - Download expense report

GET /api/dashboard - Get dashboard data

# New generic modules

GET /api/modules/finance/dashboard - Finance dashboard data

GET /api/modules/finance/income - Get all income

POST /api/modules/finance/income - Add income

DELETE /api/modules/finance/income/:id - Delete income

GET /api/modules/finance/income/download - Download income report

GET /api/modules/finance/expense - Get all expenses

POST /api/modules/finance/expense - Add expense

DELETE /api/modules/finance/expense/:id - Delete expense

GET /api/modules/finance/expense/download - Download expense report

#

🎨 Styling
The project uses Tailwind CSS for styling. Global styles are defined in src/index.css.

🔒 Authentication Flow

User signs up or logs in via the auth pages

Backend returns a JWT token

Token is stored in localStorage via userContext

Token is sent with every API request via axios interceptor

Protected routes redirect unauthenticated users to login

📈 State Management

The app uses React Context (userContext) for managing:

Current user information

Authentication state

User token

🖼️ Application Screenshots

Below are some key screens from the application demonstrating the user flow and core features.

🚦 Routing

Routes are managed using React Router:

/auth/login - Login page

/auth/signup - Registration page

/dashboard - Main dashboard

/dashboard/income - Income page

/dashboard/expense - Expense page

📝 Scripts

Command	Description

npm run dev	-Start development server

npm run build-	Build for production

npm run preview-	Preview production build

npm run lint-	Run ESLint

Page	Screenshot

## Sign In Page
<img width="1916" alt="Sign In Page" src="https://raw.githubusercontent.com/premshuksaha/Expensa/main/frontend/screenshots/Login.png" />

## Sign Up Page
<img width="1916" alt="Sign In Page" src="https://raw.githubusercontent.com/premshuksaha/Expensa/main/frontend/screenshots/Register.png" />

## Home
<img width="1916" alt="Sign In Page" src="https://raw.githubusercontent.com/premshuksaha/Expensa/main/frontend/screenshots/Home.png" />

## Expense Page
<img width="1916" alt="Sign In Page" src="https://raw.githubusercontent.com/premshuksaha/Expensa/main/frontend/screenshots/Expense.png" />

## Income Page
<img width="1916" alt="Sign In Page" src="https://raw.githubusercontent.com/premshuksaha/Expensa/main/frontend/screenshots/Income.png" />
	

👩‍💻 Author

Premshuk Saha

Fourth-Year Undergraduate

Passionate about Full-Stack Development and UI/UX


