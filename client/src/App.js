import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import TxtToExcel from './utils/TxtToExcel';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DailyOvertimeForm from './pages/DailyOvertimeForm';
import EmployeeManagement from './pages/EmployeeManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/txttoexcel" element={<TxtToExcel />} />
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
          />
          <Route path="/weeklyOvertime" element={
            <PrivateRoute>
              <DailyOvertimeForm />
            </PrivateRoute>
          }
          />
          <Route path="/employeeManagement" element={
            <PrivateRoute>
              <EmployeeManagement />
            </PrivateRoute>
          }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;