import Image from "next/image";

/* -------------------------------------------------------------------------- */
/*  Team data                                                                  */
/* -------------------------------------------------------------------------- */

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  image: string;
  imageAlt: string;
};

const TEAM: TeamMember[] = [
  {
    name: "TALHA TABISH",
    role: "Founder & CEO",
    bio: "Solo developer and indie founder. Started NARRO because he was tired of being afraid to speak. Now he's building the app he wishes existed when he started learning.",
    image: "/images/about/editor.webp",
    imageAlt: "Portrait of Tabish Khan, Founder and CEO of NARRO",
  },
  {
    name: "SUDAIS AZLAN",
    role: "Senior AI Engineer",
    bio: "The mind behind NARRO's real-time voice stack. Obsessed with making AI conversations feel so natural you forget you're talking to a machine.",
    image: "/images/about/sudais.webp",
    imageAlt: "Portrait of Sudais Azlan, Senior AI Engineer at NARRO",
  },
];

/* -------------------------------------------------------------------------- */
/*  Team Section                                                               */
/* -------------------------------------------------------------------------- */

export function TeamSection() {
  return (
    <section
      id="team"
      data-slot="about-team"
      aria-labelledby="team-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
          The team
        </span>

        <h2
          id="team-heading"
          className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
        >
          Small team. Big mission.
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:text-[1.05rem] lg:leading-[1.7]">
          We&apos;re a small, focused team of builders and language lovers
          building NARRO from scratch.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TEAM GRID — 2 members, centered on large screens                    */}
      {/* ------------------------------------------------------------------ */}
      <ul className="mx-auto mt-14 grid w-full max-w-4xl grid-cols-1 gap-14 sm:mt-16 sm:grid-cols-2 sm:gap-12 lg:mt-20 lg:gap-16 xl:gap-20">
        {TEAM.map((member, index) => (
          <li key={member.name} className="flex flex-col items-center text-center">
            {/* Portrait */}
            <figure className="flex w-full flex-col items-center">
              <div className="relative mx-auto w-full max-w-xs sm:max-w-[360px]">
                {/* Portrait frame — rounded, subtle muted bg behind the photo */}
                <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl bg-muted">
                  <Image
                    src={member.image}
                    alt={member.imageAlt}
                    fill
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    quality={85}
                    sizes="(max-width: 640px) 320px, (max-width: 1024px) 40vw, 360px"
                    className="scale-[1.01] object-cover object-top"
                  />
                </div>
              </div>

              {/* Caption — tighter spacing, cohesive block */}
              <figcaption className="mt-6 flex w-full max-w-xs flex-col items-center text-center sm:max-w-[360px]">
                {/* Role eyebrow */}
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  {member.role}
                </p>

                {/* Name */}
                <p className="mt-1.5 font-serif text-[1.35rem] font-semibold leading-[1.2] tracking-[-0.015em] text-foreground sm:text-[1.5rem]">
                  {member.name}
                </p>

                {/* Bio */}
                <p className=" max-w-[34ch] text-[0.925rem] leading-[1.6] text-muted-foreground sm:text-[0.95rem]">
                  {member.bio}
                </p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}