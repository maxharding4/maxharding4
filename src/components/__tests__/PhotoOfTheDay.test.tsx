/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import React from 'react';
import PhotoOfTheDay, {
  PhotoOfTheDayCity,
  pickForDay,
} from '../PhotoOfTheDay';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-fill={fill ? 'true' : 'false'} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
    'aria-label': ariaLabel,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    'aria-label'?: string;
  }) => (
    <a href={href} className={className} aria-label={ariaLabel} {...props}>
      {children}
    </a>
  ),
}));

// A single city with one titled photo: with one (city, photo) pair the daily
// index is always 0, so the component's pick is deterministic regardless of
// the current date — letting us assert exact rendering.
const barcelona: PhotoOfTheDayCity = {
  cityName: 'Barcelona',
  citySlug: 'barcelona',
  cityDescription: 'A wonderful city',
  countryName: 'Spain',
  countrySlug: 'spain',
  photos: [
    { url: 'https://images.ctfassets.net/photo1.jpg', title: 'Sunset over Barcelona' },
  ],
};

// A single city with one untitled photo and no description.
const paris: PhotoOfTheDayCity = {
  cityName: 'Paris',
  citySlug: 'paris',
  countryName: 'France',
  countrySlug: 'france',
  photos: [{ url: 'https://images.ctfassets.net/paris1.jpg' }],
};

// Multi-photo fixture for the pure-selection unit tests.
const mockCities: PhotoOfTheDayCity[] = [
  {
    ...barcelona,
    photos: [
      { url: 'https://images.ctfassets.net/photo1.jpg', title: 'Sunset over Barcelona' },
      { url: 'https://images.ctfassets.net/photo2.jpg', title: 'Barcelona streets' },
    ],
  },
  paris,
];

describe('PhotoOfTheDay', () => {
  describe('Empty state', () => {
    it('renders null when cities is an empty array', () => {
      const { container } = render(<PhotoOfTheDay cities={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders null when the only city has no valid photos', () => {
      // Mirrors the server-side guard in the page: cities whose photos all had
      // undefined file URLs arrive with an empty photos array.
      const broken: PhotoOfTheDayCity[] = [
        {
          cityName: 'Broken City',
          citySlug: 'broken-city',
          countryName: 'Nowhere',
          countrySlug: 'nowhere',
          photos: [],
        },
      ];
      const { container } = render(<PhotoOfTheDay cities={broken} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Rendering with valid data', () => {
    it('renders the section heading', async () => {
      render(<PhotoOfTheDay cities={[barcelona]} />);
      await screen.findByRole('heading', { level: 2, name: 'Photo of the Day' });
    });

    it('renders the image with alt text from the photo title', async () => {
      render(<PhotoOfTheDay cities={[barcelona]} />);
      expect(
        await screen.findByRole('img', { name: 'Sunset over Barcelona' })
      ).toBeInTheDocument();
    });

    it('renders the city and country name in the caption', async () => {
      render(<PhotoOfTheDay cities={[barcelona]} />);
      await screen.findByText('Barcelona, Spain');
    });

    it('renders the city description when present', async () => {
      render(<PhotoOfTheDay cities={[barcelona]} />);
      expect(await screen.findByText('A wonderful city')).toBeInTheDocument();
    });

    it('does not render a description when absent', async () => {
      render(<PhotoOfTheDay cities={[paris]} />);
      await screen.findByText('Paris, France');
      expect(screen.queryByText('A wonderful city')).not.toBeInTheDocument();
    });

    it('links to the correct city detail page', async () => {
      render(<PhotoOfTheDay cities={[barcelona]} />);
      const link = await screen.findByRole('link', {
        name: /View photos of Barcelona, Spain/i,
      });
      expect(link).toHaveAttribute('href', '/travel/spain/barcelona');
    });

    it('image uses the correct src URL', async () => {
      render(<PhotoOfTheDay cities={[barcelona]} />);
      expect(await screen.findByRole('img')).toHaveAttribute(
        'src',
        'https://images.ctfassets.net/photo1.jpg'
      );
    });

    it('image has a responsive sizes attribute', async () => {
      render(<PhotoOfTheDay cities={[barcelona]} />);
      expect(await screen.findByRole('img')).toHaveAttribute(
        'sizes',
        '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 768px'
      );
    });

    it('image uses fill layout', async () => {
      render(<PhotoOfTheDay cities={[barcelona]} />);
      expect(await screen.findByRole('img')).toHaveAttribute('data-fill', 'true');
    });
  });

  describe('Alt text fallback', () => {
    it('falls back to the city name when the photo title is absent', async () => {
      render(<PhotoOfTheDay cities={[paris]} />);
      expect(
        await screen.findByRole('img', { name: 'Photo of Paris' })
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('link has focus ring classes for keyboard navigation', async () => {
      render(<PhotoOfTheDay cities={[barcelona]} />);
      const link = await screen.findByRole('link');
      expect(link.className).toContain('focus:ring-2');
      expect(link.className).toContain('focus:ring-blue-500');
      expect(link.className).toContain('focus:ring-offset-2');
    });
  });

  describe('Security', () => {
    it('uses HTTPS protocol for image URLs', async () => {
      render(<PhotoOfTheDay cities={[barcelona]} />);
      expect((await screen.findByRole('img')).getAttribute('src')).toMatch(/^https:/);
    });
  });

  describe('pickForDay (daily-stable selection)', () => {
    it('returns null when there are no photos', () => {
      expect(pickForDay([], new Date(2024, 0, 15))).toBeNull();
      expect(
        pickForDay(
          [{ ...paris, photos: [] }],
          new Date(2024, 0, 15)
        )
      ).toBeNull();
    });

    it('returns the same photo for different times on the same local day', () => {
      const morning = pickForDay(mockCities, new Date(2024, 0, 15, 9, 0, 0));
      const evening = pickForDay(mockCities, new Date(2024, 0, 15, 21, 30, 0));
      expect(morning).not.toBeNull();
      expect(morning!.photo.url).toBe(evening!.photo.url);
    });

    it('shows a different city on consecutive days', () => {
      const a = pickForDay(mockCities, new Date(2024, 0, 15));
      const b = pickForDay(mockCities, new Date(2024, 0, 16));
      expect(a!.city.citySlug).not.toBe(b!.city.citySlug);
    });

    it('advances the photo within a city across the days it appears', () => {
      // A single city (Barcelona, two photos): it appears every day, so
      // consecutive days must surface different photos.
      const single = [mockCities[0]];
      const a = pickForDay(single, new Date(2024, 0, 15));
      const b = pickForDay(single, new Date(2024, 0, 16));
      expect(a!.photo.url).not.toBe(b!.photo.url);
    });

    it('selection is independent of input city ordering', () => {
      const date = new Date(2024, 0, 15);
      const a = pickForDay(mockCities, date);
      const b = pickForDay([...mockCities].reverse(), date);
      expect(a!.photo.url).toBe(b!.photo.url);
    });
  });
});
