import { ReactNode, forwardRef } from 'react';

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  innerClassName?: string;
}

const Section = forwardRef<HTMLDivElement, SectionProps>(({ 
  children, 
  id, 
  className = "", 
  innerClassName = "" 
}, ref) => {
  return (
    <div className={`bg-[#D86DB5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6 ${className}`}>
      <section 
        ref={ref}
        id={id} 
        className={`p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-[#E18EC5] rounded-xl xs:rounded-2xl sm:rounded-3xl ${innerClassName}`}
      >
        {children}
      </section>
    </div>
  );
});

Section.displayName = 'Section';
export default Section;