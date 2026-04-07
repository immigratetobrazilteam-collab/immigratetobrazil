#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROUTES_ROOT = ROOT / "content" / "en" / "routes"


def ensure_ascii_json(data: dict) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


def existing_route_data() -> dict[str, dict]:
    data = {}
    for path in ROUTES_ROOT.rglob("page.json"):
        route = "/" + str(path.parent.relative_to(ROUTES_ROOT)).replace("\\", "/").strip("/") + "/"
        if route == "/root/":
            route = "/"
        payload = json.loads(path.read_text(encoding="utf-8"))
        payload["_path"] = path
        data[route] = payload
    return data


def card_from(data: dict) -> dict:
    return {
        "href": data["route"],
        "title": data.get("runtime", {}).get("pageTitle") or data.get("meta", {}).get("title", "").split("|")[0].strip(),
        "description": data.get("meta", {}).get("description", ""),
        "image_src": data.get("meta", {}).get("preloadImage", ""),
        "image_alt": data.get("social", {}).get("ogImageAlt", ""),
    }


def resource(href: str, title: str, description: str) -> dict:
    return {"href": href, "title": title, "description": description}


MIGRATION_LAW = resource(
    "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13445.htm",
    "Brazilian Migration Law",
    "Primary statutory framework for migration, residence, rights, and duties in Brazil.",
)
MIGRATION_DECREE = resource(
    "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/decreto/d9199.htm",
    "Migration Regulation Decree",
    "Regulatory decree for migration procedures, public authorities, and administrative interpretation.",
)
PF_IMM = resource(
    "https://www.gov.br/pf/pt-br/assuntos/imigracao/inicio",
    "Policia Federal - Imigracao",
    "Official Federal Police portal for immigration registration and post-arrival obligations.",
)
MIG_PORTAL = resource(
    "https://portaldeimigracao.mj.gov.br/pt/",
    "Portal de Imigracao - Ministerio da Justica",
    "Official migration portal with residence-authorisation and immigration reference materials.",
)
MRE_CONSULAR = resource(
    "https://www.gov.br/mre/pt-br/assuntos/portal-consular",
    "Portal Consular - Ministerio das Relacoes Exteriores",
    "Official consular portal for visas, consulates, and entry-related guidance.",
)
ANPD = resource(
    "https://www.gov.br/anpd/pt-br",
    "ANPD",
    "Brazilian National Data Protection Authority portal with public privacy and LGPD guidance.",
)
MARCO_CIVIL = resource(
    "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm",
    "Marco Civil da Internet",
    "Official text of Brazil's Internet Civil Framework law.",
)
OAB = resource(
    "https://www.oab.org.br/",
    "OAB Nacional",
    "Official national bar association portal for professional standards and institutional information.",
)
OAB_PR = resource(
    "https://www.oabpr.org.br/",
    "OAB Parana",
    "Official Parana section of the Brazilian Bar Association.",
)
IBGE_CIDADES = resource(
    "https://cidades.ibge.gov.br/",
    "IBGE - Cidades do Brasil",
    "Official municipal profiles, indicators, and local statistics from IBGE.",
)
EC_DATA = resource(
    "https://commission.europa.eu/law/law-topic/data-protection_en",
    "European Commission - Data Protection",
    "Official European Commission overview of data protection and GDPR-related information.",
)
EUR_LEX_GDPR = resource(
    "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    "EUR-Lex - GDPR",
    "Official text of the GDPR regulation through the European Union legal portal.",
)
W3C_WCAG = resource(
    "https://www.w3.org/TR/WCAG22/",
    "W3C - WCAG 2.2",
    "Official accessibility standard reference for WCAG 2.2.",
)
W3C_STATEMENT = resource(
    "https://www.w3.org/WAI/planning/statements/",
    "W3C - Accessibility Statements",
    "Official W3C guidance for accessibility statements and disclosure.",
)
CONSUMER_GOV = resource(
    "https://www.gov.br/mj/pt-br/assuntos/noticias/consumidor-tem-direito-ao-arrependimento-em-compras-on-line",
    "Consumer Right to Regret Online Purchases",
    "Official Brazilian government consumer-rights reference about online purchases.",
)
BCB = resource(
    "https://www.bcb.gov.br/estatisticas",
    "Banco Central do Brasil - Estatisticas",
    "Official Central Bank statistics portal for payments and financial reference information.",
)
DEFENSORIA = resource(
    "https://www.defensoria.pr.def.br/",
    "Defensoria Publica do Parana",
    "Official public-defender portal for legal assistance information in Parana.",
)


def ensure_resources(resources: list[dict], additions: list[dict]) -> list[dict]:
    seen = {item.get("href") for item in resources}
    merged = list(resources)
    for item in additions:
        if item["href"] not in seen:
            merged.append(item)
            seen.add(item["href"])
    return merged


