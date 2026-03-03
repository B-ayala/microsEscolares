import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Dashboard from '../pages/Dashboard/Dashboard';
import Students from '../pages/Students/Students';
import Schools from '../pages/Schools/Schools';
import Payments from '../pages/Payments/Payments';
import Buses from '../pages/Buses/Buses';
import Expenses from '../pages/Expenses/Expenses';
import EmployeePayments from '../pages/EmployeePayments/EmployeePayments';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schools" element={<Schools />} />
          <Route path="students" element={<Students />} />
          <Route path="payments" element={<Payments />} />
          <Route path="buses" element={<Buses />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="employee-payments" element={<EmployeePayments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
