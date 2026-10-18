import { AI_AGENTS } from "@/data/agents";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";


/* -------------------------------------------------------------------------- */
/*  Main Exported Section                                                      */
/* -------------------------------------------------------------------------- */
export function HomepageAgents() {
  return (
    <section className="pb-12 sm:pb-16 lg:pb-20">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-serif text-[32px] font-normal tracking-[-0.02em] text-foreground">
          Meet your AI teachers.
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {AI_AGENTS.map((agent) => (
          <div
            key={agent.id}
            className="group flex flex-col overflow-hidden rounded-[24px] border border-border/60 bg-card p-2 transition-all duration-200 hover:shadow-md"
          >
            {/* Image Section (Inset) */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-[18px] bg-muted">
              <Image
                src={agent.image}
                alt={`${agent.name} ${agent.role}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Sparkle Badge (Top Right) */}
              <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
              {/* Title & Flag */}
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-[22px] font-semibold text-foreground">
                  {agent.name} {agent.role}
                </h3>
                <span className="text-[18px]">{agent.emoji}</span>
              </div>

              {/* Description */}
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                {agent.description}
              </p>

              {/* Action Button */}
              <div className="mt-auto pt-6">
                <SignUpButton
                  mode="modal"
                  forceRedirectUrl={`/app/ai-learning`}
                  signInForceRedirectUrl={`/app/ai-learning`}
                >
                  <button className="flex h-11 w-full items-center justify-between rounded-full bg-[#6B4A3A] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#5a3d30]">
                    <span>Talk to {agent.name}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Browse All Link */}
      <div className="mt-8 flex justify-start">
        <a
          href="/ai-learning"
          className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-foreground transition-colors hover:text-[#6B4A3A]"
        >
          See all AI teachers
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}