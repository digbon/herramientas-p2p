/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Simulator } from './views/Simulator';
import { History } from './views/History';
import { Balance } from './views/Balance';
import { Statistics } from './views/Statistics';
import { Gestor } from './views/Gestor';
import { Documentation } from './views/Documentation';

export default function App() {
  const [activeTab, setActiveTab] = useState('simulador');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
      {activeTab === 'historial' && <History />}
      {activeTab === 'balance' && <Balance />}
      {activeTab === 'estadisticas' && <Statistics />}
      {activeTab === 'simulador' && <Simulator />}
      {activeTab === 'ajustes' && <Gestor onNavigate={setActiveTab} />}
      {activeTab === 'documentacion' && <Documentation onBack={() => setActiveTab('ajustes')} />}
    </Layout>
  );
}

