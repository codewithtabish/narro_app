"use client";

import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  FAQ data — matches NARRO's actual product                                  */
/* -------------------------------------------------------------------------- */

type FAQ = {
  question: string;
  answer: string;
};

const FAQS: FAQ[] = [
  {
    question: "Is NARRO really free to start?",
    answer:
      "Yes. You can sign up in seconds and start speaking right away — no credit card required. Every free account includes 10 minutes of AI voice practice plus unlimited access to 1-to-1 calls, speaking rooms, and messaging with other learners.",
  },
  {
    question: "How does AI voice practice work?",
    answer:
      "NARRO's AI is a real-time voice partner, not a chatbot. You speak naturally, the AI listens and responds by voice, adapting to your level and topic. Sessions are private, judgment-free, and available 24/7. After each session, you get useful expressions, gentle corrections, and suggestions for what to practice next.",
  },
  {
    question: "Can I practice with real people?",
    answer:
      "Absolutely. NARRO is built for real conversations. You can start 1-to-1 voice calls with language partners, join live speaking rooms with multiple learners, and message anyone you've met to plan future practice. Every call is powered by LiveKit for reliable, low-latency audio.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "NARRO supports 40+ languages for AI voice practice, including English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Mandarin, Arabic, Hindi, Urdu, and more. Human partner calls and speaking rooms depend on which languages our community actively speaks — you can filter partners by both language and proficiency level.",
  },
  {
    question: "Can I practice without speaking to strangers?",
    answer:
      "Yes. AI voice practice is completely private — perfect for building confidence before you talk to humans. You can also set your profile to appear only to partners you've previously practiced with, and block anyone at any time. NARRO is designed to be a safe, encouraging space.",
  },
  {
    question: "How do you keep the community safe?",
    answer:
      "Every account is verified through Clerk authentication. You can block or report any user, calls between blocked users are prevented on the backend, and our moderation team reviews reports. Your messages and voice notes are private and never shared with other users without your consent.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. NARRO Pro is a flexible subscription — you can cancel anytime from your account settings. On mobile, subscriptions are managed through the App Store or Google Play. On the web, they're managed through our website. When you cancel, you keep Pro benefits until the end of your current billing period.",
  },
];

/* -------------------------------------------------------------------------- */
/*  FAQ Section                                                                */
/* -------------------------------------------------------------------------- */

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      data-slot="how-it-works-faq"
      aria-labelledby="faq-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
          FAQ
        </span>

        <h2
          id="faq-heading"
          className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
        >
          Questions, answered.
        </h2>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ACCORDION                                                           */}
      {/* ------------------------------------------------------------------ */}
      <ul className="mx-auto mt-12 flex w-full max-w-3xl flex-col gap-3 sm:mt-14">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          const buttonId = `faq-button-${index}`;

          return (
            <li
              key={faq.question}
              className={cn(
                "rounded-2xl bg-card shadow-sm ring-1 ring-border/60",
                "transition-shadow duration-200",
                isOpen && "shadow-md",
              )}
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className={cn(
                    "flex w-full items-center justify-between gap-4",
                    "rounded-2xl px-5 py-4 text-left sm:px-6 sm:py-5",
                    "transition-colors duration-200",
                    "hover:bg-primary/3",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-background",
                  )}
                >
                  <span className="text-sm font-medium text-foreground sm:text-[1rem]">
                    {faq.question}
                  </span>

                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex h-6 w-6 shrink-0 items-center justify-center",
                      "rounded-full transition-colors duration-200",
                      isOpen
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground",
                    )}
                  >
                    {isOpen ? (
                      <Minus className="h-3.5 w-3.5" strokeWidth={2.25} />
                    ) : (
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                    )}
                  </span>
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6 sm:text-[0.95rem]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}