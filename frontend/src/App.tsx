import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import PrivateRoute from './components/PrivateRoute';

import Requests from './pages/Requests';
import NewRequest from './pages/NewRequest';
import RequestDetail from './pages/RequestDetail';
import Profile from './pages/Profile';

// Composant principal de l'application gérant les routes
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute roles={['ETUDIANT', 'ADMIN']}>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <PrivateRoute roles={['ETUDIANT', 'ADMIN']}>
            <Courses />
          </PrivateRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <PrivateRoute roles={['ETUDIANT', 'ADMIN']}>
            <Requests />
          </PrivateRoute>
        }
      />
      <Route
        path="/requests/new"
        element={
          <PrivateRoute roles={['ETUDIANT', 'ADMIN']}>
            <NewRequest />
          </PrivateRoute>
        }
      />
      <Route
        path="/requests/:id"
        element={
          <PrivateRoute roles={['ETUDIANT', 'ADMIN']}>
            <RequestDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute roles={['ETUDIANT', 'ADMIN', 'view-profile']}>
            <Profile />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;
