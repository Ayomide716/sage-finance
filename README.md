# Personal Finance Manager

A Progressive Web App for personal finance management that helps you track expenses, manage budgets, set financial goals, and gain insights into your financial health.

## Features

- **Transaction Management**: Record and categorize your income and expenses
- **Budget Tracking**: Set up monthly budgets by category and track your spending
- **Financial Goals**: Create, track, and complete financial goals
- **Dashboard Insights**: Get real-time analytics about your financial status
- **Reports**: View historical data and trends of your finances
- **Notifications**: Receive alerts when approaching budget limits
- **Offline Capability**: Use the app even without an internet connection
- **PWA Support**: Install as a standalone app on your device

## Getting Started

### Prerequisites

- Node.js v18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd personal-finance-manager
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase Authentication
   - Create a Firebase project at [firebase.google.com](https://console.firebase.google.com/)
   - Enable Email/Password authentication in your Firebase project
   - Add the following secrets to your environment:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_PROJECT_ID`

4. Run the application
```bash
npm run dev
```

5. Access the application at `http://localhost:5000`

## Using the Application

### Authentication

- Sign up with your email and password
- Log in to access your personal financial data

### Managing Transactions

- Add new transactions with details such as amount, date, category, and description
- View your transaction history and filter by date, category, or transaction type
- Edit or delete existing transactions

### Setting Up Budgets

- Create budgets for different spending categories
- Set monthly spending limits
- View your budget progress visually

### Setting Financial Goals

- Create financial goals with target amounts and deadlines
- Track your progress towards goals
- Mark goals as complete when achieved

### Dashboard & Insights

- View your financial summary including total balance, income, and expenses
- See smart insights generated based on your spending habits and budget usage
- Monitor trends in your financial activity

### Generating Reports

- View detailed financial reports
- Analyze spending patterns and income trends
- Export reports for your records

## Installing as a PWA

On supported browsers, you can install the Finance Manager as a Progressive Web App:

1. Look for the install icon in your browser's address bar
2. Click "Install" when prompted
3. The app will install on your device and can be launched like any other application

## Offline Usage

Once loaded, the application works offline with the following capabilities:
- View existing data
- Add new transactions (will sync when online)
- Track budget progress
- Update financial goals

Data will automatically synchronize when you regain internet connectivity.

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: React Query, React Context
- **UI Components**: shadcn/ui
- **Authentication**: Firebase Authentication
- **PWA**: Service Workers, IndexedDB
- **Backend**: Express, Node.js
- **Type Safety**: Zod, TypeScript

## License

This project is licensed under the MIT License - see the LICENSE file for details.