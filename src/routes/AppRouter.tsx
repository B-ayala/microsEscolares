import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Dashboard from '../pages/Dashboard/Dashboard';
import Students from '../pages/Students/Students';
import Schools from '../pages/Schools/Schools';
import Payments from '../pages/Payments/Payments';

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schools" element={<Schools />} />
          <Route path="students" element={<Students />} />
          <Route path="payments" element={<Payments />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
