import { getEntriesByType } from "@/lib/contentful";
import {
  CVResumeSkeleton,
  WorkExperienceSkeleton,
  EducationSkeleton,
} from "@/types/contentful";
import { Entry } from "contentful";
import Timeline, { TimelineItem } from "@/components/Timeline";
import SkillsSection from "@/components/SkillsSection";
import ContactInfo from "@/components/ContactInfo";
import PrintButton from "@/components/PrintButton";
import Image from "next/image";
import { Metadata } from "next";

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  try {
    const cvData = await getEntriesByType<CVResumeSkeleton>("cvResume", {
      "fields.slug": "main",
      limit: 1,
    });

    const cv = cvData.items[0];
    const fullName =
      (cv?.fields.fullName as unknown as string) || "Max Harding";
    const title =
      (cv?.fields.professionalTitle as unknown as string) ||
      "Lead QA Engineer";
    const bio = (cv?.fields.bio as unknown as string) || "";

    const description =
      bio.split(".")[0] + "." ||
      "Professional CV and work experience of Max Harding";

    const profilePhoto = cv?.fields.profilePhoto;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ogImageUrl = (profilePhoto as any)?.fields?.file?.url as
      | string
      | undefined;

    return {
      title: `${fullName} - CV & Resume`,
      description,
      openGraph: {
        title: `${fullName} - ${title}`,
        description,
        url: "/cv",
        type: "profile",
        ...(ogImageUrl && {
          images: [
            {
              url: `https:${ogImageUrl}`,
              width: 1200,
              height: 630,
              alt: fullName,
            },
          ],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title: `${fullName} - ${title}`,
        description,
        ...(ogImageUrl && {
          images: [`https:${ogImageUrl}`],
        }),
      },
    };
  } catch (error) {
    console.error("Error generating CV metadata:", error);
    return {
      title: "Max Harding - CV & Resume",
      description: "Professional CV and work experience",
    };
  }
}

// Main page component
export default async function CVPage() {
  // Fetch CV data with fallback
  let fullName = "Max Harding";
  let professionalTitle = "Lead QA Engineer & Travel Photographer";
  let bio =
    "Experienced professional with expertise in quality assurance and travel photography.";
  let profilePhoto;
  let skills: string[] = [];
  let allItems: TimelineItem[] = [];
  let contactInfo = {
    email: undefined as string | undefined,
    phone: undefined as string | undefined,
    location: undefined as string | undefined,
    linkedin: undefined as string | undefined,
    github: undefined as string | undefined,
    website: undefined as string | undefined,
  };

  try {
    const cvData = await getEntriesByType<CVResumeSkeleton>("cvResume", {
      "fields.slug": "main",
      limit: 1,
      include: 2, // Include linked entries (work experience, education)
    });

    const cv = cvData.items[0];

    if (cv) {
      fullName = (cv.fields.fullName as unknown as string) || fullName;
      professionalTitle =
        (cv.fields.professionalTitle as unknown as string) || professionalTitle;
      bio = (cv.fields.bio as unknown as string) || bio;
      profilePhoto = cv.fields.profilePhoto;
      skills = (cv.fields.skills as unknown as string[]) || [];

      // Transform work experience
      const workExperience =
        (cv.fields.workExperience as unknown as Entry<WorkExperienceSkeleton>[]) ||
        [];
      const workItems: TimelineItem[] = workExperience.map((exp) => ({
        id: exp.sys.id,
        type: "work" as const,
        title: (exp.fields.jobTitle as unknown as string) || "",
        subtitle: (exp.fields.company as unknown as string) || "",
        location: exp.fields.location as unknown as string | undefined,
        startDate: (exp.fields.startDate as unknown as string) || "",
        endDate: exp.fields.endDate as unknown as string | undefined,
        current: (exp.fields.currentRole as unknown as boolean) || false,
        description: exp.fields.description as unknown as string | undefined,
        highlights: (exp.fields.achievements as unknown as string[]) || [],
        technologies: (exp.fields.technologies as unknown as string[]) || [],
      }));

      // Transform education
      const education =
        (cv.fields.education as unknown as Entry<EducationSkeleton>[]) || [];
      const educationItems: TimelineItem[] = education.map((edu) => {
        const degree = (edu.fields.degree as unknown as string) || "";
        const field = (edu.fields.fieldOfStudy as unknown as string) || "";
        return {
          id: edu.sys.id,
          type: "education" as const,
          title: `${degree} in ${field}`,
          subtitle: (edu.fields.institution as unknown as string) || "",
          location: edu.fields.location as unknown as string | undefined,
          startDate: (edu.fields.startDate as unknown as string) || "",
          endDate: edu.fields.endDate as unknown as string | undefined,
          current: (edu.fields.current as unknown as boolean) || false,
          description: edu.fields.description as unknown as string | undefined,
          highlights: (edu.fields.honors as unknown as string[]) || [],
        };
      });

      // Combine and sort by date (most recent first)
      allItems = [...workItems, ...educationItems].sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB.getTime() - dateA.getTime();
      });

      // Extract contact info
      contactInfo = {
        email: cv.fields.email as unknown as string | undefined,
        phone: cv.fields.phone as unknown as string | undefined,
        location: cv.fields.location as unknown as string | undefined,
        linkedin: cv.fields.linkedin as unknown as string | undefined,
        github: cv.fields.github as unknown as string | undefined,
        website: cv.fields.website as unknown as string | undefined,
      };
    }
  } catch (error) {
    console.error("Error fetching CV data:", error);
  }

  // Structured data
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName,
    jobTitle: professionalTitle,
    description: bio,
    email: contactInfo.email,
    telephone: contactInfo.phone,
    url: contactInfo.website,
    address: contactInfo.location
      ? {
          "@type": "PostalAddress",
          addressLocality: contactInfo.location,
        }
      : undefined,
    sameAs: [contactInfo.linkedin, contactInfo.github].filter(Boolean),
  };

  // Profile photo URL
  const profilePhotoUrl = profilePhoto
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? `https:${(profilePhoto as any)?.fields?.file?.url}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Person Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-5xl">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Profile Photo */}
            {profilePhotoUrl && (
              <div className="relative w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
                <Image
                  src={profilePhotoUrl}
                  alt={fullName}
                  fill
                  className="rounded-full object-cover border-4 border-gray-200"
                  priority
                />
              </div>
            )}

            {/* Name and Title */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-2">
                {fullName}
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-600 font-light mb-4">
                {professionalTitle}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                {bio}
              </p>
            </div>
          </div>
        </header>

        {/* Contact Information */}
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Contact
          </h2>
          <ContactInfo {...contactInfo} />
        </section>

        {/* Work Experience & Education Timeline */}
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Experience & Education
          </h2>
          <Timeline items={allItems} />
        </section>

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Skills
            </h2>
            <SkillsSection skills={skills} />
          </section>
        )}

        {/* Print Button */}
        <PrintButton />
      </div>
    </div>
  );
}
