"use client";

import { useState } from "react";
import { Entry } from "contentful";
import { CountrySkeleton } from "@/types/contentful";
import CountryCard from "@/components/CountryCard";
import SearchBox from "@/components/SearchBox";

interface CountryWithCityCount {
  country: Entry<CountrySkeleton>;
  cityCount: number;
}

interface TravelPageClientProps {
  countriesWithCityCounts: CountryWithCityCount[];
}

export default function TravelPageClient({
  countriesWithCityCounts,
}: TravelPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter countries based on search query
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredCountries = trimmedQuery
    ? countriesWithCityCounts.filter(({ country }) => {
        const name = country.fields.name as unknown as string | undefined;
        if (!name) return false;
        return name.toLowerCase().includes(trimmedQuery);
      })
    : countriesWithCityCounts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 pt-12 sm:pt-16 pb-12 sm:px-6 lg:px-8">
        {/* Page Header */}
        <header className="mb-12 text-center">
          <h1 className="heading-hero text-gray-900">
            Travel Gallery
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore my adventures around the world. Click on a country to see
            photos and stories from my travels.
          </p>
          {countriesWithCityCounts.length > 0 && !searchQuery && (
            <p className="mt-2 text-sm text-gray-500">
              {countriesWithCityCounts.length}{" "}
              {countriesWithCityCounts.length === 1 ? "country" : "countries"}{" "}
              visited, and counting...
            </p>
          )}
        </header>

        {/* Search Box */}
        {countriesWithCityCounts.length > 0 && (
          <div className="mb-8">
            <SearchBox
              placeholder="Search countries..."
              ariaLabel="Search countries by name"
              onSearch={handleSearch}
            />
          </div>
        )}

        {/* Results Count */}
        {searchQuery && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">
              {filteredCountries.length === 0 ? (
                "No countries match your search"
              ) : (
                <>
                  Showing {filteredCountries.length} of{" "}
                  {countriesWithCityCounts.length}{" "}
                  {countriesWithCityCounts.length === 1
                    ? "country"
                    : "countries"}
                </>
              )}
            </p>
          </div>
        )}

        {/* Countries Grid */}
        {countriesWithCityCounts.length > 0 ? (
          filteredCountries.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCountries.map(({ country, cityCount }) => (
                <CountryCard
                  key={country.sys.id}
                  country={country}
                  cityCount={cityCount}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No countries match &quot;{searchQuery}&quot;. Try a different
                search term.
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No countries available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
