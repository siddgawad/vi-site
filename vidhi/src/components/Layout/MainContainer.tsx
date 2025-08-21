import { ReactNode } from 'react';

interface MainContainerProps {
  children: ReactNode;
}

export default function MainContainer({ children }: MainContainerProps) {
  return (
    <div className="min-h-screen bg-[#F2CEE6] py-2 xs:py-4 sm:py-6 md:py-8 lg:py-10 px-1 xs:px-2 sm:px-4">
      <main className="w-full isolate sm:w-[98%] md:w-[95%] lg:w-[90%] xl:w-[85%] 2xl:w-[80%] max-w-7xl mx-auto bg-[#812261] rounded-xl main-bg xs:rounded-2xl sm:rounded-3xl shadow-lg px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 xs:py-4 sm:py-6 md:py-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}