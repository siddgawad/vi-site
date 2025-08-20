import Section from '../Layout/Section';

export default function JokesSection() {
  return (
    <Section id="jokes">
      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">
        Jokes
      </h2>
      {/* Test sticky stage */}
      <section className="h-[200vh]">
        <div className="sticky top-0 h-screen grid place-items-center">Test Sticky</div>
      </section>
    </Section>
  );
}