# Header/Footer Specification (Current Reference)

This file is a reference for navigation structure expectations. Actual production behavior is controlled by JSON navigation maps and header/footer components.

## Source-of-truth implementation
- Data: `content/cms/navigation-map/<locale>.json`
- Header renderer: `components/site-header.tsx`
- Footer renderer: `components/site-footer.tsx`

## Functional requirements
- Locale-aware internal links
- Complete menu coverage for primary content domains
- Mobile and desktop navigability
- Stable IDs for nav entries to preserve references

## Change procedure
1. Update navigation map JSON.
2. Validate route/link integrity (`npm run test`, `npm run cms:validate`).
3. Run full build and QA.

## Note
Older wireframe-only link lists are superseded by the live navigation-map contract and should not be treated as source of truth.
