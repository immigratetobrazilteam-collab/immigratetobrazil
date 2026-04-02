(function () {
  function qs(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || "";
  }

  function ensureHidden(form, name, value) {
    let input = form.querySelector(`input[name="${name}"]`);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function setupForm(form) {
    const referrer = document.referrer || "";
    const pageCountry =
      form.getAttribute("data-country-audience") ||
      document.body.getAttribute("data-country-audience") ||
      "";
    const pageHub =
      form.getAttribute("data-hub") ||
      document.body.getAttribute("data-hub") ||
      qs("hub") ||
      "";
    const pageSubHub =
      form.getAttribute("data-sub-hub") ||
      document.body.getAttribute("data-sub-hub") ||
      qs("sub_hub") ||
      "";
    const sourceType =
      form.getAttribute("data-source-type") ||
      (pageCountry ? "country-landing" : qs("source_type")) ||
      "";
    const locale = (document.documentElement.getAttribute("lang") || "en").slice(0, 2);
    const subjectInput = form.querySelector('input[name="_subject"]');
    const selectedArea =
      (form.querySelector('[name="area"]') || {}).value || qs("service") || "";

    ensureHidden(form, "lead_stage", "new_lead");
    ensureHidden(form, "lead_source", qs("source") || "website_form");
    ensureHidden(form, "lead_service", selectedArea);
    ensureHidden(form, "lead_page_path", window.location.pathname);
    ensureHidden(form, "lead_page_url", window.location.href);
    ensureHidden(form, "lead_referrer", referrer);
    ensureHidden(form, "utm_source", qs("utm_source"));
    ensureHidden(form, "utm_medium", qs("utm_medium"));
    ensureHidden(form, "utm_campaign", qs("utm_campaign"));
    ensureHidden(form, "utm_content", qs("utm_content"));
    ensureHidden(form, "utm_term", qs("utm_term"));
    ensureHidden(form, "submitted_at_iso", new Date().toISOString());
    ensureHidden(form, "country_audience", pageCountry || qs("country"));
    ensureHidden(form, "source_page", window.location.pathname);
    ensureHidden(form, "hub", pageHub);
    ensureHidden(form, "sub_hub", pageSubHub);
    ensureHidden(form, "locale", locale);
    ensureHidden(form, "source_type", sourceType);

    const syncSubject = () => {
      const formTitle = form.getAttribute("data-form-title") || document.title || "New legal inquiry";
      const explicitCountry = pageCountry || qs("country");
      const areaSelect = form.querySelector('[name="area"]');
      const subjectSelect = form.querySelector('[data-formspree-subject-source]');
      const areaValue =
        (subjectSelect && subjectSelect.value) ||
        (areaSelect && areaSelect.value) ||
        selectedArea ||
        "";
      const parts = [formTitle];
      if (explicitCountry) parts.push(explicitCountry);
      if (areaValue) parts.push(areaValue);
      ensureHidden(form, "_subject", parts.join(": "));
    };

    const areaSelect = form.querySelector('[name="area"]');
    if (areaSelect) {
      areaSelect.addEventListener("change", function () {
        ensureHidden(form, "lead_service", areaSelect.value || "");
        syncSubject();
      });
    }

    const subjectSelect = form.querySelector('[data-formspree-subject-source]');
    if (subjectSelect) {
      subjectSelect.addEventListener("change", syncSubject);
    }

    if (subjectInput || form.getAttribute("data-form-title") || pageCountry) {
      syncSubject();
    }

    form.addEventListener("submit", function () {
      const now = new Date();
      const leadId = `MF-LEAD-${now.getUTCFullYear()}-${Math.floor(
        now.getTime() / 1000
      )}-${Math.floor(Math.random() * 900 + 100)}`;
      const selected = (form.querySelector('[name="area"]') || {}).value || "";
      ensureHidden(form, "lead_id", leadId);
      ensureHidden(form, "lead_service", selected);
      ensureHidden(form, "lead_service_slug", slugify(selected));
      ensureHidden(form, "submitted_at_iso", now.toISOString());
      ensureHidden(form, "country_audience", pageCountry || qs("country"));
      ensureHidden(form, "source_page", window.location.pathname);
      ensureHidden(form, "hub", pageHub);
      ensureHidden(form, "sub_hub", pageSubHub);
      ensureHidden(form, "locale", locale);
      ensureHidden(form, "source_type", sourceType);
      syncSubject();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const forms = Array.from(document.querySelectorAll("form[action*='formspree.io']"));
    forms.forEach(setupForm);
  });
})();
