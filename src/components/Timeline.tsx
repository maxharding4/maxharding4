"use client";

import ExperienceCard from "./ExperienceCard";

export interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
  technologies?: string[];
  type: "work" | "education";
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No experience or education listed yet.</p>
      </div>
    );
  }

  return (
    <nav aria-label="Professional timeline">
      <ol className="relative border-l-2 border-gray-200 ml-4 lg:ml-0 lg:border-l-0 space-y-8">
        {items.map((item) => (
          <li
            key={item.id}
            className="relative pl-8 lg:pl-0"
          >
            {/* Timeline dot */}
            <div className="absolute left-0 -translate-x-1/2 lg:left-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white" />

            {/* Experience Card */}
            <div className="lg:w-[calc(50%-2rem)]">
              <ExperienceCard
                title={item.title}
                subtitle={item.subtitle}
                location={item.location}
                startDate={item.startDate}
                endDate={item.endDate}
                current={item.current}
                description={item.description}
                highlights={item.highlights}
                technologies={item.technologies}
                type={item.type}
              />
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
