"use client";

import { useState } from "react";
import { Entry } from "contentful";
import { CountrySkeleton } from "@/types/contentful";
import CountryCard from "@/components/CountryCard";
import SearchBox from "@/components/SearchBox";

interface TravelPageClientProps {
  countries: Entry<CountrySkeleton>[];
}

export default function TravelPageClient({
  countries,
}: TravelPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter countries based on search query
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredCountries = trimmedQuery
    ? countries.filter((country) => {
        const name = country.fields.name as unknown as string | undefined;
        if (!name) return false;
        return name.toLowerCase().includes(trimmedQuery);
      })
    : countries;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Travel Gallery
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore my adventures around the world. Click on a country to see
            photos and stories from my travels.
          </p>
        </header>

        {/* Search Box */}
        {countries.length > 0 && (
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
                  Showing {filteredCountries.length} of {countries.length}{" "}
                  {countries.length === 1 ? "country" : "countries"}
                </>
              )}
            </p>
          </div>
        )}

        {/* Countries Grid */}
        {countries.length > 0 ? (
          filteredCountries.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCountries.map((country: Entry<CountrySkeleton>) => (
                <CountryCard key={country.sys.id} country={country} />
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

        {/* Country Count */}
        {countries.length > 0 && !searchQuery && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              {countries.length}{" "}
              {countries.length === 1 ? "country" : "countries"} visited
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
