# Navigation Map Reference

Navigation is fully data-driven.

## Source of truth files
- `content/cms/navigation-map/en.json`
- `content/cms/navigation-map/es.json`
- `content/cms/navigation-map/pt.json`

## Consumer code
- Loader: `lib/navigation-map-content.ts`
- Header: `components/site-header.tsx`
- Footer: `components/site-footer.tsx`

## Registry item contract
Each item should provide:
- `id`
- `menu_group`
- `label`
- `href`
- `route_type`
- `template_family`
- `status`

## Menu groups currently used
- `top_bar`
- `main_menu`
- `brazil`
- `about_us`
- `process`
- `services`
- `insights`
- `footer_immigration`
- `footer_brazil`
- `footer_resources`
- `footer_firm`
- `footer_legal`

## Template families
- `hub`
- `long_form_guide`
- `service_detail`
- `profile_story`
- `process_compliance`
- `conversion_contact`
- `legal_policy`

## Editing rules
1. Keep IDs stable when only label/href changes.
2. Use locale-aware paths (`/{locale}/...`) or route builders where expected.
3. Run `npm run test` and `npm run cms:validate` after nav changes.
