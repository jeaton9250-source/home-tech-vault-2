import { TESTIMONIALS } from "@/lib/marketing/testimonials";

export default function TestimonialsSection() {
  const featured = TESTIMONIALS.filter(
    (item) => item.featured
  );

  return (
    <section
      className="border-t border-border-subtle px-6 py-24 md:px-8 md:py-32"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-overline text-text-muted">
            Testimonials
          </p>

          <h2
            id="testimonials-heading"
            className="mt-4 text-3xl font-medium tracking-[-0.03em] md:text-4xl"
          >
            Homes that feel more in control.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {featured.map((item) => (
            <figure
              key={item.id}
              className="flex flex-col rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-8 shadow-[var(--shadow-sm)]"
            >
              <blockquote className="flex-1 text-base leading-8 text-text-secondary">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-6 border-t border-border-subtle pt-5">
                <p className="text-sm font-medium text-text-primary">
                  {item.name}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {item.detail}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-lg text-center text-xs text-text-tertiary">
          Early feedback from demo users and beta households.
          Customer reviews coming soon.
        </p>
      </div>
    </section>
  );
}
