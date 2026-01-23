interface ExperienceCardProps {
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

// Helper function to format dates
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  } catch {
    return dateString;
  }
}

export default function ExperienceCard({
  title,
  subtitle,
  location,
  startDate,
  endDate,
  current,
  description,
  highlights,
  technologies,
  type,
}: ExperienceCardProps) {
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = endDate ? formatDate(endDate) : "Present";
  const displayEndDate = current ? "Present" : formattedEndDate;

  return (
    <article
      className={`rounded-lg border p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
        current ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
      }`}
      aria-label={`${type === "work" ? "Work experience" : "Education"}: ${title} at ${subtitle}`}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
          {title}
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-lg text-gray-700 font-medium">{subtitle}</p>
          {location && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {location}
            </p>
          )}
        </div>
      </div>

      {/* Date Range Badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            current
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <time dateTime={startDate}>{formattedStartDate}</time>
          <span className="mx-2">–</span>
          <time dateTime={endDate || ""}>{displayEndDate}</time>
        </span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-base text-gray-600 leading-relaxed mb-4">
          {description}
        </p>
      )}

      {/* Highlights (Achievements or Honors) */}
      {highlights && highlights.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {type === "work" ? "Key Achievements" : "Honors"}
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {highlights.map((highlight, index) => (
              <li
                key={`${highlight}-${index}`}
                className="text-sm text-gray-600"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technologies (Work experience only) */}
      {type === "work" && technologies && technologies.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Technologies
          </h4>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, index) => (
              <span
                key={`${tech}-${index}`}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
