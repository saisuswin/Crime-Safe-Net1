import React, { createContext, useContext, useState } from 'react';

const ReportsContext = createContext();

const sampleReports = [
  {
    id: 1,
    title: 'Theft - Jewelry Store',
    crimeType: 'Theft',
    location: 'Downtown District',
    description: 'Jewelry store robbery on Main Street',
    status: 'Under Investigation',
    date: '2025-12-07',
    citizenId: 'user1',
    citizenName: 'John Doe'
  },
  {
    id: 2,
    title: 'Suspicious Activity',
    crimeType: 'Suspicious Activity',
    location: 'Park Avenue',
    description: 'Unusual activity reported near the park',
    status: 'Reported',
    date: '2025-12-08',
    citizenId: 'user2',
    citizenName: 'Jane Smith'
  },
  {
    id: 3,
    title: 'Breaking and Entering',
    crimeType: 'Breaking and Entering',
    location: 'Residential Area',
    description: 'Attempted break-in at residential property',
    status: 'Resolved',
    date: '2025-12-06',
    citizenId: 'user3',
    citizenName: 'Mike Johnson'
  }
];

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState(sampleReports);

  const addReport = (report) => {
    const newReport = {
      ...report,
      id: reports.length + 1,
      date: new Date().toISOString().split('T')[0],
      status: 'Reported'
    };
    setReports([newReport, ...reports]);
    return newReport;
  };

  const updateReport = (id, updates) => {
    setReports(reports.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const getReportsByCitizen = (citizenId) => {
    return reports.filter(r => r.citizenId === citizenId);
  };

  return (
    <ReportsContext.Provider value={{ reports, addReport, updateReport, getReportsByCitizen }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within ReportsProvider');
  }
  return context;
}
