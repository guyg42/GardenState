import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './components/Auth/AuthProvider';
import { LoginForm } from './components/Auth/LoginForm';
import { GardenList } from './components/Gardens/GardenList';
import { PlantList } from './components/Plants/PlantList';
import { PlantDetail } from './components/Plants/PlantDetail';
import { EntryChat } from './components/Entries/EntryChat';
import { LoadingSpinner } from './components/Common/LoadingSpinner';
import { Layout } from './components/Common/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuthContext();

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/gardens" replace /> : <LoginForm />} 
        />
        <Route
          path="/gardens"
          element={
            <ProtectedRoute>
              <GardenList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/garden/:gardenId"
          element={
            <ProtectedRoute>
              <PlantList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/garden/:gardenId/plant/:plantId"
          element={
            <ProtectedRoute>
              <PlantDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/garden/:gardenId/plant/:plantId/entry/:entryId"
          element={
            <ProtectedRoute>
              <EntryChat />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/gardens" replace />} />
        <Route path="*" element={<Navigate to="/gardens" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
