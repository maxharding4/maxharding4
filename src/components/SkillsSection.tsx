interface SkillsSectionProps {
  skills: string[];
}

// Helper function to determine skill color based on keywords
function getSkillColor(skill: string): string {
  const skillLower = skill.toLowerCase();

  // Languages (blue)
  if (
    skillLower.includes("javascript") ||
    skillLower.includes("typescript") ||
    skillLower.includes("python") ||
    skillLower.includes("java") ||
    skillLower.includes("c++") ||
    skillLower.includes("c#") ||
    skillLower.includes("ruby") ||
    skillLower.includes("go") ||
    skillLower.includes("rust") ||
    skillLower.includes("php") ||
    skillLower.includes("swift") ||
    skillLower.includes("kotlin")
  ) {
    return "bg-blue-100 text-blue-800";
  }

  // Frameworks (green)
  if (
    skillLower.includes("react") ||
    skillLower.includes("next") ||
    skillLower.includes("vue") ||
    skillLower.includes("angular") ||
    skillLower.includes("svelte") ||
    skillLower.includes("node") ||
    skillLower.includes("express") ||
    skillLower.includes("django") ||
    skillLower.includes("flask") ||
    skillLower.includes("spring") ||
    skillLower.includes("laravel")
  ) {
    return "bg-green-100 text-green-800";
  }

  // Tools/Testing (purple)
  if (
    skillLower.includes("jest") ||
    skillLower.includes("selenium") ||
    skillLower.includes("cypress") ||
    skillLower.includes("git") ||
    skillLower.includes("docker") ||
    skillLower.includes("kubernetes") ||
    skillLower.includes("jenkins") ||
    skillLower.includes("mocha") ||
    skillLower.includes("chai") ||
    skillLower.includes("playwright") ||
    skillLower.includes("webpack") ||
    skillLower.includes("vite")
  ) {
    return "bg-purple-100 text-purple-800";
  }

  // Default (gray)
  return "bg-gray-100 text-gray-800";
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillColor(skill)}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
