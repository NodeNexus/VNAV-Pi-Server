import React, { useState, useEffect } from 'react';
import { NavItemKey, ServiceItem, ContainerItem, LogItem } from './types/telemetry';
import { useTelemetry } from './hooks/useTelemetry';
import { fetchServices, fetchContainers, fetchLogs } from './services/api';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { OverviewPage } from './pages/OverviewPage';
import { SystemPage } from './pages/SystemPage';
import { ServicesPage } from './pages/ServicesPage';
import { ContainersPage } from './pages/ContainersPage';
import { StoragePage } from './pages/StoragePage';
import { LogsPage } from './pages/LogsPage';
import { NetworkPage } from './pages/NetworkPage';
import { TerminalPage } from './pages/TerminalPage';
import { FileManagerPage } from './pages/FileManagerPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [activeTab, setActiveTab] = useState<NavItemKey>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { summary, history, isConnected, refresh: refreshTelemetry } = useTelemetry();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);

  const loadAuxData = async () => {
    try {
      const [svcData, cData, logData] = await Promise.all([
        fetchServices(),
        fetchContainers(),
        fetchLogs(20),
      ]);
      setServices(svcData);
      setContainers(cData);
      setLogs(logData);
    } catch (e) {
      console.error('Error fetching auxiliary dashboard data', e);
    }
  };

  useEffect(() => {
    loadAuxData();
    const interval = setInterval(loadAuxData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalRefresh = () => {
    refreshTelemetry();
    loadAuxData();
  };

  return (
    <div className="min-h-screen bg-brand-darkest text-slate-100 flex flex-col antialiased">
      {/* Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        summary={summary}
        isConnected={isConnected}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Top Header */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          activeTitle={activeTab}
          summary={summary}
          isConnected={isConnected}
          onRefresh={handleGlobalRefresh}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewPage
              summary={summary}
              history={history}
              services={services}
              logs={logs}
              isConnected={isConnected}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'system' && <SystemPage summary={summary} />}

          {activeTab === 'services' && (
            <ServicesPage services={services} onRefresh={loadAuxData} />
          )}

          {activeTab === 'containers' && (
            <ContainersPage containers={containers} onRefresh={loadAuxData} />
          )}

          {activeTab === 'storage' && <StoragePage summary={summary} />}

          {activeTab === 'logs' && <LogsPage />}

          {activeTab === 'network' && <NetworkPage summary={summary} />}

          {activeTab === 'terminal' && <TerminalPage />}

          {activeTab === 'files' && <FileManagerPage />}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
