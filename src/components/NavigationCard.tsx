import Link from "next/link";

interface NavigationCardProps {
  title: string;
  description: string;
  href: string;
  gradient?: string;
}

export default function NavigationCard({
  title,
  description,
  href,
  gradient = "from-gray-50 to-gray-100",
}: NavigationCardProps) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <article
        className={`relative p-6 bg-gradient-to-br ${gradient} h-full flex flex-col justify-between min-h-[160px]`}
      >
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-base text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
          <span>Explore</span>
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </article>
    </Link>
  );
}
