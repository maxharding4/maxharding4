import { Entry, EntryCollection } from "contentful";
import {
  CATEGORIES,
  getAllRecipes,
  getCategory,
  recipesInCategory,
  splitIngredients,
  splitMethodSteps,
} from "../cookbook";
import * as contentful from "@/lib/contentful";
import { RecipeSkeleton } from "@/types/contentful";

jest.mock("@/lib/contentful");

const mockGetEntriesByType = contentful.getEntriesByType as jest.MockedFunction<
  typeof contentful.getEntriesByType
>;

function mockRecipe(slug: string, category: string): Entry<RecipeSkeleton> {
  return {
    sys: { id: `id-${slug}` },
    fields: {
      title: slug,
      slug,
      category,
      ingredients: "a\nb",
      method: "step one\n\nstep two",
    },
  } as unknown as Entry<RecipeSkeleton>;
}

function asCollection(
  items: Entry<RecipeSkeleton>[]
): EntryCollection<RecipeSkeleton> {
  return {
    items,
    total: items.length,
    skip: 0,
    limit: 100,
    sys: { type: "Array" },
  } as unknown as EntryCollection<RecipeSkeleton>;
}

describe("CATEGORIES / getCategory", () => {
  it("defines the four fixed categories in display order", () => {
    expect(CATEGORIES.map((c) => c.slug)).toEqual([
      "mains",
      "sides",
      "snacks",
      "desserts",
    ]);
  });

  it("looks up a category by slug", () => {
    expect(getCategory("desserts")?.label).toBe("Desserts");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getCategory("starters")).toBeUndefined();
  });
});

describe("getAllRecipes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns recipes with recognised categories", async () => {
    mockGetEntriesByType.mockResolvedValue(
      asCollection([mockRecipe("lasagne", "mains"), mockRecipe("flapjack", "snacks")])
    );

    const recipes = await getAllRecipes();
    expect(recipes).toHaveLength(2);
  });

  it("skips recipes with an unknown category and warns", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    mockGetEntriesByType.mockResolvedValue(
      asCollection([mockRecipe("lasagne", "mains"), mockRecipe("mystery", "brunch")])
    );

    const recipes = await getAllRecipes();
    expect(recipes).toHaveLength(1);
    expect(recipes[0].fields.slug).toBe("lasagne");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('unknown category "brunch"')
    );
    warnSpy.mockRestore();
  });
});

describe("recipesInCategory", () => {
  it("partitions recipes by category", () => {
    const recipes = [
      mockRecipe("lasagne", "mains"),
      mockRecipe("flapjack", "snacks"),
      mockRecipe("carbonara", "mains"),
    ];

    expect(recipesInCategory(recipes, "mains").map((r) => r.fields.slug)).toEqual([
      "lasagne",
      "carbonara",
    ]);
    expect(recipesInCategory(recipes, "desserts")).toEqual([]);
  });
});

describe("splitIngredients", () => {
  it("splits one ingredient per line, dropping blanks and whitespace", () => {
    expect(splitIngredients("175g pasta\n  1 tsp olive oil  \n\n50g pancetta\n")).toEqual([
      "175g pasta",
      "1 tsp olive oil",
      "50g pancetta",
    ]);
  });
});

describe("splitMethodSteps", () => {
  it("splits steps on blank lines and unwraps internal newlines", () => {
    const method = "Boil the pasta\nuntil al dente.\n\nFry the pancetta.";
    expect(splitMethodSteps(method)).toEqual([
      "Boil the pasta until al dente.",
      "Fry the pancetta.",
    ]);
  });

  it("falls back to one step per line when there are no blank lines", () => {
    expect(splitMethodSteps("Boil the pasta.\nFry the pancetta.")).toEqual([
      "Boil the pasta.",
      "Fry the pancetta.",
    ]);
  });
});
