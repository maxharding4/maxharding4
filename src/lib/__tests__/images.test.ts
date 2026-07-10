/**
 * getContentfulImageSrc resolves Contentful asset URLs and honours the
 * NEXT_PUBLIC_USE_PLACEHOLDER_IMAGES toggle. Because the toggle is read once at
 * module load, the placeholder-mode cases re-import the module with the env var set.
 */
describe("getContentfulImageSrc", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe("normal mode (toggle off)", () => {
    it("prefixes a protocol-relative Contentful URL with https:", async () => {
      const { getContentfulImageSrc } = await import("../images");
      expect(
        getContentfulImageSrc("//images.ctfassets.net/space/photo.jpg")
      ).toBe("https://images.ctfassets.net/space/photo.jpg");
    });

    it("leaves an already-absolute URL untouched", async () => {
      const { getContentfulImageSrc } = await import("../images");
      expect(getContentfulImageSrc("https://example.com/a.jpg")).toBe(
        "https://example.com/a.jpg"
      );
    });

    it("falls back to the placeholder when no URL is provided", async () => {
      const { getContentfulImageSrc, PLACEHOLDER_IMAGE_SRC } = await import(
        "../images"
      );
      expect(getContentfulImageSrc(undefined)).toBe(PLACEHOLDER_IMAGE_SRC);
      expect(getContentfulImageSrc(null)).toBe(PLACEHOLDER_IMAGE_SRC);
      expect(getContentfulImageSrc("")).toBe(PLACEHOLDER_IMAGE_SRC);
    });

    it("appends Images-API params for a Contentful URL", async () => {
      const { getContentfulImageSrc } = await import("../images");
      const src = getContentfulImageSrc(
        "//images.ctfassets.net/space/photo.jpg",
        { width: 600, quality: 55, format: "webp" }
      );
      expect(src).toBe(
        "https://images.ctfassets.net/space/photo.jpg?w=600&q=55&fm=webp"
      );
    });

    it("does not append params to a non-Contentful URL", async () => {
      const { getContentfulImageSrc } = await import("../images");
      expect(
        getContentfulImageSrc("https://example.com/a.jpg", { width: 600 })
      ).toBe("https://example.com/a.jpg");
    });

    it("returns the bare URL when no transform is given", async () => {
      const { getContentfulImageSrc } = await import("../images");
      expect(
        getContentfulImageSrc("//images.ctfassets.net/space/photo.jpg")
      ).toBe("https://images.ctfassets.net/space/photo.jpg");
    });
  });

  describe("placeholder mode (toggle on)", () => {
    it("returns the placeholder for every real Contentful URL", async () => {
      process.env.NEXT_PUBLIC_USE_PLACEHOLDER_IMAGES = "true";
      const { getContentfulImageSrc, PLACEHOLDER_IMAGE_SRC } = await import(
        "../images"
      );
      expect(
        getContentfulImageSrc("//images.ctfassets.net/space/photo.jpg")
      ).toBe(PLACEHOLDER_IMAGE_SRC);
      expect(getContentfulImageSrc("https://example.com/a.jpg")).toBe(
        PLACEHOLDER_IMAGE_SRC
      );
      // Transform params are ignored in placeholder mode.
      expect(
        getContentfulImageSrc("//images.ctfassets.net/space/photo.jpg", {
          width: 600,
          format: "webp",
        })
      ).toBe(PLACEHOLDER_IMAGE_SRC);
    });
  });
});