def legal_resource_set(route: str) -> list[dict]:
    if route.endswith("/privacy/"):
        return [ANPD, EC_DATA, EUR_LEX_GDPR, MARCO_CIVIL, MIGRATION_LAW]
    if route.endswith("/cookies/"):
        return [ANPD, EC_DATA, MARCO_CIVIL, EUR_LEX_GDPR, MIGRATION_DECREE]
    if route.endswith("/gdpr/"):
        return [EC_DATA, EUR_LEX_GDPR, ANPD, MARCO_CIVIL, MIGRATION_LAW]
    if route.endswith("/lgpd/"):
        return [ANPD, MARCO_CIVIL, MIGRATION_LAW, MIGRATION_DECREE, EC_DATA]
    if route.endswith("/accessibility/"):
        return [W3C_WCAG, W3C_STATEMENT, ANPD, PF_IMM, MIG_PORTAL]
    if route.endswith("/payment/"):
        return [CONSUMER_GOV, BCB, MIG_PORTAL, PF_IMM, MIGRATION_LAW]
    if route.endswith("/refund/"):
        return [CONSUMER_GOV, BCB, DEFENSORIA, MIG_PORTAL, MIGRATION_LAW]
    if route.endswith("/terms/"):
        return [MIGRATION_LAW, MIGRATION_DECREE, PF_IMM, MIG_PORTAL, CONSUMER_GOV]
    if route.endswith("/form/"):
        return [ANPD, MARCO_CIVIL, MIG_PORTAL, PF_IMM, MIGRATION_LAW]
    if route.endswith("/disclaimer/"):
        return [MIGRATION_LAW, MIGRATION_DECREE, PF_IMM, MRE_CONSULAR, MIG_PORTAL]
    if route.endswith("/emergency/"):
        return [PF_IMM, MRE_CONSULAR, MIG_PORTAL, DEFENSORIA, MIGRATION_LAW]
    if route.endswith("/search/") or route.endswith("/404/"):
        return [PF_IMM, MRE_CONSULAR, MIG_PORTAL, MIGRATION_LAW, MIGRATION_DECREE]
    return [MIGRATION_LAW, MIGRATION_DECREE, PF_IMM, MIG_PORTAL, ANPD]


def about_resource_set(route: str) -> list[dict]:
    if route.endswith("/lawyer/") or route.endswith("/ethics/"):
        return [OAB, OAB_PR, MIGRATION_LAW, MIG_PORTAL, PF_IMM]
    if route.endswith("/clients/") or route.endswith("/stories/") or route.endswith("/results/") or route.endswith("/testimonials/"):
        return [MIGRATION_LAW, MIGRATION_DECREE, PF_IMM, MIG_PORTAL, IBGE_CIDADES]
    return [MIGRATION_LAW, MIGRATION_DECREE, PF_IMM, MIG_PORTAL, MRE_CONSULAR]


def fallback_routes(route: str) -> list[str]:
    if route.startswith("/legal/"):
        return ["/legal/", "/about/", "/services/", "/process/consultation/", "/insights/", "/brazil/"]
    if route.startswith("/about/"):
        return ["/about/", "/services/", "/process/consultation/", "/legal/", "/brazil/", "/insights/"]
    if route.startswith("/services/"):
        return ["/services/", "/process/consultation/", "/legal/", "/about/", "/brazil/", "/insights/"]
    if route.startswith("/process/"):
        return ["/process/", "/services/", "/legal/", "/about/", "/insights/", "/brazil/"]
    if route.startswith("/insights/"):
        return ["/insights/", "/services/", "/process/consultation/", "/brazil/", "/about/", "/legal/"]
    if route.startswith("/brazil/"):
        return ["/brazil/", "/services/", "/insights/", "/process/consultation/", "/about/", "/legal/"]
    return ["/services/", "/about/", "/legal/", "/brazil/", "/process/", "/insights/"]


def enrich_related(route: str, data: dict, route_data: dict[str, dict]) -> list[dict]:
    current = data.get("shell", {}).get("relatedLinks", []) or []
    seen = {item.get("href") for item in current}
    merged = list(current)
    for candidate in fallback_routes(route):
        if candidate == route or candidate not in route_data or candidate in seen:
            continue
        merged.append(card_from(route_data[candidate]))
        seen.add(candidate)
        if len(merged) >= 6:
            break
    return merged


def main() -> None:
    route_data = existing_route_data()
    for route, data in route_data.items():
        shell = data.setdefault("shell", {})
        resources = shell.get("officialResources", []) or []
        if route.startswith("/legal/"):
            shell["officialResources"] = ensure_resources(resources, legal_resource_set(route))
        elif route.startswith("/about/"):
            shell["officialResources"] = ensure_resources(resources, about_resource_set(route))
        shell["relatedLinks"] = enrich_related(route, data, route_data)
        path = data.pop("_path")
        path.write_text(ensure_ascii_json(data), encoding="utf-8")


if __name__ == "__main__":
    main()
