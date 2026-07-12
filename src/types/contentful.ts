import { Asset, Entry, EntrySkeletonType } from "contentful";

/**
 * Contentful Content Type Interfaces
 * These match the content models defined in Contentful
 */

// Country Content Type
export interface CountryFields {
  name?: string;
  slug?: string;
  countryCode?: string;
  flagImage?: Asset;
  description?: string;
  cities?: Entry<CitySkeleton>[];
}

export type CountrySkeleton = EntrySkeletonType<CountryFields, "country">;

// City Content Type
export interface CityFields {
  name: string;
  slug: string;
  country: Entry<CountrySkeleton>;
  description?: string;
  visitDate?: string;
  photos?: Asset[];
}

export type CitySkeleton = EntrySkeletonType<CityFields, "city">;

// Photo Content Type
// @deprecated - Photos are now stored directly as assets in City.photos field
// This type is kept for backwards compatibility but should not be used in new code
export interface PhotoFields {
  title: string;
  image: Asset;
  description?: string;
  captureDate?: string;
  location?: string;
  city?: Entry<CitySkeleton>;
  tags?: string[];
}

export type PhotoSkeleton = EntrySkeletonType<PhotoFields, "photo">;

// Recipe Content Type
// Categories are a fixed dropdown on the entry (validated in Contentful);
// category pages are defined in code — see src/lib/cookbook.ts.
export type RecipeCategory = "mains" | "sides" | "snacks" | "desserts";

export interface RecipeFields {
  title: string;
  slug: string;
  category: RecipeCategory;
  description?: string;
  image?: Asset;
  /** One ingredient per line */
  ingredients: string;
  /** One step per paragraph (blank-line separated) */
  method: string;
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
}

export type RecipeSkeleton = EntrySkeletonType<RecipeFields, "recipe">;

// Page Content Type
export interface PageFields {
  title: string;
  slug: string;
  content: unknown; // Rich text field - Contentful document type
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: Asset;
}

export type PageSkeleton = EntrySkeletonType<PageFields, "page">;

// CV/Resume Content Type
export interface CVResumeFields {
  fullName: string;
  slug: string;
  professionalTitle: string;
  bio: unknown; // Rich text field - Contentful document type
  profilePhoto?: Asset;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  skills?: string[];
  workExperience?: Entry<WorkExperienceSkeleton>[];
  education?: Entry<EducationSkeleton>[];
}

export type CVResumeSkeleton = EntrySkeletonType<CVResumeFields, "cvResume">;

// Work Experience Content Type
export interface WorkExperienceFields {
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  currentRole?: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
}

export type WorkExperienceSkeleton = EntrySkeletonType<
  WorkExperienceFields,
  "workExperience"
>;

// Education Content Type
export interface EducationFields {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  honors?: string[];
  description?: string;
}

export type EducationSkeleton = EntrySkeletonType<EducationFields, "education">;
