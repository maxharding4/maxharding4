# Contentful Content Models

This document describes the content model structure for the personal website. These models should be created in your Contentful space to support the Home, CV/Resume, and Travel sections.

## Overview

The content architecture consists of the following main models:
- **Page**: General page content (Home, About, etc.)
- **CV/Resume**: Professional experience and credentials
- **Travel**: Countries, Cities, and Photos
- **Supporting Models**: Work Experience, Education, Contact Info

---

## 1. Page Content Model

General page content for Home and other static pages.

### Model ID
`page`

### Fields

| Field Name | Field ID | Type | Required | Unique | Validation | Description |
|------------|----------|------|----------|--------|------------|-------------|
| Title | `title` | Short text | Yes | No | Max 100 chars | Page title |
| Slug | `slug` | Short text | Yes | Yes | Lowercase, no spaces, max 50 chars | URL-friendly identifier (e.g., "home", "about") |
| Content | `content` | Rich text | No | No | - | Main page content with formatting |
| Meta Description | `metaDescription` | Short text | No | No | Max 160 chars | SEO meta description |
| Meta Keywords | `metaKeywords` | Short text | No | No | Max 255 chars | Comma-separated keywords for SEO |

### Display Field
`title`

### Sample Entry
```
Title: Home
Slug: home
Content: Welcome to my personal website...
Meta Description: Personal website of [Your Name] - Developer, Traveler, Creator
Meta Keywords: developer, software engineer, travel, photography
```

---

## 2. CV/Resume Content Model

Professional resume and credentials.

### Model ID
`cvResume`

### Fields

| Field Name | Field ID | Type | Required | Validation | Description |
|------------|----------|------|----------|------------|-------------|
| Full Name | `fullName` | Short text | Yes | Max 100 chars | Your full name |
| Headline | `headline` | Short text | Yes | Max 200 chars | Professional headline/tagline |
| Summary | `summary` | Long text | No | Max 1000 chars | Professional summary |
| Work Experience | `workExperience` | Reference (many) | No | Link to Work Experience | List of work experiences |
| Education | `education` | Reference (many) | No | Link to Education | Educational background |
| Skills | `skills` | Short text (list) | No | - | List of skills |
| Contact | `contact` | Reference (one) | No | Link to Contact Info | Contact information |

### Display Field
`fullName`

### Sample Entry
```
Full Name: Max Harding
Headline: Full-Stack Developer | Travel Enthusiast | Problem Solver
Summary: Experienced software engineer with a passion for...
Work Experience: [References to work experience entries]
Education: [References to education entries]
Skills: TypeScript, React, Next.js, Node.js, AWS
Contact: [Reference to contact info]
```

---

## 3. Country Content Model

Countries for the Travel section.

### Model ID
`country`

### Fields

| Field Name | Field ID | Type | Required | Unique | Validation | Description |
|------------|----------|------|----------|--------|------------|-------------|
| Name | `name` | Short text | Yes | No | Max 100 chars | Country/region name |
| Country Code | `countryCode` | Short text | No | Yes | ISO 3166-1 or ISO 3166-2 | Country code (e.g., "IT", "ES") or subdivision code (e.g., "GB-ENG", "GB-SCT") |
| Flag Image | `flagImage` | Media (Asset) | No | No | Image | Country/region flag |
| Description | `description` | Long text | No | No | Max 2000 chars | Country/region description |
| Slug | `slug` | Short text | Yes | Yes | Lowercase, no spaces | URL-friendly identifier (e.g., "england", "italy") |

### Display Field
`name`

### Sample Entries

**Whole Country Example:**
```
Name: Italy
Country Code: IT
Flag Image: [Italy flag image asset]
Description: A Mediterranean country known for its art, architecture, and cuisine...
Slug: italy
```

**Subdivision Example:**
```
Name: Scotland
Country Code: GB-SCT
Flag Image: [Scotland flag image asset]
Description: A country within the United Kingdom, known for its highlands, castles, and whisky...
Slug: scotland
```

### Country Code Guidelines

This field accepts two formats:

1. **Standard Country Codes (ISO 3166-1)**: For whole countries
   - Format: 2 uppercase letters (e.g., `IT`, `ES`, `FR`, `JP`)
   - Use when representing a country as a whole entity

2. **Subdivision Codes (ISO 3166-2)**: For regions/nations within countries
   - Format: Country code + hyphen + subdivision code (e.g., `GB-ENG`, `GB-SCT`, `GB-WLS`)
   - Use when representing specific regions or constituent countries
   - Common examples:
     - England: `GB-ENG`
     - Scotland: `GB-SCT`
     - Wales: `GB-WLS`
     - Northern Ireland: `GB-NIR`
     - Catalonia: `ES-CT`
     - California: `US-CA`

**Benefits of this approach:**
- Each entry has a unique identifier (required by Contentful)
- Follows international standards (ISO 3166-1 and ISO 3166-2)
- Flexible for both countries and subdivisions
- Works well with flag emoji and image systems

