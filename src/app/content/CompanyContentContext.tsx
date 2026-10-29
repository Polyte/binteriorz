import React, { createContext, useContext, useEffect, useState } from 'react';
import { CompanyContent, DEFAULT_COMPANY_CONTENT, normalizeCompanyContent } from './company';

const CompanyContentContext = createContext<CompanyContent>(DEFAULT_COMPANY_CONTENT);

export const CompanyContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<CompanyContent>(() => normalizeCompanyContent());

  useEffect(() => {
    let active = true;
    fetch('/api/company-content')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => { if (active && data && Object.keys(data).length) setContent(normalizeCompanyContent(data)); })
      .catch(() => { /* Built-in company copy remains available offline. */ });
    return () => { active = false; };
  }, []);

  return <CompanyContentContext.Provider value={content}>{children}</CompanyContentContext.Provider>;
};

export const useCompanyContent = () => useContext(CompanyContentContext);
