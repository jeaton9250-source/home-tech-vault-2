import HomeTechHealthCheck from "@/components/health-check/HomeTechHealthCheck";

export default function HomeTechHealthCheckSection() {
  return (
    <section
      id="home-tech-health-check"
      className="bg-[#f4f0e8] px-5 py-14 md:px-8 md:py-20 lg:px-12"
      aria-labelledby="home-tech-health-check-heading"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-8 max-w-3xl text-center md:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
            Know where you stand
          </p>

          <h2
            id="home-tech-health-check-heading"
            className="mt-4 font-serif text-3xl font-medium tracking-[-0.035em] text-[#17212a] md:text-5xl"
          >
            Find the gaps before you need the information.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#68737b]">
            Get a free snapshot of how organized,
            protected, and recoverable your home
            technology is.
          </p>
        </div>

        <HomeTechHealthCheck />
      </div>
    </section>
  );
}
