import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TxtToExcel from './utils/TxtToExcel';
import EmployeeManagement from './pages/EmployeeManagement';
import OvertimeList from './components/OvertimeList';
import OvertimeForm from './components/OvertimeForm';
import MonthlyReport from './pages/MonthlyReport';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
          />
          <Route path="/txttoexcel" element={
            <PrivateRoute>
              <TxtToExcel />
            </PrivateRoute>
          } />
          <Route path="/employeeManagement" element={
            <PrivateRoute>
              <EmployeeManagement />
            </PrivateRoute>
          }
          />

          {/* OVERTIME */}
          <Route path="/overtimeList" element={
            <PrivateRoute>
              <OvertimeList />
            </PrivateRoute>
          }
          />
          <Route path="/overtimeForm" element={
            <PrivateRoute>
              <OvertimeForm />
            </PrivateRoute>
          }
          />
          <Route path="/monthlyReport" element={
            <PrivateRoute>
              <MonthlyReport />
            </PrivateRoute>
          }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;