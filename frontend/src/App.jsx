import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Welcome from './components/Onboarding/Welcome';
import IncomeType from './components/Onboarding/IncomeType';
import IncomeDetails from './components/Onboarding/IncomeDetails';
import FixedExpenses from './components/Onboarding/FixedExpenses';
import Goals from './components/Onboarding/Goals';
import RiskLiteracy from './components/Onboarding/RiskLiteracy';
import Summary from './components/Onboarding/Summary';
import ChatScreen from './components/Chat/ChatScreen';
import DashboardScreen from './components/Dashboard/DashboardScreen';
import GoalsScreen from './components/Goals/GoalsScreen';
import InvestmentsScreen from './components/Investments/InvestmentsScreen';
import TransactionsScreen from './components/Transactions/TransactionsScreen';
import ProfileScreen from './components/Profile/ProfileScreen';
import useStore from './store/useStore';

import LoginScreen from './components/Auth/LoginScreen';
import SignupScreen from './components/Auth/SignupScreen';

const App = () => {
  const { user, isOnboarded } = useStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!user ? <SignupScreen /> : <Navigate to="/" replace />} />

        {/* Onboarding Routes */}
        <Route path="/onboarding" element={user ? <Layout /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="welcome" replace />} />
          <Route path="welcome" element={<Welcome />} />
          <Route path="income-type" element={<IncomeType />} />
          <Route path="income-details" element={<IncomeDetails />} />
          <Route path="fixed-expenses" element={<FixedExpenses />} />
          <Route path="goals" element={<Goals />} />
          <Route path="risk-literacy" element={<RiskLiteracy />} />
          <Route path="summary" element={<Summary />} />
        </Route>

        {/* Main App Routes */}
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" replace />}>
          <Route index element={isOnboarded ? <ChatScreen /> : <Navigate to="/onboarding/welcome" replace />} />
          <Route path="dashboard" element={isOnboarded ? <DashboardScreen /> : <Navigate to="/onboarding/welcome" replace />} />
          <Route path="goals" element={isOnboarded ? <GoalsScreen /> : <Navigate to="/onboarding/welcome" replace />} />
          <Route path="investments" element={isOnboarded ? <InvestmentsScreen /> : <Navigate to="/onboarding/welcome" replace />} />
          <Route path="transactions" element={isOnboarded ? <TransactionsScreen /> : <Navigate to="/onboarding/welcome" replace />} />
          <Route path="profile" element={isOnboarded ? <ProfileScreen /> : <Navigate to="/onboarding/welcome" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