---

## 4. City Content Model

Cities within countries for the Travel section.

### Model ID
`city`

### Fields

| Field Name | Field ID | Type | Required | Unique | Validation | Description |
|------------|----------|------|----------|--------|------------|-------------|
| Name | `name` | Short text | Yes | No | Max 100 chars | City name |
| Country | `country` | Reference (one) | Yes | No | Link to Country | Parent country |
| Description | `description` | Long text | No | No | Max 2000 chars | City description |
| Slug | `slug` | Short text | Yes | Yes | Lowercase, no spaces | URL-friendly identifier (e.g., "tokyo") |
| Visit Date | `visitDate` | Date | No | No | - | Date you visited (optional) |

### Display Field
`name`

### Sample Entry
```
Name: Tokyo
Country: [Reference to Japan]
Description: The bustling capital of Japan, where tradition meets modernity...
Slug: tokyo
Visit Date: 2024-03-15
```

---

## 5. Photo Content Model

Travel photos associated with cities.

### Model ID
`photo`

### Fields

| Field Name | Field ID | Type | Required | Validation | Description |
|------------|----------|------|----------|------------|-------------|
| Title | `title` | Short text | No | Max 200 chars | Photo title |
| Image | `image` | Media (Asset) | Yes | Image | The photo file |
| City | `city` | Reference (one) | Yes | Link to City | Associated city |
| Caption | `caption` | Long text | No | Max 500 chars | Photo caption/description |
| Date Taken | `dateTaken` | Date | No | - | When the photo was taken |
| Alt Text | `altText` | Short text | Yes | Max 200 chars | Accessibility text describing the image |
| Display Order | `displayOrder` | Integer | No | - | Sort order for displaying photos (e.g., 1, 2, 3) |

### Display Field
`title` (fallback to `altText` if title is empty)

### Recommended Image Dimensions
- Minimum: 1200px width
- Recommended: 1920px width for high-quality display
- Aspect ratio: Flexible, but 16:9 or 4:3 recommended

### Sample Entry
```
Title: Shibuya Crossing at Night
Image: [Photo asset]
City: [Reference to Tokyo]
Caption: The famous Shibuya crossing illuminated by neon signs at night
Date Taken: 2024-03-16
Alt Text: Busy intersection with pedestrians crossing and bright neon signs
Display Order: 1
```

---

## Supporting Models

### 6. Work Experience

Professional work history entries.

### Model ID
`workExperience`

### Fields

| Field Name | Field ID | Type | Required | Description |
|------------|----------|------|----------|-------------|
| Company | `company` | Short text | Yes | Company name |
| Position | `position` | Short text | Yes | Job title |
| Start Date | `startDate` | Date | Yes | Employment start date |
| End Date | `endDate` | Date | No | Employment end date (empty if current) |
| Description | `description` | Long text | No | Role description |
| Achievements | `achievements` | Long text (list) | No | Key achievements and responsibilities |

### Display Field
`position` at `company`

---

### 7. Education

Educational background entries.

### Model ID
`education`

### Fields

| Field Name | Field ID | Type | Required | Description |
|------------|----------|------|----------|-------------|
| Institution | `institution` | Short text | Yes | School/university name |
| Degree | `degree` | Short text | Yes | Degree type (e.g., "Bachelor of Science") |
| Field | `field` | Short text | No | Field of study |
| Start Date | `startDate` | Date | Yes | Start date |
| End Date | `endDate` | Date | No | Graduation date |
| Description | `description` | Long text | No | Additional details, honors, etc. |

### Display Field
`degree` in `field`

---

### 8. Contact Info

Contact information.

### Model ID
`contactInfo`

### Fields

| Field Name | Field ID | Type | Required | Validation | Description |
|------------|----------|------|----------|------------|-------------|
| Email | `email` | Short text | Yes | Email format | Email address |
| Phone | `phone` | Short text | No | - | Phone number |
| Location | `location` | Short text | No | - | City/country |
| Social Links | `socialLinks` | JSON object | No | - | Social media links (LinkedIn, GitHub, Twitter, etc.) |

### Display Field
`email`

### Sample Entry
```json
{
  "email": "contact@example.com",
  "phone": "+1-555-0123",
  "location": "London, UK",
  "socialLinks": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "twitter": "https://twitter.com/username"
  }
}
```

---

## Setup Instructions

### Creating Content Models in Contentful

1. Log in to your Contentful space
2. Navigate to **Content model** in the top menu
3. Click **Add content type**
4. For each model above:
   - Enter the Model ID and name
   - Add all specified fields with their types and validations
   - Set the display field
   - Configure field validations (required, unique, format)
   - Save the content type

### Field Validation Rules

#### Required Validations
- Mark fields as required according to the tables above
- Set unique constraint on slug fields
- Validate email format for Contact Info email field
- Validate ISO country codes for Country countryCode field

