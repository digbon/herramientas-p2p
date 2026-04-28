/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Simulator } from './views/Simulator';
import { History } from './views/History';
import { Balance } from './views/Balance';
import { Statistics } from './views/Statistics';
import { Gestor } from './views/Gestor';
import { Documentation } from './views/Documentation';
import { SyncManager } from './components/SyncManager';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.substring(1) || 'simulador';

  const handleNavigate = (tab: string) => {
    navigate(`/${tab}`);
  };

  return (
    <>
      <SyncManager />
      <Layout activeTab={activeTab} onTabChange={handleNavigate}>
        <Routes>
          <Route path="/" element={<Navigate to="/simulador" replace />} />
          <Route path="/dashboard" element={<Dashboard onNavigate={handleNavigate} />} />
          <Route path="/historial" element={<History />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/estadisticas" element={<Statistics />} />
          <Route path="/simulador" element={<Simulator />} />
          <Route path="/ajustes" element={<Gestor onNavigate={handleNavigate} />} />
          <Route path="/documentacion" element={<Documentation onBack={() => handleNavigate('ajustes')} />} />
          <Route path="*" element={<Navigate to="/simulador" replace />} />
        </Routes>
      </Layout>
    </>
  );
}

