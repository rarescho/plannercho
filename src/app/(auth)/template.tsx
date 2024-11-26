import React, { Suspense } from "react";

interface TemplateProps {
  children: React.ReactNode;
}

const Template: React.FC<TemplateProps> = ({ children }) => {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <div
        className="
      h-screen
      p-6 flex 
      justify-center"
      >
        {children}
      </div>
    </Suspense>
  );
};

export default Template;
