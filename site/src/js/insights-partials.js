/* Shared partial loader for insights templates and hub pages. */
(() => {
  'use strict';

  function tokenFromDatasetKey(key) {
    return `{{${key.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase()}}}`;
  }

  function applyTemplateTokens(html, dataset) {
    let output = html;
    Object.entries(dataset || {}).forEach(([key, value]) => {
      if (!value) return;
      output = output.split(tokenFromDatasetKey(key)).join(String(value));
    });
    const today = new Date().toISOString().slice(0, 10);
    output = output.split('{{CURRENT_DATE}}').join(today);
    output = output.split('{{HUB_URL}}').join('/legal-knowledge-center.html');
    output = output.split('{{SERVICE_URL}}').join('/services.html');
    output = output.split('{{TOPIC}}').join('this topic');
    output = output.split('{{TOPIC_SLUG}}').join('general-guidance');
    output = output.split('{{PRIMARY_HUB}}').join('Knowledge');
    return output;
  }

  async function loadPartials() {
    const placeholders = Array.from(document.querySelectorAll('[data-partial]'));
    if (!placeholders.length) return;

    for (const placeholder of placeholders) {
      const partialName = placeholder.getAttribute('data-partial');
      if (!partialName) continue;
      const source = `/partials/${partialName}.html`;
      try {
        const response = await fetch(source, { cache: 'no-cache' });
        if (!response.ok) continue;
        const raw = await response.text();
        placeholder.innerHTML = applyTemplateTokens(raw, placeholder.dataset);
      } catch {
        // Keep page resilient even if a partial fails to load.
      }
    }
  }

  window.addEventListener('DOMContentLoaded', loadPartials);
})();
