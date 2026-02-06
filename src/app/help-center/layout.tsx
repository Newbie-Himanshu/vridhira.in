import React from 'react';
import Link from 'next/link';

export default function HelpCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark transition-colors duration-300 antialiased font-body min-h-screen">
      <div className="flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}
