import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import GAListener from './utils/GAListener';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManager from './pages/UserManager';
import EmployeeManagement from './pages/EmployeeManagement';
import OvertimeList from './pages/OvertimeList';
import OvertimeForm from './pages/OvertimeForm';
import MonthlyReport from './pages/MonthlyReport';
import ScannerConverter from './utils/ScannerConverter';

function App() {
  return (
    <div>
      <AuthProvider>
        <Router>
          <ToastContainer autoClose={4000} />
          <GAListener />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
            />
            <Route path="/userManager" element={
              <PrivateRoute>
                <UserManager />
              </PrivateRoute>
            }
            />
            <Route path="/scannerConverter" element={
              <PrivateRoute>
                <ScannerConverter />
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
    </div>
  );
}

export default App;