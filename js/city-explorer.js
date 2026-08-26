(async function () {
  const input = document.querySelector("[data-municipality-search]");
  const results = document.querySelector("[data-municipality-results]");
  const status = document.querySelector("[data-municipality-status]");
  if (!input || !results || !status) return;
  try {
    const response = await fetch("/data/brazil-municipalities.json");
    if (!response.ok) throw new Error("Municipality directory unavailable");
    const directory = await response.json();
    status.textContent = `Search ${directory.count.toLocaleString("en-US")} Brazilian municipalities by name or state.`;
    const render = () => {
      const query = input.value.trim().toLocaleLowerCase("pt-BR");
      const matches = query ? directory.municipalities.filter((item) => `${item.name} ${item.state} ${item.stateName}`.toLocaleLowerCase("pt-BR").includes(query)).slice(0, 30) : [];
      results.innerHTML = matches.map((item) => `<li><strong>${item.name}</strong><br><span>${item.state} · ${item.stateName}</span></li>`).join("");
      if (query && !matches.length) results.innerHTML = "<li>No municipality matched that search.</li>";
    };
    input.addEventListener("input", render);
  } catch (error) { status.textContent = "The municipality explorer is temporarily unavailable. Please try again shortly."; }
})();

(async function () {
  const target = document.querySelector("[data-largest-municipalities]");
  if (!target) return;
  try {
    const response = await fetch("/data/largest-municipalities-by-state.json");
    if (!response.ok) throw new Error("Population directory unavailable");
    const directory = await response.json();
    const formatter = new Intl.NumberFormat("en-US");
    target.innerHTML = directory.states.map((state) => `<article class="state-population-card"><h3>${state.stateName} <small>${state.state}</small></h3><ol>${state.municipalities.map((city) => `<li><strong>${city.name}</strong><small>${formatter.format(city.population)} residents · ${directory.year} estimate</small></li>`).join("")}</ol></article>`).join("");
  } catch (error) { target.innerHTML = "<p>Population rankings are temporarily unavailable. Please try again shortly.</p>"; }
})();