#### Length Validations
- Apply maximum character limits as specified
- For meta descriptions: 160 characters (SEO best practice)
- For meta keywords: 255 characters

#### Format Validations
- Slug fields: lowercase, hyphen-separated (e.g., "my-page-slug")
- Country code: 2 uppercase letters (ISO 3166-1) OR country code + hyphen + subdivision (ISO 3166-2)
  - Examples: `IT`, `ES`, `GB-ENG`, `GB-SCT`, `US-CA`
- Email: standard email format validation

### Content Relationships

```
CV/Resume
├── Work Experience (many)
├── Education (many)
└── Contact Info (one)

Country
└── Cities (many, reverse reference)
    └── Photos (many, reverse reference)
```

---

## Sample Content Structure

### Complete CV Example

```
CV/Resume Entry:
  Full Name: "Jane Developer"
  Headline: "Senior Software Engineer | Open Source Contributor"
  Summary: "Passionate developer with 8+ years of experience..."

  Work Experience:
    - Company: "Tech Corp"
      Position: "Senior Software Engineer"
      Start Date: 2020-01-01
      End Date: (current)
      Description: "Leading development of cloud-native applications..."

    - Company: "Startup Inc"
      Position: "Full Stack Developer"
      Start Date: 2017-06-01
      End Date: 2019-12-31
      Description: "Built and maintained multiple web applications..."

  Education:
    - Institution: "University of Technology"
      Degree: "Bachelor of Science"
      Field: "Computer Science"
      Start Date: 2013-09-01
      End Date: 2017-05-31

  Skills: ["TypeScript", "React", "Node.js", "AWS", "Docker"]

  Contact:
    Email: "jane@example.com"
    Location: "San Francisco, CA"
    Social Links: {...}
```

### Complete Travel Example

```
Country: Japan
  Slug: japan
  Country Code: JP
  Description: "Island nation in East Asia..."

  Cities:
    - City: Tokyo
      Slug: tokyo
      Visit Date: 2024-03-15
      Description: "Japan's bustling capital city..."

      Photos:
        - Title: "Shibuya Crossing"
          Alt Text: "Busy pedestrian crossing in Shibuya"
          Display Order: 1

        - Title: "Tokyo Tower"
          Alt Text: "Red Tokyo Tower against blue sky"
          Display Order: 2
```

---

## Content Preview Configuration

If using Contentful's preview mode:

1. Navigate to **Settings → Content preview** in Contentful
2. Add preview URLs for each content type:
   - Page: `http://localhost:3000/preview/page/{entry.fields.slug}`
   - Country: `http://localhost:3000/preview/travel/{entry.fields.slug}`
   - City: `http://localhost:3000/preview/travel/{entry.fields.country.fields.slug}/{entry.fields.slug}`

3. Install the Contentful Preview app in your space
4. Configure preview tokens in your `.env.local`

---

## Best Practices

### Content Entry Guidelines

1. **Images**:
   - Upload high-quality images (minimum 1200px width)
   - Use descriptive filenames
   - Always provide alt text for accessibility
   - Optimize images before upload (WebP format recommended)

2. **Slugs**:
   - Keep them short and descriptive
   - Use hyphens, not underscores
   - All lowercase
   - No special characters

3. **SEO Fields**:
   - Write unique meta descriptions for each page
   - Keep meta descriptions under 160 characters
   - Include relevant keywords naturally

4. **Rich Text Content**:
   - Use semantic HTML (headings, lists, etc.)
   - Keep paragraphs concise
   - Include links where appropriate

### Validation Checklist

- [ ] All required fields are marked as required
- [ ] Unique constraints set on slug fields
- [ ] Character limits configured
- [ ] Display fields set for all models
- [ ] Content relationships properly configured
- [ ] Sample content entered for testing
- [ ] Preview URLs configured (optional)

---

## Content Model Documentation for Editors

### Quick Reference

**Creating a New Page**
1. Go to Content → Add entry → Page
2. Fill in title and slug (must be unique)
3. Add your content using the rich text editor
4. Add meta description for SEO
5. Publish

**Adding Travel Content**
1. Start with Country (if not already created)
2. Add City and link to Country
3. Add Photos and link to City
4. Set display order on photos for gallery sorting

**Updating CV**
1. Edit the CV/Resume entry
2. Add new Work Experience or Education entries separately
3. Link them to the CV entry
4. Update skills list as needed

---

## Future Enhancements

Consider adding these fields for future blog functionality:
- `publishedDate` (Date) - When content was published
- `author` (Reference) - Content author
- `tags` (Short text, list) - Content categorization
- `featured` (Boolean) - Mark content as featured
- `seoImage` (Media) - Social sharing image

---

## Need Help?

- [Contentful Documentation](https://www.contentful.com/developers/docs/)
- [Content Modeling Guide](https://www.contentful.com/help/content-modelling-basics/)
- [Contentful API Reference](https://www.contentful.com/developers/docs/references/content-delivery-api/)
