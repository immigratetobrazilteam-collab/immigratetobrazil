#!/usr/bin/env python3
"""
Generate site-wide section image query and image manifests.

Default behavior:
- scans content/en/routes
- builds a route/section inventory
- writes bilingual query packs for each core section
- writes an image manifest with planned options and metadata

Optional download behavior:
- searches Pixabay, Openverse, and Wikimedia Commons
- downloads up to two options per section
- converts assets to local WebP files
- stores source, license, and dedupe metadata
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import os
import re
import sys
import time
import unicodedata
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

import requests
import yaml
from bs4 import BeautifulSoup
from PIL import Image, ImageFilter, ImageOps, UnidentifiedImageError


ROOT = Path(__file__).resolve().parents[1]
CONTENT_ROUTES = ROOT / "content" / "en" / "routes"
DATA_DIR = ROOT / "data"
HERO_MANIFEST_PATH = DATA_DIR / "hero-manifest.json"
QUERY_MANIFEST_PATH = DATA_DIR / "section-query-manifest.json"
IMAGE_MANIFEST_PATH = DATA_DIR / "section-image-manifest.json"
SECTION_INDEX_CSV_PATH = DATA_DIR / "section-image-index.csv"
SELECTION_PATH = DATA_DIR / "section-image-selection.json"
ASSETS_ROOT = ROOT / "assets" / "images" / "sections"
CURATED_LIBRARY_ROOT = ROOT / "assets" / "images" / "curated-brazil"
CURATED_LIBRARY_MANIFEST_PATH = DATA_DIR / "curated-brazil-library.json"
LEGACY_CONFIG_PATH = ROOT / "scripts" / "image_config.yml"

QUERY_VERSION = "2026-03-24-section-images-v5"
DEFAULT_TIMEOUT = 12
USER_AGENT = "ImmigrateToBrazilSectionImages/1.0 (+https://immigratetobrazil.com)"
DEFAULT_PROVIDER_ORDER = ("wikimedia", "openverse", "pixabay")
DEFAULT_PIXABAY_LICENSE_URL = "https://pixabay.com/service/license-summary/"
MIN_IMAGE_WIDTH = 1200
MAX_IMAGE_WIDTH = 1920
WEBP_QUALITY = 82
DOWNLOAD_PER_PAGE = 8
CURATED_DOWNLOAD_PER_PAGE = 40
DEFAULT_CURATED_VARIANTS_PER_SOURCE = 16
CURATED_QUERY_LIMIT = 3
CURATED_CANDIDATE_BUFFER_MULTIPLIER = 2
LOCAL_CURATED_PROVIDER = "local-curated"
SECTION_CANVAS = (MAX_IMAGE_WIDTH, 1080)
LOCAL_CURATED_RENDER_CACHE: dict[str, tuple[bytes, str, int, int]] = {}

SKIP_MENU_IDS = {"hub-menu", "about-menu", "legal-notices-menu"}

NEGATIVE_TOKENS = {
    "bundestag",
    "germany",
    "german",
    "europe",
    "parliament",
    "vector",
    "icon",
    "illustration",
    "passport",
    "visa stamp",
    "police",
    "doctor",
    "hospital",
    "clinic",
    "medical",
    "compass",
    "map",
    "money",
    "coin",
    "banknote",
    "office",
    "laptop",
    "meeting",
    "mockup",
}

BRAZIL_MARKERS = {
    "brazil",
    "brasil",
    "brazilian",
    "brasileiro",
    "brasileira",
    "brasileiros",
    "brasileiras",
}

CONNECTOR_TOKENS = {
    "a",
    "an",
    "and",
    "at",
    "da",
    "das",
    "de",
    "do",
    "dos",
    "e",
    "em",
    "for",
    "from",
    "in",
    "na",
    "no",
    "of",
    "on",
    "the",
    "with",
}

GENERIC_LOCATION_TOKENS = {
    "architecture",
    "background",
    "basin",
    "bay",
    "beach",
    "capital",
    "center",
    "centre",
    "cidade",
    "cidades",
    "city",
    "coast",
    "coastline",
    "colonial",
    "complex",
    "congress",
    "culture",
    "dunes",
    "editorial",
    "falls",
    "forest",
    "government",
    "heritage",
    "historic",
    "horizontal",
    "landmark",
    "landscape",
    "lagoons",
    "mountain",
    "nature",
    "national",
    "panorama",
    "panoramic",
    "park",
    "photo",
    "photography",
    "praia",
    "rainforest",
    "region",
    "river",
    "scenic",
    "scene",
    "sea",
    "side",
    "skyline",
    "state",
    "teatro",
    "theater",
    "tourism",
    "travel",
    "urban",
    "view",
    "vista",
    "wallpaper",
    "waterfalls",
    "waterfront",
    "wetlands",
    "wide",
}

AMBIGUOUS_PLACE_TOKENS = {"amazonas", "bonito", "salvador"}

PROVIDER_SCORE_BOOST = {"wikimedia": 12, "openverse": 8, "pixabay": 2}

REGION_HINTS = {
    "north": {
        "north",
        "northern",
        "amazon",
        "amazonas",
        "manaus",
        "belem",
        "para",
        "amapa",
        "macapa",
        "acre",
        "rio branco",
        "rondonia",
        "porto velho",
        "roraima",
        "boa vista",
        "alter do chao",
        "santarem",
        "tocantins",
        "palmas",
        "jalapao",
    },
    "northeast": {
        "northeast",
        "northeastern",
        "bahia",
        "salvador",
        "pelourinho",
        "recife",
        "olinda",
        "ceara",
        "fortaleza",
        "jericoacoara",
        "natal",
        "genipabu",
        "joao pessoa",
        "cabo branco",
        "maranhao",
        "sao luis",
        "lencois maranhenses",
        "piaui",
        "serra da capivara",
        "teresina",
        "pernambuco",
        "porto de galinhas",
        "fernando de noronha",
        "alagoas",
        "maragogi",
        "maceio",
        "sergipe",
        "aracaju",
        "trancoso",
        "itacare",
        "morro de sao paulo",
        "sao miguel dos milagres",
    },
    "southeast": {
        "southeast",
        "sao paulo",
        "rio de janeiro",
        "minas gerais",
        "espirito santo",
        "vitoria",
        "ouro preto",
        "paraty",
        "belo horizonte",
        "pampulha",
        "tiradentes",
        "diamantina",
        "petropolis",
        "buzios",
        "ilha grande",
        "niteroi",
        "ubatuba",
        "ilhabela",
        "congonhas",
        "inhotim",
        "liberdade",
    },
    "south": {
        "south",
        "southern",
        "parana",
        "curitiba",
        "santa catarina",
        "florianopolis",
        "rio grande do sul",
        "porto alegre",
        "iguazu",
        "foz do iguacu",
        "gramado",
        "canela",
        "ilha do mel",
        "itaimbezinho",
        "aparados da serra",
        "serra do rio do rastro",
    },
    "central-west": {
        "central west",
        "central-west",
        "brasilia",
        "goias",
        "goiania",
        "bonito",
        "rio formoso",
        "pantanal",
        "mato grosso",
        "mato grosso do sul",
        "cuiaba",
        "campo grande",
        "chapada dos veadeiros",
        "chapada dos guimaraes",
        "pirenopolis",
        "goias velho",
    },
}

FAMILY_HINTS = {
    "about": {
        "cue_en": "immigration brand background",
        "cue_pt": "fundo de marca para imigracao",
    },
    "brazil": {
        "cue_en": "Brazil lifestyle background",
        "cue_pt": "fundo de estilo de vida no Brasil",
    },
    "insights": {
        "cue_en": "Brazil reading background",
        "cue_pt": "fundo editorial sobre o Brasil",
    },
    "legal": {
        "cue_en": "Brazil legal guidance background",
        "cue_pt": "fundo juridico sobre o Brasil",
    },
    "process": {
        "cue_en": "Brazil process planning background",
        "cue_pt": "fundo de planejamento de processo no Brasil",
    },
    "services": {
        "cue_en": "Brazil immigration services background",
        "cue_pt": "fundo de servicos de imigracao no Brasil",
    },
    "foundation": {
        "cue_en": "Brazil relocation background",
        "cue_pt": "fundo de mudanca para o Brasil",
    },
    "start-consultation": {
        "cue_en": "Brazil consultation background",
        "cue_pt": "fundo de consulta sobre o Brasil",
    },
}

ALL_SITE_FAMILIES = [
    "foundation",
    "about",
    "brazil",
    "insights",
    "legal",
    "process",
    "services",
    "start-consultation",
    "site",
]

SCENE_VARIANT_TEMPLATES = {
    "coast": [
        ("coast-panorama", "{label} coastline panorama", "the wide coastline and water of {place}", ["coastline", "Atlantic shore", "panorama"]),
        ("shoreline-light", "{label} at golden hour", "the shoreline of {place} in warm evening light", ["golden hour", "shoreline", "travel photography"]),
        ("beachfront-view", "{label} beachfront view", "the beachfront and sea of {place}", ["beachfront", "sea view", "tourism"]),
    ],
    "nature": [
        ("wide-landscape", "{label} wide landscape", "the wide natural landscape of {place}", ["wide landscape", "nature", "panorama"]),
        ("water-forest", "{label} forests and waters", "the forests and waters of {place}", ["forest", "water", "scenery"]),
        ("sunrise-landscape", "{label} at sunrise", "the sunrise landscape of {place}", ["sunrise", "natural scenery", "travel photography"]),
    ],
    "heritage": [
        ("historic-streets", "Historic streets of {label}", "the historic streets and facades of {place}", ["historic streets", "facades", "architecture"]),
        ("plazas-churches", "{label} plazas and churches", "the plazas and churches of {place}", ["plazas", "churches", "heritage"]),
        ("heritage-facades", "{label} heritage facades", "the heritage facades of {place}", ["heritage facades", "architecture", "colonial Brazil"]),
    ],
    "city": [
        ("city-panorama", "{label} city panorama", "the urban panorama of {place}", ["city panorama", "urban Brazil", "skyline"]),
        ("waterfront-skyline", "{label} waterfront skyline", "the waterfront and skyline of {place}", ["waterfront", "skyline", "avenues"]),
        ("street-scene", "{label} architecture and streets", "the architecture and streets of {place}", ["street scene", "architecture", "public spaces"]),
    ],
    "civic": [
        ("monumental-view", "{label} monumental view", "the monumental view of {place}", ["monumental", "capital architecture", "public spaces"]),
        ("capital-skyline", "{label} capital skyline", "the skyline and civic spaces of {place}", ["capital skyline", "architecture", "city view"]),
        ("modern-architecture", "{label} modern architecture", "the modern architecture of {place}", ["modernist architecture", "landmark", "civic space"]),
    ],
}

EXTRA_BRAZIL_SOURCE_DATA = [
    ("belem-ver-o-peso", "Ver-o-Peso market in Belem", "the Ver-o-Peso market on the Belem waterfront", ["Belem", "Para", "Ver-o-Peso", "Amazon estuary", "northern Brazil"]),
    ("sao-luis-historic-center", "Historic center of Sao Luis", "the tiled colonial streets of Sao Luis", ["Sao Luis", "Maranhao", "historic center", "UNESCO", "northeast Brazil"]),
    ("jericoacoara-dunes", "Jericoacoara dunes", "the dunes and lagoons of Jericoacoara", ["Jericoacoara", "Ceara", "dunes", "coast", "northeast Brazil"]),
    ("fortaleza-beira-mar", "Fortaleza Beira Mar", "Fortaleza and the Beira Mar coastline", ["Fortaleza", "Ceara", "Beira Mar", "Atlantic coast", "northeast Brazil"]),
    ("natal-genipabu", "Genipabu dunes in Natal", "the Genipabu dunes near Natal", ["Natal", "Rio Grande do Norte", "Genipabu", "sand dunes", "northeast Brazil"]),
    ("joao-pessoa-cabo-branco", "Cabo Branco in Joao Pessoa", "the Cabo Branco seafront in Joao Pessoa", ["Joao Pessoa", "Paraiba", "Cabo Branco", "coastline", "northeast Brazil"]),
    ("recife-antigo", "Recife Antigo", "the historic district of Recife Antigo", ["Recife", "Pernambuco", "Recife Antigo", "historic district", "northeast Brazil"]),
    ("olinda-historic-center", "Historic center of Olinda", "the hillside historic center of Olinda", ["Olinda", "Pernambuco", "historic center", "colonial architecture", "northeast Brazil"]),
    ("maragogi-pools", "Natural pools of Maragogi", "the natural pools of Maragogi", ["Maragogi", "Alagoas", "natural pools", "coast", "northeast Brazil"]),
    ("maceio-pajucara", "Pajucara waterfront in Maceio", "the Pajucara waterfront in Maceio", ["Maceio", "Alagoas", "Pajucara", "beach", "northeast Brazil"]),
    ("aracaju-orla", "Orla de Atalaia in Aracaju", "the Atalaia waterfront in Aracaju", ["Aracaju", "Sergipe", "Atalaia", "waterfront", "northeast Brazil"]),
    ("chapada-diamantina", "Chapada Diamantina", "the valleys and plateaus of Chapada Diamantina", ["Chapada Diamantina", "Bahia", "national park", "mountains", "northeast Brazil"]),
    ("itacare-coast", "Itacare coastline", "the Atlantic coastline around Itacare", ["Itacare", "Bahia", "cocoa coast", "beach", "northeast Brazil"]),
    ("salvador-barra", "Farol da Barra in Salvador", "Farol da Barra and the seafront of Salvador", ["Salvador", "Bahia", "Farol da Barra", "lighthouse", "northeast Brazil"]),
    ("trancoso-quadrado", "Quadrado of Trancoso", "the colorful Quadrado of Trancoso", ["Trancoso", "Bahia", "Quadrado", "heritage", "northeast Brazil"]),
    ("vitoria-bay", "Vitoria bay", "Vitoria and the bayfront of Espirito Santo", ["Vitoria", "Espirito Santo", "bay", "capital", "southeast Brazil"]),
    ("belo-horizonte-pampulha", "Pampulha in Belo Horizonte", "the Pampulha architectural complex in Belo Horizonte", ["Belo Horizonte", "Minas Gerais", "Pampulha", "architecture", "southeast Brazil"]),
    ("tiradentes-historic-center", "Historic center of Tiradentes", "the historic streets of Tiradentes", ["Tiradentes", "Minas Gerais", "historic center", "colonial Brazil", "southeast Brazil"]),
    ("diamantina-historic-center", "Historic center of Diamantina", "the colonial center of Diamantina", ["Diamantina", "Minas Gerais", "historic center", "heritage", "southeast Brazil"]),
    ("congonhas-sanctuary", "Sanctuary of Congonhas", "the sanctuary and sculptures of Congonhas", ["Congonhas", "Minas Gerais", "sanctuary", "Aleijadinho", "southeast Brazil"]),
    ("sao-joao-del-rei", "Sao Joao del Rei", "the churches and streets of Sao Joao del Rei", ["Sao Joao del Rei", "Minas Gerais", "historic city", "heritage", "southeast Brazil"]),
    ("petropolis-imperial", "Imperial Museum of Petropolis", "Petropolis and the imperial museum district", ["Petropolis", "Rio de Janeiro state", "Imperial Museum", "mountain city", "southeast Brazil"]),
    ("buzios-peninsula", "Buzios peninsula", "the Buzios peninsula on the coast of Rio de Janeiro state", ["Buzios", "Rio de Janeiro state", "peninsula", "beaches", "southeast Brazil"]),
    ("ilha-grande", "Ilha Grande coastline", "the coastline and coves of Ilha Grande", ["Ilha Grande", "Rio de Janeiro state", "Atlantic forest", "coast", "southeast Brazil"]),
    ("niteroi-mac", "Museum of Contemporary Art in Niteroi", "the Niteroi Contemporary Art Museum over Guanabara Bay", ["Niteroi", "Rio de Janeiro state", "Museum of Contemporary Art", "bay", "southeast Brazil"]),
    ("rio-museu-amanha", "Museum of Tomorrow in Rio de Janeiro", "the Museum of Tomorrow in Rio de Janeiro", ["Rio de Janeiro", "Museum of Tomorrow", "port zone", "architecture", "southeast Brazil"]),
    ("sao-paulo-liberdade", "Liberdade district in Sao Paulo", "the Liberdade district in Sao Paulo", ["Sao Paulo", "Liberdade", "urban Brazil", "culture", "southeast Brazil"]),
    ("ubatuba-coast", "Ubatuba coastline", "the coastline and Atlantic forest of Ubatuba", ["Ubatuba", "Sao Paulo state", "coast", "Atlantic forest", "southeast Brazil"]),
    ("ilhabela-coast", "Ilhabela coastline", "the island coastline of Ilhabela", ["Ilhabela", "Sao Paulo state", "coast", "island", "southeast Brazil"]),
    ("inhotim", "Inhotim in Brumadinho", "the gardens and contemporary art pavilions of Inhotim", ["Inhotim", "Brumadinho", "Minas Gerais", "art park", "southeast Brazil"]),
    ("curitiba-botanico", "Botanical Garden of Curitiba", "the Botanical Garden of Curitiba", ["Curitiba", "Parana", "Botanical Garden", "urban park", "southern Brazil"]),
    ("serra-rio-rastro", "Serra do Rio do Rastro", "the mountain road of Serra do Rio do Rastro", ["Serra do Rio do Rastro", "Santa Catarina", "mountains", "southern Brazil", "scenic road"]),
    ("gramado-lago-negro", "Lago Negro in Gramado", "Lago Negro in Gramado", ["Gramado", "Rio Grande do Sul", "Lago Negro", "tourism", "southern Brazil"]),
    ("canela-catedral", "Cathedral of Canela", "the cathedral and town center of Canela", ["Canela", "Rio Grande do Sul", "cathedral", "mountain town", "southern Brazil"]),
    ("porto-alegre-guaiba", "Guaiba waterfront in Porto Alegre", "the Guaiba waterfront in Porto Alegre", ["Porto Alegre", "Rio Grande do Sul", "Guaiba", "waterfront", "southern Brazil"]),
    ("ilha-do-mel", "Ilha do Mel", "the beaches and lighthouse of Ilha do Mel", ["Ilha do Mel", "Parana", "coast", "island", "southern Brazil"]),
    ("itaimbezinho-canyon", "Itaimbezinho canyon", "the Itaimbezinho canyon in Aparados da Serra", ["Itaimbezinho", "Aparados da Serra", "canyon", "southern Brazil", "national park"]),
    ("bonito-gruta-azul", "Gruta do Lago Azul in Bonito", "the Gruta do Lago Azul in Bonito", ["Bonito", "Mato Grosso do Sul", "Gruta do Lago Azul", "ecotourism", "central-west Brazil"]),
    ("chapada-guimaraes", "Chapada dos Guimaraes", "the cliffs and valleys of Chapada dos Guimaraes", ["Chapada dos Guimaraes", "Mato Grosso", "plateau", "central-west Brazil", "national park"]),
    ("cuiaba-center", "Cuiaba historic center", "the historic center of Cuiaba", ["Cuiaba", "Mato Grosso", "historic center", "capital", "central-west Brazil"]),
    ("campo-grande-park", "Park of Indigenous Nations in Campo Grande", "the Park of Indigenous Nations in Campo Grande", ["Campo Grande", "Mato Grosso do Sul", "urban park", "capital", "central-west Brazil"]),
    ("goiania-civic", "Civic center of Goiania", "the civic center and avenues of Goiania", ["Goiania", "Goias", "civic center", "capital", "central-west Brazil"]),
    ("pirenopolis", "Historic center of Pirenopolis", "the historic center of Pirenopolis", ["Pirenopolis", "Goias", "historic center", "colonial town", "central-west Brazil"]),
    ("goias-velho", "Historic center of Goias", "the historic center of Goias Velho", ["Goias Velho", "Goias", "historic center", "heritage", "central-west Brazil"]),
    ("jalapao-dunes", "Jalapao dunes", "the orange dunes and springs of Jalapao", ["Jalapao", "Tocantins", "dunes", "springs", "northern Brazil"]),
    ("palmas-lake", "Palmas and Lake Palmas", "the lakefront of Palmas", ["Palmas", "Tocantins", "lake", "capital", "northern Brazil"]),
    ("brasilia-cathedral", "Cathedral of Brasilia", "the Cathedral of Brasilia", ["Brasilia", "cathedral", "modern architecture", "capital", "central-west Brazil"]),
    ("manaus-ponta-negra", "Ponta Negra in Manaus", "the Ponta Negra riverfront in Manaus", ["Manaus", "Amazonas", "Ponta Negra", "riverfront", "northern Brazil"]),
    ("alter-do-chao", "Alter do Chao", "the beaches of Alter do Chao on the Tapajos River", ["Alter do Chao", "Para", "Tapajos River", "river beach", "northern Brazil"]),
    ("santarem-tapajos", "Tapajos river in Santarem", "the meeting of waters near Santarem", ["Santarem", "Para", "Tapajos River", "Amazon", "northern Brazil"]),
    ("macapa-fort", "Fort of Sao Jose de Macapa", "the fort and riverfront of Macapa", ["Macapa", "Amapa", "Fort of Sao Jose", "Amazon river", "northern Brazil"]),
    ("porto-velho-madeira", "Madeira river in Porto Velho", "the Madeira riverfront in Porto Velho", ["Porto Velho", "Rondonia", "Madeira River", "northern Brazil", "riverfront"]),
    ("rio-branco-gameleira", "Gameleira district in Rio Branco", "the riverfront district of Gameleira in Rio Branco", ["Rio Branco", "Acre", "Gameleira", "riverfront", "northern Brazil"]),
    ("boa-vista-orla", "Orla Taumanan in Boa Vista", "the Orla Taumanan riverfront in Boa Vista", ["Boa Vista", "Roraima", "Orla Taumanan", "riverfront", "northern Brazil"]),
    ("serra-capivara", "Serra da Capivara", "the rock formations and parks of Serra da Capivara", ["Serra da Capivara", "Piaui", "national park", "archaeology", "northeast Brazil"]),
    ("teresina-poty", "Poty river in Teresina", "the Poty river and bridges of Teresina", ["Teresina", "Piaui", "Poty River", "capital", "northeast Brazil"]),
    ("porto-de-galinhas", "Porto de Galinhas", "the beach and natural pools of Porto de Galinhas", ["Porto de Galinhas", "Pernambuco", "natural pools", "beach", "northeast Brazil"]),
    ("fernando-noronha", "Baia do Sancho in Fernando de Noronha", "Baia do Sancho in Fernando de Noronha", ["Fernando de Noronha", "Baia do Sancho", "island", "beach", "Brazil"]),
    ("sao-miguel-milagres", "Sao Miguel dos Milagres", "the coast of Sao Miguel dos Milagres", ["Sao Miguel dos Milagres", "Alagoas", "coast", "beach", "northeast Brazil"]),
    ("morro-sao-paulo", "Morro de Sao Paulo", "the island village and beaches of Morro de Sao Paulo", ["Morro de Sao Paulo", "Bahia", "island", "beach", "northeast Brazil"]),
    ("aparados-serra", "Aparados da Serra", "the canyons of Aparados da Serra", ["Aparados da Serra", "canyons", "southern Brazil", "national park", "mountains"]),
    ("encontro-aguas", "Meeting of the Waters in Manaus", "the meeting of the Rio Negro and Solimoes near Manaus", ["Manaus", "Meeting of the Waters", "Amazonas", "rivers", "northern Brazil"]),
    ("anavilhanas", "Anavilhanas archipelago", "the islands and waterways of Anavilhanas", ["Anavilhanas", "Amazonas", "archipelago", "Amazon", "northern Brazil"]),
    ("monte-roraima", "Monte Roraima in Brazil", "the Brazilian face of Monte Roraima", ["Monte Roraima", "Roraima", "mountain", "nature", "northern Brazil"]),
    ("teatro-paz", "Teatro da Paz in Belem", "the Teatro da Paz in Belem", ["Belem", "Teatro da Paz", "Para", "heritage", "northern Brazil"]),
    ("marajo-island", "Marajo Island riverfront", "the riverfront landscapes of Marajo Island", ["Marajo", "Para", "island", "river", "northern Brazil"]),
    ("jalapao-fervedouro", "Fervedouro in Jalapao", "the clear springs of Jalapao", ["Jalapao", "Tocantins", "fervedouro", "springs", "northern Brazil"]),
    ("estacao-docas", "Estacao das Docas in Belem", "the Estacao das Docas waterfront in Belem", ["Belem", "Estacao das Docas", "Para", "riverfront", "northern Brazil"]),
    ("rio-negro-palace", "Rio Negro Palace in Manaus", "the Rio Negro Palace in Manaus", ["Manaus", "Rio Negro Palace", "Amazonas", "heritage", "northern Brazil"]),
    ("porto-seguro-historic-center", "Historic center of Porto Seguro", "the historic center of Porto Seguro", ["Porto Seguro", "Bahia", "historic center", "coast", "northeast Brazil"]),
    ("praia-do-forte", "Praia do Forte coastline", "the coastline of Praia do Forte", ["Praia do Forte", "Bahia", "coast", "beach", "northeast Brazil"]),
    ("arraial-dajuda", "Arraial d'Ajuda coastline", "the coast of Arraial d'Ajuda", ["Arraial d'Ajuda", "Bahia", "coast", "beach", "northeast Brazil"]),
    ("canoa-quebrada", "Cliffs of Canoa Quebrada", "the red cliffs and beach of Canoa Quebrada", ["Canoa Quebrada", "Ceara", "cliffs", "coast", "northeast Brazil"]),
    ("morro-branco", "Cliffs of Morro Branco", "the cliffs and shore of Morro Branco", ["Morro Branco", "Ceara", "cliffs", "coast", "northeast Brazil"]),
    ("delta-parnaiba", "Delta do Parnaiba", "the waterways and dunes of the Delta do Parnaiba", ["Delta do Parnaiba", "Piaui", "river delta", "nature", "northeast Brazil"]),
    ("praia-carneiros", "Praia dos Carneiros", "the coast and church of Praia dos Carneiros", ["Praia dos Carneiros", "Pernambuco", "coast", "beach", "northeast Brazil"]),
    ("canions-sao-francisco", "Canions do Sao Francisco", "the Sao Francisco river canyons", ["Canions do Sao Francisco", "Alagoas", "river canyon", "nature", "northeast Brazil"]),
    ("pipa-cliffs", "Cliffs of Pipa", "the cliffs and coastline of Pipa", ["Pipa", "Rio Grande do Norte", "cliffs", "beach", "northeast Brazil"]),
    ("alcantara-historic-center", "Historic center of Alcantara", "the historic center of Alcantara", ["Alcantara", "Maranhao", "historic center", "heritage", "northeast Brazil"]),
    ("campina-grande-park", "Parque do Povo in Campina Grande", "the cultural grounds of Parque do Povo", ["Campina Grande", "Paraiba", "Parque do Povo", "culture", "northeast Brazil"]),
    ("bombinhas-coast", "Bombinhas peninsula", "the beaches and peninsula of Bombinhas", ["Bombinhas", "Santa Catarina", "coast", "beach", "southern Brazil"]),
    ("praia-do-rosa", "Praia do Rosa", "the bay and coastline of Praia do Rosa", ["Praia do Rosa", "Santa Catarina", "coast", "beach", "southern Brazil"]),
    ("balneario-camboriu", "Balneario Camboriu skyline", "the skyline and waterfront of Balneario Camboriu", ["Balneario Camboriu", "Santa Catarina", "skyline", "coast", "southern Brazil"]),
    ("blumenau-vila-germanica", "Vila Germanica in Blumenau", "the Vila Germanica district in Blumenau", ["Blumenau", "Vila Germanica", "Santa Catarina", "culture", "southern Brazil"]),
    ("sao-miguel-missoes", "Sao Miguel das Missoes", "the mission ruins of Sao Miguel das Missoes", ["Sao Miguel das Missoes", "Rio Grande do Sul", "heritage", "UNESCO", "southern Brazil"]),
    ("vale-vinhedos", "Vale dos Vinhedos", "the vineyards of Vale dos Vinhedos", ["Vale dos Vinhedos", "Rio Grande do Sul", "vineyards", "wine", "southern Brazil"]),
    ("fortaleza-canyon", "Fortaleza Canyon in Cambara do Sul", "the Fortaleza Canyon in Cambara do Sul", ["Fortaleza Canyon", "Cambara do Sul", "canyon", "southern Brazil", "mountains"]),
    ("morro-igreja", "Morro da Igreja", "the highland views from Morro da Igreja", ["Morro da Igreja", "Santa Catarina", "mountains", "nature", "southern Brazil"]),
    ("guaratuba-bay", "Guaratuba Bay", "the bay and waterfront of Guaratuba", ["Guaratuba", "Parana", "bay", "coast", "southern Brazil"]),
    ("antonina-historic-center", "Historic center of Antonina", "the historic center of Antonina", ["Antonina", "Parana", "historic center", "heritage", "southern Brazil"]),
    ("copacabana-beach", "Copacabana beach and promenade", "Copacabana beach and the Rio waterfront", ["Copacabana", "Rio de Janeiro", "beach", "coast", "southeast Brazil"]),
    ("ipanema-beach", "Ipanema beach and Dois Irmaos", "Ipanema beach with Dois Irmaos in the background", ["Ipanema", "Rio de Janeiro", "beach", "coast", "southeast Brazil"]),
    ("avenida-paulista", "Avenida Paulista in Sao Paulo", "Avenida Paulista in Sao Paulo", ["Avenida Paulista", "Sao Paulo", "avenue", "city", "southeast Brazil"]),
    ("campos-jordao", "Campos do Jordao", "the mountain town of Campos do Jordao", ["Campos do Jordao", "Sao Paulo state", "mountain town", "tourism", "southeast Brazil"]),
    ("capitolio-canyons", "Capitolio canyons in Minas Gerais", "the canyons and lake scenery of Capitolio", ["Capitolio", "Minas Gerais", "canyons", "lake", "southeast Brazil"]),
    ("ibitipoca-park", "Ibitipoca State Park", "the trails and cliffs of Ibitipoca", ["Ibitipoca", "Minas Gerais", "park", "mountains", "southeast Brazil"]),
    ("serra-canastra", "Serra da Canastra", "the valleys and waterfalls of Serra da Canastra", ["Serra da Canastra", "Minas Gerais", "national park", "nature", "southeast Brazil"]),
    ("guarapari-coast", "Guarapari coastline", "the coastline of Guarapari", ["Guarapari", "Espirito Santo", "coast", "beach", "southeast Brazil"]),
    ("cabo-frio-coast", "Cabo Frio coast", "the coast and waters of Cabo Frio", ["Cabo Frio", "Rio de Janeiro state", "coast", "beach", "southeast Brazil"]),
    ("santos-waterfront", "Santos waterfront", "the waterfront and gardens of Santos", ["Santos", "Sao Paulo state", "waterfront", "coast", "southeast Brazil"]),
    ("jk-bridge", "JK Bridge in Brasilia", "the JK Bridge over Lake Paranoa", ["Brasilia", "JK Bridge", "lake", "architecture", "central-west Brazil"]),
    ("lake-paranoa", "Lake Paranoa in Brasilia", "the shores of Lake Paranoa in Brasilia", ["Brasilia", "Lake Paranoa", "lake", "capital", "central-west Brazil"]),
    ("nobres-lagoa-azul", "Lagoa Azul in Nobres", "the clear waters of Lagoa Azul in Nobres", ["Nobres", "Mato Grosso", "Lagoa Azul", "ecotourism", "central-west Brazil"]),
    ("serra-bodoquena", "Serra da Bodoquena", "the rivers and forests of Serra da Bodoquena", ["Serra da Bodoquena", "Mato Grosso do Sul", "nature", "ecotourism", "central-west Brazil"]),
    ("parque-emas", "Emas National Park", "the cerrado landscape of Emas National Park", ["Emas National Park", "Goias", "cerrado", "nature", "central-west Brazil"]),
    ("pirenopolis-waterfalls", "Waterfalls near Pirenopolis", "the waterfalls and nature around Pirenopolis", ["Pirenopolis", "Goias", "waterfalls", "nature", "central-west Brazil"]),
    ("palacio-alvorada", "Palacio da Alvorada in Brasilia", "the Palacio da Alvorada in Brasilia", ["Brasilia", "Palacio da Alvorada", "architecture", "capital", "central-west Brazil"]),
    ("aguas-emendadas", "Aguas Emendadas ecological station", "the cerrado landscape of Aguas Emendadas", ["Aguas Emendadas", "Federal District", "nature", "cerrado", "central-west Brazil"]),
]

OVERLAY_PRESETS = {
    "civic-deep": {
        "name": "civic-deep",
        "css": "linear-gradient(180deg, rgba(3, 15, 24, 0.74), rgba(4, 16, 18, 0.66)), linear-gradient(120deg, rgba(7, 49, 73, 0.56), rgba(8, 28, 21, 0.42))",
        "tone": "inverse",
    },
    "coastal-warm": {
        "name": "coastal-warm",
        "css": "linear-gradient(180deg, rgba(8, 24, 29, 0.62), rgba(9, 27, 20, 0.52)), linear-gradient(128deg, rgba(0, 78, 92, 0.46), rgba(179, 121, 28, 0.28))",
        "tone": "inverse",
    },
    "forest-depth": {
        "name": "forest-depth",
        "css": "linear-gradient(180deg, rgba(6, 18, 12, 0.72), rgba(8, 22, 15, 0.62)), linear-gradient(120deg, rgba(18, 72, 54, 0.42), rgba(24, 54, 34, 0.34))",
        "tone": "inverse",
    },
    "sunrise-amber": {
        "name": "sunrise-amber",
        "css": "linear-gradient(180deg, rgba(18, 12, 8, 0.72), rgba(16, 14, 12, 0.56)), linear-gradient(120deg, rgba(143, 84, 20, 0.34), rgba(47, 91, 80, 0.26))",
        "tone": "inverse",
    },
    "slate-focus": {
        "name": "slate-focus",
        "css": "linear-gradient(180deg, rgba(10, 14, 20, 0.74), rgba(14, 18, 24, 0.64)), linear-gradient(120deg, rgba(40, 62, 89, 0.42), rgba(26, 32, 44, 0.34))",
        "tone": "inverse",
    },
    "night-city": {
        "name": "night-city",
        "css": "linear-gradient(180deg, rgba(6, 10, 24, 0.76), rgba(7, 12, 18, 0.66)), linear-gradient(128deg, rgba(19, 44, 88, 0.44), rgba(12, 86, 74, 0.24))",
        "tone": "inverse",
    },
}

INTENT_RULES = [
    {
        "key": "overview",
        "tokens": [
            "overview",
            "identity",
            "origin",
            "defined purpose",
            "company identity",
            "what we do",
            "what defines us",
            "immigrate to brazil as a whole",
        ],
        "focus_en": "welcoming Brazil overview background",
        "focus_pt": "fundo acolhedor de panorama do Brasil",
        "overlay": "coastal-warm",
        "source_tags": {"city", "coast", "nature", "heritage"},
    },
    {
        "key": "legal",
        "tokens": [
            "legal",
            "ethics",
            "compliance",
            "documentation",
            "records",
            "filing",
            "boundaries",
            "scope",
            "law",
            "official",
            "government",
            "responsibilities",
            "obligations",
            "federal",
        ],
        "focus_en": "Brazil legal guidance background",
        "focus_pt": "fundo juridico sobre o Brasil",
        "overlay": "civic-deep",
        "source_tags": {"civic", "city", "heritage"},
    },
    {
        "key": "process",
        "tokens": [
            "process",
            "sequence",
            "preparation",
            "timeline",
            "planning",
            "how we prepare",
            "how we structure",
            "how we handle",
            "what happens next",
            "next step",
            "consultation flow",
            "manual review",
            "payment before scheduling",
            "timing rule",
        ],
        "focus_en": "Brazil process planning background",
        "focus_pt": "fundo de planejamento de processo no Brasil",
        "overlay": "slate-focus",
        "source_tags": {"city", "civic", "nature"},
    },
    {
        "key": "trust",
        "tokens": [
            "trust",
            "results",
            "confidence",
            "testimonials",
            "stories",
            "values",
            "transparent",
            "honest",
            "safe",
            "quiet confidence",
            "calm",
            "why us",
            "standards",
        ],
        "focus_en": "Brazil trust and confidence background",
        "focus_pt": "fundo de confianca e credibilidade no Brasil",
        "overlay": "sunrise-amber",
        "source_tags": {"heritage", "city", "coast"},
    },
    {
        "key": "business",
        "tokens": [
            "business",
            "investor",
            "investment",
            "economy",
            "trade",
            "currency",
            "industries",
            "employment",
            "corporate",
            "work",
            "startup",
            "returns",
            "sectors",
            "opportunities",
        ],
        "focus_en": "Brazil business and opportunity background",
        "focus_pt": "fundo de negocios e oportunidades no Brasil",
        "overlay": "night-city",
        "source_tags": {"city", "civic", "coast"},
    },
    {
        "key": "places",
        "tokens": [
            "regions",
            "geography",
            "climate",
            "states",
            "cities",
            "municipalities",
            "location",
            "north",
            "northeast",
            "southeast",
            "south",
            "central-west",
        ],
        "focus_en": "Brazil geography and place background",
        "focus_pt": "fundo de geografia e lugares do Brasil",
        "overlay": "forest-depth",
        "source_tags": {"nature", "coast", "city", "heritage"},
    },
    {
        "key": "lifestyle",
        "tokens": [
            "lifestyle",
            "daily life",
            "routine",
            "social life",
            "work style",
            "pace",
            "adaptation",
            "quality",
            "benefits",
            "appeal",
            "housing",
            "food",
            "transport",
            "healthcare",
            "education",
            "services",
            "living",
        ],
        "focus_en": "Brazil lifestyle background",
        "focus_pt": "fundo de estilo de vida no Brasil",
        "overlay": "coastal-warm",
        "source_tags": {"coast", "city", "nature", "heritage"},
    },
    {
        "key": "culture",
        "tokens": [
            "culture",
            "traditions",
            "music",
            "cuisine",
            "street food",
            "dining",
            "festivals",
            "events",
            "language",
            "diversity",
            "social norms",
            "richness",
            "experience",
            "favorites",
        ],
        "focus_en": "Brazil culture background",
        "focus_pt": "fundo cultural do Brasil",
        "overlay": "sunrise-amber",
        "source_tags": {"heritage", "coast", "city", "nature"},
    },
    {
        "key": "risk",
        "tokens": [
            "risk",
            "risks",
            "mistakes",
            "what not to do",
            "exposure",
            "limitations",
            "considerations",
            "urgency",
            "stalled",
            "failures",
            "problems",
            "rebuilding",
        ],
        "focus_en": "Brazil careful planning background",
        "focus_pt": "fundo de cautela e planejamento no Brasil",
        "overlay": "slate-focus",
        "source_tags": {"city", "civic", "nature"},
    },
    {
        "key": "future",
        "tokens": [
            "future",
            "growth",
            "looking forward",
            "ongoing direction",
            "long-term",
            "progress",
            "outcomes",
            "continuity",
        ],
        "focus_en": "Brazil long term planning background",
        "focus_pt": "fundo de planejamento de longo prazo no Brasil",
        "overlay": "night-city",
        "source_tags": {"city", "coast", "nature"},
    },
    {
        "key": "audience",
        "tokens": [
            "who this visa is usually for",
            "who this residence route is usually for",
            "who usually comes to us for this",
            "who this service is for",
            "clients",
            "individuals",
            "families",
            "entrepreneurs",
            "digital nomads",
            "business owners",
        ],
        "focus_en": "Brazil audience and profile background",
        "focus_pt": "fundo de perfis e publicos no Brasil",
        "overlay": "coastal-warm",
        "source_tags": {"city", "coast", "heritage"},
    },
]


def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def normalize_text(value: str) -> str:
    folded = unicodedata.normalize("NFKD", value or "")
    ascii_text = folded.encode("ascii", "ignore").decode("ascii")
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r"[^a-z0-9]+", " ", ascii_text)
    return re.sub(r"\s+", " ", ascii_text).strip()


def slugify(value: str) -> str:
    text = normalize_text(value).replace(" ", "-")
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text[:120] or "item"


def humanize_identifier(value: str) -> str:
    text = re.sub(r"[-_]+", " ", value)
    text = re.sub(r"\bsection\s+\d+\b", "", text, flags=re.I)
    text = re.sub(r"\s+", " ", text).strip()
    return text.title() if text else value


def unique_ordered(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    output: list[str] = []
    for raw in values:
        item = raw.strip()
        if not item or item in seen:
            continue
        seen.add(item)
        output.append(item)
    return output


def stable_index(seed: str, size: int) -> int:
    if size <= 0:
        return 0
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return int(digest[:12], 16) % size


def is_distinctive_term(term: str) -> bool:
    return len(term) >= 4 and term not in BRAZIL_MARKERS and term not in CONNECTOR_TOKENS and term not in GENERIC_LOCATION_TOKENS


def build_phrase_variants(value: str) -> list[str]:
    normalized = normalize_text(value)
    if not normalized:
        return []

    words = normalized.split()
    distinctive_words = [word for word in words if is_distinctive_term(word)]
    if not distinctive_words:
        return []

    simplified_words = [
        word for word in words if word not in BRAZIL_MARKERS and word not in CONNECTOR_TOKENS and word not in GENERIC_LOCATION_TOKENS
    ]
    variants = [normalized]
    simplified = " ".join(simplified_words).strip()
    if simplified and simplified != normalized and len(simplified) >= 4:
        variants.append(simplified)
    variants.extend(distinctive_words)
    return unique_ordered(term for term in variants if len(term) >= 4)


def build_source_validation_profile(anchor: dict[str, Any]) -> dict[str, Any]:
    place_terms = unique_ordered(
        term for value in (anchor.get("label", ""), anchor.get("scene", ""), anchor.get("slug", "").replace("-", " ")) for term in build_phrase_variants(value)
    )
    support_terms = unique_ordered(
        term
        for value in anchor.get("keywords", [])
        for term in build_phrase_variants(value)
        if term not in place_terms
    )
    return {
        "required_place_terms": place_terms[:18],
        "support_terms": support_terms[:24],
        "brazil_markers": sorted(BRAZIL_MARKERS),
        "is_brazil_verified": False,
        "matched_place_terms": [],
        "matched_support_terms": [],
        "matched_brazil_terms": [],
    }


def normalize_curated_assets(source_id: str, payload: dict[str, Any]) -> list[dict[str, Any]]:
    assets = payload.get("assets")
    normalized_assets: list[dict[str, Any]] = []
    if isinstance(assets, list) and assets:
        for index, asset in enumerate(assets, start=1):
            if not isinstance(asset, dict) or not asset.get("asset_path"):
                continue
            variant_id = str(asset.get("variant_id") or f"v{index:02d}")
            normalized_assets.append({**asset, "variant_id": variant_id, "base_source_id": source_id})
        return normalized_assets

    if payload.get("asset_path"):
        normalized_assets.append(
            {
                "variant_id": "v01",
                "base_source_id": source_id,
                "asset_path": payload.get("asset_path"),
                "provider": payload.get("provider"),
                "provider_id": payload.get("provider_id"),
                "license": payload.get("license"),
                "license_url": payload.get("license_url"),
                "creator": payload.get("creator"),
                "page_url": payload.get("page_url"),
                "query_used": payload.get("query_used"),
                "score": payload.get("score"),
                "hash": payload.get("hash"),
                "width": payload.get("width"),
                "height": payload.get("height"),
                "downloaded_at": payload.get("downloaded_at"),
            }
        )
    return normalized_assets


def load_curated_library_index() -> dict[str, dict[str, Any]]:
    payload = load_json(CURATED_LIBRARY_MANIFEST_PATH, {})
    if not isinstance(payload, dict):
        return {}
    sources = payload.get("sources") or {}
    if not isinstance(sources, dict):
        return {}
    normalized: dict[str, dict[str, Any]] = {}
    for source_id, source_payload in sources.items():
        if not isinstance(source_payload, dict):
            continue
        assets = normalize_curated_assets(source_id, source_payload)
        normalized[source_id] = {**source_payload, "assets": assets}
        if assets and not normalized[source_id].get("asset_path"):
            normalized[source_id]["asset_path"] = assets[0]["asset_path"]
    return normalized


def query_seed_phrases(anchor: dict[str, Any]) -> list[str]:
    seeds: list[str] = []
    seen: set[str] = set()
    for value in [anchor.get("label", ""), anchor.get("scene", ""), *(anchor.get("keywords") or [])]:
        raw = str(value or "").strip()
        if not raw:
            continue
        normalized = normalize_text(raw)
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        seeds.append(raw)
    return seeds


def infer_source_regions(source: dict[str, Any]) -> set[str]:
    text = " ".join(
        [
            source.get("label", ""),
            source.get("scene", ""),
            " ".join(source.get("keywords", [])),
            source.get("region_label", ""),
        ]
    )
    normalized = normalize_text(text)
    regions: set[str] = set()
    for region, tokens in REGION_HINTS.items():
        if any(token in normalized for token in tokens):
            regions.add(region)
    return regions or {"national"}


def infer_context_regions(*values: str) -> set[str]:
    normalized = normalize_text(" ".join(values))
    regions: set[str] = set()
    for region, tokens in REGION_HINTS.items():
        if any(token in normalized for token in tokens):
            regions.add(region)
    return regions


def prepare_source(source: dict[str, Any]) -> dict[str, Any]:
    source["tags"] = sorted(infer_source_tags(source))
    source["regions"] = sorted(infer_source_regions(source))
    return source


def expand_scene_seed_sources(base_sources: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    expanded = dict(base_sources)
    preferred_tag_order = ("coast", "nature", "heritage", "city", "civic")

    for base_source in list(base_sources.values()):
        tags = [tag for tag in preferred_tag_order if tag in set(base_source.get("tags") or [])]
        if not tags:
            tags = ["city"]

        templates: list[tuple[str, str, str, list[str]]] = []
        for tag in tags:
            templates.extend(SCENE_VARIANT_TEMPLATES.get(tag, []))
        if "city" not in tags:
            templates.extend(SCENE_VARIANT_TEMPLATES["city"][:1])

        created = 0
        used_suffixes: set[str] = set()
        place_label = str(base_source.get("label") or base_source.get("scene") or "Brazil").strip()
        for suffix, label_template, scene_template, extra_keywords in templates:
            if suffix in used_suffixes:
                continue
            variant_source_id = f"{base_source['source_id']}-{suffix}"
            if variant_source_id in expanded:
                continue
            used_suffixes.add(suffix)
            variant_source = {
                **base_source,
                "source_id": variant_source_id,
                "slug": slugify(variant_source_id),
                "label": label_template.format(label=place_label, place=place_label),
                "scene": scene_template.format(label=place_label, place=place_label),
                "keywords": unique_ordered([*base_source.get("keywords", []), *extra_keywords]),
                "hero_asset_paths": [],
                "local_asset_path": None,
                "generated_scene_seed": True,
            }
            prepare_source(variant_source)
            expanded[variant_source_id] = variant_source
            created += 1
            if created >= 3:
                break

    return expanded


def clone_source_variant(base_source: dict[str, Any], *, variant_id: str, local_asset_path: str) -> dict[str, Any]:
    source = {
        **base_source,
        "source_id": f"{base_source['source_id']}__{variant_id}",
        "base_source_id": base_source["source_id"],
        "variant_id": variant_id,
        "local_asset_path": local_asset_path,
    }
    return source


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def preferred_section_option(section_data: dict[str, Any]) -> dict[str, Any] | None:
    options = section_data.get("options") or []
    if not options:
        return None

    selected_key = section_data.get("selected_option")
    if selected_key:
        for option in options:
            if option.get("option_key") == selected_key:
                return option

    for option in options:
        if option.get("asset_path"):
            return option

    return options[0]


def write_section_index_csv(image_manifest: dict[str, Any]) -> None:
    routes = image_manifest.get("routes") or {}
    SECTION_INDEX_CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "family",
        "route",
        "page_title",
        "section_index",
        "section_id",
        "section_title",
        "selected_option",
        "asset_folder",
        "asset_filename",
        "asset_public_path",
        "scene",
        "alt",
        "description",
    ]

    with SECTION_INDEX_CSV_PATH.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()

        for route, route_data in sorted(routes.items()):
            sections = route_data.get("sections") or {}
            ordered_sections = sorted(sections.items(), key=lambda item: int(item[1].get("section_index") or 0))
            for section_id, section_data in ordered_sections:
                option = preferred_section_option(section_data) or {}
                seo = option.get("seo") or {}
                writer.writerow(
                    {
                        "family": route_data.get("family") or "",
                        "route": route,
                        "page_title": route_data.get("page_title") or "",
                        "section_index": section_data.get("section_index") or "",
                        "section_id": section_id,
                        "section_title": section_data.get("section_title") or "",
                        "selected_option": section_data.get("selected_option") or option.get("option_key") or "",
                        "asset_folder": seo.get("folder") or "",
                        "asset_filename": seo.get("filename") or "",
                        "asset_public_path": seo.get("public_path") or "",
                        "scene": ((option.get("anchor") or {}).get("scene")) or "",
                        "alt": option.get("alt") or "",
                        "description": option.get("description") or "",
                    }
                )


def curated_manifest_path(args: argparse.Namespace) -> Path:
    raw = str(getattr(args, "curated_manifest_path", "") or "").strip()
    if not raw:
        return CURATED_LIBRARY_MANIFEST_PATH
    path = Path(raw)
    return path if path.is_absolute() else ROOT / path


def route_slug(route: str) -> str:
    if route == "/":
        return "home"
    return slugify(route.strip("/").replace("/", "-"))


def route_asset_parts(route: str) -> list[str]:
    if route == "/":
        return ["home"]
    parts = [slugify(part) for part in route.strip("/").split("/")]
    cleaned = [part for part in parts if part]
    return cleaned or ["home"]


def route_family(route: str, page: dict[str, Any]) -> str:
    runtime = page.get("runtime") or {}
    family = runtime.get("pageFamily")
    if family:
        return family
    if route == "/":
        return "foundation"
    return route.strip("/").split("/")[0] or "site"


def page_title(page: dict[str, Any]) -> str:
    runtime = page.get("runtime") or {}
    if runtime.get("pageTitle"):
        return str(runtime["pageTitle"]).strip()
    meta = page.get("meta") or {}
    title = str(meta.get("title") or "").strip()
    return title.split("|")[0].strip() if title else "Page"


def classify_section_kind(section_id: str) -> str:
    if section_id.startswith("consultation-form"):
        return "cta"
    if section_id == "faq":
        return "faq"
    if section_id.startswith("expansion-"):
        return "expansion"
    if section_id in SKIP_MENU_IDS or section_id.endswith("-menu"):
        return "menu"
    return "core"


def should_include_kind(kind: str, args: argparse.Namespace) -> bool:
    if kind == "core":
        return True
    if kind == "cta":
        return args.include_cta
    if kind == "faq":
        return args.include_faq
    if kind == "menu":
        return args.include_menus
    if kind == "expansion":
        return args.include_expansions
    return False


def section_variant(section) -> str:
    classes = section.get("class") or []
    for value in classes:
        if value.startswith("topic-section--"):
            return value
    if "intro-block" in classes:
        return "intro-block"
    if "highlight-block" in classes:
        return "highlight-block"
    if "lead-form-block" in classes:
        return "lead-form-block"
    return classes[0] if classes else "content-block"


def section_title(section, section_id: str) -> str:
    heading = section.find("h2")
    if heading:
        title = " ".join(heading.stripped_strings).strip()
        if title:
            return title
    data_topic = section.get("data-topic")
    if data_topic:
        return data_topic.strip()
    return humanize_identifier(section_id)


def infer_source_tags(source: dict[str, Any]) -> set[str]:
    text = " ".join(
        [
            source.get("label", ""),
            source.get("scene", ""),
            " ".join(source.get("keywords", [])),
        ]
    )
    normalized = normalize_text(text)
    tags: set[str] = set()
    if any(token in normalized for token in ("skyline", "city", "urban", "capital", "paulista", "porto alegre", "curitiba")):
        tags.add("city")
    if any(token in normalized for token in ("congress", "capital", "monumental", "brasilia")):
        tags.add("civic")
    if any(token in normalized for token in ("historic", "heritage", "pelourinho", "paraty", "ouro preto", "theater")):
        tags.add("heritage")
    if any(token in normalized for token in ("coast", "beach", "bay", "waterfront", "praia")):
        tags.add("coast")
    if any(
        token in normalized
        for token in ("river", "forest", "wetlands", "falls", "park", "dunes", "lagoons", "amazon", "pantanal", "chapada")
    ):
        tags.add("nature")
    if not tags:
        tags.add("city")
    return tags


def load_source_catalog(*, expand_scene_seeds: bool = False) -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]], dict[str, dict[str, Any]], dict[str, list[str]]]:
    manifest = load_json(HERO_MANIFEST_PATH, [])
    curated_library_index = load_curated_library_index()
    route_map: dict[str, dict[str, Any]] = {}
    base_sources: dict[str, dict[str, Any]] = {}
    unique_sources: dict[str, dict[str, Any]] = {}
    family_sources: dict[str, list[str]] = defaultdict(list)

    for item in manifest:
        route = item.get("route")
        if route:
            route_map[route] = item

        source_id = item.get("sourceId") or slugify(item.get("sourceName") or item.get("imageTitle") or "brazil")
        if source_id not in base_sources:
            keywords = item.get("keywords") or []
            label = item.get("sourceName") or item.get("imageTitle") or item.get("title") or source_id
            scene = label
            if keywords:
                scene = keywords[0]
            base_sources[source_id] = {
                "source_id": source_id,
                "slug": slugify(source_id),
                "label": label,
                "scene": scene,
                "keywords": keywords,
                "families": set(),
                "local_asset_path": None,
                "hero_asset_paths": [],
            }
            prepare_source(base_sources[source_id])

        family = item.get("family") or "site"
        base_sources[source_id]["families"].add(family)
        if item.get("path"):
            base_sources[source_id]["hero_asset_paths"].append(item["path"])

    for source in base_sources.values():
        source["families"] = sorted(source["families"])
        source["hero_asset_paths"] = unique_ordered(source.get("hero_asset_paths", []))

    for source_id, label, scene, keywords in EXTRA_BRAZIL_SOURCE_DATA:
        if source_id in base_sources:
            continue
        source = {
            "source_id": source_id,
            "slug": slugify(source_id),
            "label": label,
            "scene": scene,
            "keywords": keywords,
            "families": list(ALL_SITE_FAMILIES),
            "local_asset_path": None,
            "hero_asset_paths": [],
        }
        prepare_source(source)
        base_sources[source_id] = source

    if expand_scene_seeds:
        base_sources = expand_scene_seed_sources(base_sources)

    for base_source_id, base_source in base_sources.items():
        curated_entry = curated_library_index.get(base_source_id) or {}
        assets = curated_entry.get("assets") or []
        if assets:
            for asset in assets:
                variant_source = clone_source_variant(
                    base_source,
                    variant_id=str(asset.get("variant_id") or "v01"),
                    local_asset_path=str(asset["asset_path"]),
                )
                unique_sources[variant_source["source_id"]] = variant_source
                for family in base_source["families"]:
                    if variant_source["source_id"] not in family_sources[family]:
                        family_sources[family].append(variant_source["source_id"])
            continue

        hero_paths = base_source.get("hero_asset_paths") or []
        if hero_paths:
            for index, hero_path in enumerate(hero_paths[:1], start=1):
                variant_source = clone_source_variant(base_source, variant_id=f"hero{index:02d}", local_asset_path=hero_path)
                unique_sources[variant_source["source_id"]] = variant_source
                for family in base_source["families"]:
                    if variant_source["source_id"] not in family_sources[family]:
                        family_sources[family].append(variant_source["source_id"])
            continue

        if base_source.get("generated_scene_seed"):
            continue

        unique_sources[base_source_id] = base_source
        for family in base_source["families"]:
            if base_source_id not in family_sources[family]:
                family_sources[family].append(base_source_id)

    return route_map, base_sources, unique_sources, family_sources


def load_hero_sources() -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]], dict[str, list[str]]]:
    route_map, _base_sources, unique_sources, family_sources = load_source_catalog(expand_scene_seeds=True)
    return route_map, unique_sources, family_sources


def match_intent(section_title_value: str) -> dict[str, Any]:
    normalized = normalize_text(section_title_value)
    for rule in INTENT_RULES:
        if any(token in normalized for token in rule["tokens"]):
            return rule
    return {
        "key": "general",
        "focus_en": "Brazil cinematic background",
        "focus_pt": "fundo cinematografico do Brasil",
        "overlay": "coastal-warm",
        "source_tags": {"city", "coast", "nature", "heritage"},
    }


def family_hint(family: str) -> dict[str, str]:
    return FAMILY_HINTS.get(family, FAMILY_HINTS["foundation"])


def choose_anchor_sources(
    route: str,
    family: str,
    section_index: int,
    section_title_value: str,
    page_title_value: str,
    intent: dict[str, Any],
    used_source_ids: set[str],
    used_base_source_ids: set[str],
    global_source_usage: dict[str, int],
    global_base_source_usage: dict[str, int],
    route_sources: dict[str, dict[str, Any]],
    unique_sources: dict[str, dict[str, Any]],
    family_sources: dict[str, list[str]],
) -> tuple[dict[str, Any], dict[str, Any]]:
    current_entry = route_sources.get(route)
    current_source_id = current_entry.get("sourceId") if current_entry else None
    current_base_source_id = current_source_id
    desired_tags = set(intent.get("source_tags") or ())
    desired_regions = infer_context_regions(route, section_title_value, page_title_value, family, intent.get("key", ""))

    ranked: list[tuple[int, dict[str, Any]]] = []
    seen: set[str] = set()
    for source_id in family_sources.get(family, []):
        source = unique_sources.get(source_id)
        if not source or source_id in seen:
            continue
        base_source_id = source.get("base_source_id") or source["source_id"]
        if source_id == current_source_id or base_source_id == current_base_source_id:
            continue
        seen.add(source_id)
        score = 0
        score += len(desired_tags & set(source.get("tags") or ())) * 15
        score += len(desired_regions & set(source.get("regions") or ())) * 22
        score += 5 if family in (source.get("families") or []) else 0
        score += 6 if source.get("local_asset_path") else 0
        if source_id in used_source_ids:
            score -= 28
        if base_source_id in used_base_source_ids:
            score -= 12
        score -= global_source_usage.get(source_id, 0) * 18
        score -= global_base_source_usage.get(base_source_id, 0) * 8
        ranked.append((score, source))

    if not ranked and current_source_id and current_source_id not in seen and current_source_id in unique_sources:
        source = unique_sources[current_source_id]
        ranked.append((45, source))
        seen.add(current_source_id)

    for source_id, source in unique_sources.items():
        if source_id in seen:
            continue
        base_source_id = source.get("base_source_id") or source["source_id"]
        score = len(desired_tags & set(source.get("tags") or ())) * 10
        score += len(desired_regions & set(source.get("regions") or ())) * 18
        score += 6 if source.get("local_asset_path") else 0
        if source_id in used_source_ids:
            score -= 24
        if base_source_id in used_base_source_ids:
            score -= 10
        score -= global_source_usage.get(source_id, 0) * 16
        score -= global_base_source_usage.get(base_source_id, 0) * 7
        ranked.append((score, source))

    ranked.sort(key=lambda item: (-item[0], item[1]["label"]))
    pool = [item[1] for item in ranked]
    if not pool:
        fallback = {
            "source_id": "brazil-general",
            "slug": "brazil-general",
            "label": "Brazil landscape",
            "scene": "Brazil landscape",
            "keywords": ["Brazil", "landscape"],
            "tags": {"city", "nature"},
            "families": [family],
        }
        return fallback, fallback

    fresh_pool = [
        source
        for source in pool
        if source["source_id"] not in used_source_ids and global_source_usage.get(source["source_id"], 0) == 0
    ]
    fresh_local_pool = [source for source in fresh_pool if source.get("local_asset_path")]
    local_pool = [source for source in pool if source.get("local_asset_path")]
    primary_pool = (
        fresh_local_pool[: min(24, len(fresh_local_pool))]
        or fresh_pool[: min(24, len(fresh_pool))]
        or local_pool[: min(18, len(local_pool))]
        or pool[: min(12, len(pool))]
    )
    primary_seed = f"{route}:{section_index}:{section_title_value}:{intent['key']}"
    primary = primary_pool[stable_index(primary_seed, len(primary_pool))]

    secondary_candidates = [source for source in (fresh_local_pool or fresh_pool or local_pool or pool) if source["source_id"] != primary["source_id"]]
    secondary_window = secondary_candidates[: min(18, len(secondary_candidates))]
    secondary = primary
    secondary_seed = f"{route}:{section_index}:{page_title_value}:{intent['key']}:secondary"
    if secondary_window:
        secondary = secondary_window[stable_index(secondary_seed, len(secondary_window))]
    for source in pool:
        if source["source_id"] != primary["source_id"]:
            if secondary["source_id"] == primary["source_id"]:
                secondary = source
            if source["source_id"] != secondary["source_id"]:
                break
    return primary, secondary


def build_query_list(anchor: dict[str, Any], cue_en: str, cue_pt: str, focus_en: str, focus_pt: str) -> dict[str, list[str]]:
    label = anchor["label"]
    scene = anchor.get("scene") or label
    seeds = query_seed_phrases(anchor)

    en = unique_ordered(
        [
            label,
            scene,
            *seeds[:4],
            f"{label} Brazil",
            f"{scene} Brazil",
            f"{label} Brazil photo",
            f"{label} Brazil panorama",
            f"{label} Brazil landscape",
            f"{label} Brazil {focus_en}",
            f"{label} Brazil {cue_en}",
            *[f"{seed} Brazil" for seed in seeds[1:4]],
        ]
    )
    pt = unique_ordered(
        [
            f"{label} Brasil",
            f"{scene} Brasil",
            *[f"{seed} Brasil" for seed in seeds[:4]],
            f"{label} Brasil foto",
            f"{label} Brasil panorama",
            f"{label} Brasil paisagem",
            f"{label} Brasil fotografia editorial",
            f"{label} Brasil {focus_pt}",
            f"{label} Brasil {cue_pt}",
        ]
    )
    return {"en": en, "pt": pt}


def short_scene_slug(anchor: dict[str, Any], limit: int = 4) -> str:
    tokens: list[str] = []
    for value in [anchor.get("scene", ""), anchor.get("label", ""), *anchor.get("keywords", [])]:
        normalized = normalize_text(str(value or ""))
        if not normalized:
            continue
        for token in normalized.split():
            if len(token) < 4:
                continue
            if token in BRAZIL_MARKERS or token in CONNECTOR_TOKENS:
                continue
            if token in GENERIC_LOCATION_TOKENS and token not in {"coastline", "waterfront", "skyline"}:
                continue
            tokens.append(token)
    short_tokens = unique_ordered(tokens)[:limit]
    return "-".join(short_tokens) if short_tokens else slugify(anchor.get("slug") or anchor.get("label") or "brazil-scene")


def build_option_metadata(
    section_record: dict[str, Any],
    anchor: dict[str, Any],
    option_key: str,
    intent: dict[str, Any],
) -> dict[str, Any]:
    hint = family_hint(section_record["family"])
    queries = build_query_list(
        anchor,
        hint["cue_en"],
        hint["cue_pt"],
        intent["focus_en"],
        intent["focus_pt"],
    )
    family_slug = slugify(section_record["family"])
    page_slug = slugify(section_record["page_title"])
    section_slug = slugify(section_record["section_title"])
    section_number = f"section-{int(section_record['section_index']):02d}"
    section_folder_slug = f"{section_number}-{section_slug}"
    scene_slug = short_scene_slug(anchor)
    option_suffix = "primary" if option_key == "a" else "alternate"
    base_name = page_slug or family_slug or section_record["route_slug"]
    filename = f"{base_name}-{section_number}-{section_slug}-{scene_slug}-brazil-bg-{option_suffix}.webp"
    folder = ASSETS_ROOT.joinpath(*route_asset_parts(section_record["route"]), section_folder_slug)
    public_dir = folder.relative_to(ROOT).as_posix()
    public_path = f"/{public_dir}/{filename}"
    scene = anchor.get("scene") or anchor.get("label") or "Brazil"
    alt = (
        f"Cinematic background of {scene} in Brazil for the {section_record['section_title']} "
        f"section on the {section_record['page_title']} page."
    )
    description = (
        f"{scene} used as a Brazil background for the {section_record['section_title']} section on "
        f"{section_record['page_title']}, supporting content about immigrating to Brazil and promoting Brazilian places."
    )
    keywords = unique_ordered(
        [
            *anchor.get("keywords", []),
            section_record["page_title"],
            section_record["section_title"],
            "immigration to Brazil",
            "moving to Brazil",
            "Brazil background",
        ]
    )
    return {
        "option_key": option_key,
        "anchor": {
            "source_id": anchor["source_id"],
            "base_source_id": anchor.get("base_source_id") or anchor["source_id"],
            "variant_id": anchor.get("variant_id"),
            "label": anchor["label"],
            "scene": scene,
            "slug": anchor["slug"],
            "keywords": anchor.get("keywords", []),
            "local_asset_path": anchor.get("local_asset_path"),
        },
        "queries": queries,
        "seo": {
            "filename": filename,
            "folder": folder.relative_to(ROOT).as_posix(),
            "public_path": public_path,
        },
        "alt": alt,
        "description": description,
        "keywords": keywords,
        "status": "planned",
        "source_validation": build_source_validation_profile(anchor),
        "provider": None,
        "provider_id": None,
        "license": None,
        "license_url": None,
        "creator": None,
        "page_url": None,
        "asset_path": None,
        "hash": None,
        "width": None,
        "height": None,
        "query_used": None,
        "score": None,
        "downloaded_at": None,
        "source_mode": "planned",
    }


def existing_option_index(manifest: dict[str, Any]) -> dict[tuple[str, str, str], dict[str, Any]]:
    index: dict[tuple[str, str, str], dict[str, Any]] = {}
    routes = manifest.get("routes") or {}
    for route, route_data in routes.items():
        sections = route_data.get("sections") or {}
        for section_id, section_data in sections.items():
            for option in section_data.get("options") or []:
                index[(route, section_id, option.get("option_key"))] = option
    return index


def option_has_verified_brazil_source(option: dict[str, Any]) -> bool:
    validation = option.get("source_validation") or {}
    expected_path = ((option.get("seo") or {}).get("public_path") or "").strip()
    return bool(
        option.get("asset_path")
        and validation.get("is_brazil_verified")
        and option.get("asset_path") == expected_path
    )


def merge_existing_option(route: str, section_id: str, option: dict[str, Any], existing_map: dict[tuple[str, str, str], dict[str, Any]]) -> dict[str, Any]:
    existing = existing_map.get((route, section_id, option["option_key"]))
    if not existing or not option_has_verified_brazil_source(existing):
        return option
    if existing.get("provider") != LOCAL_CURATED_PROVIDER:
        return option
    existing_path = ((existing.get("seo") or {}).get("public_path") or "").strip()
    fresh_path = ((option.get("seo") or {}).get("public_path") or "").strip()
    if existing_path != fresh_path:
        return option
    return existing


def extract_sections(args: argparse.Namespace) -> list[dict[str, Any]]:
    sections: list[dict[str, Any]] = []
    page_counter = 0
    for page_json in sorted(CONTENT_ROUTES.rglob("page.json")):
        body_html = page_json.with_name("body.html")
        if not body_html.exists():
            continue

        page = load_json(page_json, {})
        route = page.get("route")
        if not route:
            rel = page_json.parent.relative_to(CONTENT_ROUTES).as_posix()
            route = "/" if rel == "root" else f"/{rel}/"

        family = route_family(route, page)
        if args.family and family != args.family:
            continue
        if args.route and route != args.route:
            continue

        page_counter += 1
        if args.page_limit and page_counter > args.page_limit:
            break

        soup = BeautifulSoup(body_html.read_text(encoding="utf-8"), "html.parser")
        section_counter = 0
        for raw_order, section in enumerate(soup.find_all("section"), start=1):
            section_id = (section.get("id") or "").strip()
            if not section_id:
                continue

            kind = classify_section_kind(section_id)
            if not should_include_kind(kind, args):
                continue

            section_counter += 1
            title = section_title(section, section_id)
            sections.append(
                {
                    "route": route,
                    "route_slug": route_slug(route),
                    "family": family,
                    "page_title": page_title(page),
                    "page_json_path": str(page_json.relative_to(ROOT)),
                    "body_path": str(body_html.relative_to(ROOT)),
                    "section_id": section_id,
                    "section_title": title,
                    "section_index": section_counter,
                    "raw_order": raw_order,
                    "section_kind": kind,
                    "section_variant": section_variant(section),
                }
            )

            if args.section_limit and section_counter >= args.section_limit:
                break

    return sections


def selection_lookup() -> dict[str, dict[str, str]]:
    payload = load_json(SELECTION_PATH, {})
    return payload if isinstance(payload, dict) else {}


class SearchClients:
    def __init__(self, pixabay_key: str | None) -> None:
        self.pixabay_key = pixabay_key
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})
        self.cache: dict[tuple[str, str, int], list[dict[str, Any]]] = {}

    def search_pixabay(self, query: str, per_page: int = DOWNLOAD_PER_PAGE) -> list[dict[str, Any]]:
        cache_key = ("pixabay", query, per_page)
        if cache_key in self.cache:
            return self.cache[cache_key]
        if not self.pixabay_key:
            return []
        response = self.session.get(
            "https://pixabay.com/api/",
            params={
                "key": self.pixabay_key,
                "q": query,
                "image_type": "photo",
                "orientation": "horizontal",
                "order": "popular",
                "safesearch": "true",
                "per_page": per_page,
            },
            timeout=DEFAULT_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
        results: list[dict[str, Any]] = []
        for item in data.get("hits", []):
            tags = [tag.strip() for tag in str(item.get("tags") or "").split(",") if tag.strip()]
            results.append(
                {
                    "provider": "pixabay",
                    "provider_id": f"pixabay:{item.get('id')}",
                    "title": item.get("tags") or "Pixabay photo",
                    "tags": tags,
                    "creator": item.get("user"),
                    "creator_url": None,
                    "license": "Pixabay License",
                    "license_url": DEFAULT_PIXABAY_LICENSE_URL,
                    "page_url": item.get("pageURL"),
                    "image_url": item.get("largeImageURL") or item.get("webformatURL"),
                    "thumbnail_url": item.get("webformatURL") or item.get("previewURL"),
                    "width": item.get("imageWidth"),
                    "height": item.get("imageHeight"),
                    "raw_popularity": int(item.get("likes") or 0) + int(item.get("downloads") or 0),
                }
            )
        self.cache[cache_key] = results
        return results

    def search_openverse(self, query: str, per_page: int = DOWNLOAD_PER_PAGE) -> list[dict[str, Any]]:
        cache_key = ("openverse", query, per_page)
        if cache_key in self.cache:
            return self.cache[cache_key]
        response = self.session.get(
            "https://api.openverse.org/v1/images/",
            params={"q": query, "page_size": per_page},
            timeout=DEFAULT_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
        results: list[dict[str, Any]] = []
        for item in data.get("results", []):
            tags = [tag.get("name") for tag in item.get("tags", []) if tag.get("name")]
            results.append(
                {
                    "provider": "openverse",
                    "provider_id": f"openverse:{item.get('id')}",
                    "title": item.get("title") or "Openverse image",
                    "tags": tags,
                    "creator": item.get("creator"),
                    "creator_url": item.get("creator_url"),
                    "license": item.get("license"),
                    "license_url": item.get("license_url"),
                    "page_url": item.get("foreign_landing_url") or item.get("detail_url"),
                    "image_url": item.get("url"),
                    "thumbnail_url": item.get("thumbnail"),
                    "width": item.get("width"),
                    "height": item.get("height"),
                    "raw_popularity": 0,
                }
            )
        self.cache[cache_key] = results
        return results

    def search_wikimedia(self, query: str, per_page: int = DOWNLOAD_PER_PAGE) -> list[dict[str, Any]]:
        cache_key = ("wikimedia", query, per_page)
        if cache_key in self.cache:
            return self.cache[cache_key]
        response = self.session.get(
            "https://commons.wikimedia.org/w/api.php",
            params={
                "action": "query",
                "format": "json",
                "generator": "search",
                "gsrsearch": query,
                "gsrlimit": per_page,
                "gsrnamespace": 6,
                "prop": "imageinfo",
                "iiprop": "url|size|extmetadata",
            },
            timeout=DEFAULT_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
        pages = data.get("query", {}).get("pages", {})
        results: list[dict[str, Any]] = []
        for page in pages.values():
            imageinfo = (page.get("imageinfo") or [None])[0]
            if not imageinfo or not imageinfo.get("url"):
                continue
            metadata = imageinfo.get("extmetadata") or {}
            license_value = (metadata.get("LicenseShortName") or {}).get("value")
            license_url = (metadata.get("LicenseUrl") or {}).get("value")
            creator = (metadata.get("Artist") or {}).get("value")
            title = (metadata.get("ObjectName") or {}).get("value") or page.get("title")
            page_id = page.get("pageid")
            results.append(
                {
                    "provider": "wikimedia",
                    "provider_id": f"wikimedia:{page_id}",
                    "title": title or page.get("title") or "Wikimedia Commons image",
                    "tags": [page.get("title") or ""],
                    "creator": creator,
                    "creator_url": None,
                    "license": license_value,
                    "license_url": license_url,
                    "page_url": f"https://commons.wikimedia.org/wiki?curid={page_id}",
                    "image_url": imageinfo.get("url"),
                    "thumbnail_url": imageinfo.get("thumburl") or imageinfo.get("url"),
                    "width": imageinfo.get("width"),
                    "height": imageinfo.get("height"),
                    "raw_popularity": 0,
                }
            )
        self.cache[cache_key] = results
        return results


def normalize_candidate_text(candidate: dict[str, Any]) -> str:
    values = [
        candidate.get("title") or "",
        " ".join(candidate.get("tags") or []),
        candidate.get("page_url") or "",
        candidate.get("image_url") or "",
        candidate.get("creator") or "",
    ]
    return normalize_text(" ".join(values))


def phrase_tokens(*values: str) -> list[str]:
    tokens: list[str] = []
    for value in values:
        normalized = normalize_text(value)
        if not normalized:
            continue
        if len(normalized) >= 4:
            tokens.append(normalized)
        tokens.extend([part for part in normalized.split() if len(part) >= 4])
    return unique_ordered(tokens)


def validate_candidate(
    candidate: dict[str, Any],
    option: dict[str, Any],
    *,
    require_horizontal: bool = True,
    min_width: int = MIN_IMAGE_WIDTH,
) -> dict[str, Any]:
    width = int(candidate.get("width") or 0)
    height = int(candidate.get("height") or 0)
    if not candidate.get("image_url"):
        return {"is_brazil_verified": False, "reason": "missing-image-url"}
    if width and width < min_width:
        return {"is_brazil_verified": False, "reason": "too-small"}
    if require_horizontal and width and height and width <= height:
        return {"is_brazil_verified": False, "reason": "not-horizontal"}

    normalized = normalize_candidate_text(candidate)
    place_terms = (option.get("source_validation") or {}).get("required_place_terms") or []
    support_terms = (option.get("source_validation") or {}).get("support_terms") or []

    place_matches = [term for term in place_terms if term in normalized]
    support_matches = [term for term in support_terms if term in normalized and term not in place_matches]
    brazil_matches = [term for term in BRAZIL_MARKERS if term in normalized]
    negative_matches = [term for term in NEGATIVE_TOKENS if term in normalized]

    if negative_matches:
        return {
            "is_brazil_verified": False,
            "reason": "negative-token-match",
            "matched_negative_terms": negative_matches[:8],
        }

    if not place_matches:
        return {"is_brazil_verified": False, "reason": "missing-place-match"}

    has_context = bool(brazil_matches or support_matches)
    ambiguous_only = bool(place_matches) and all(" " not in term and term in AMBIGUOUS_PLACE_TOKENS for term in place_matches)

    if candidate.get("provider") == "pixabay" and not has_context:
        return {"is_brazil_verified": False, "reason": "pixabay-needs-brazil-context"}

    if ambiguous_only and not has_context:
        return {"is_brazil_verified": False, "reason": "ambiguous-place-without-context"}

    return {
        "is_brazil_verified": True,
        "matched_place_terms": place_matches[:8],
        "matched_support_terms": support_matches[:8],
        "matched_brazil_terms": brazil_matches[:8],
        "provider_confidence": "strict" if has_context else "place-match",
    }


def score_candidate(
    candidate: dict[str, Any],
    validation: dict[str, Any],
    positive_tokens: list[str],
    focus_tokens: list[str],
) -> int:
    width = int(candidate.get("width") or 0)
    height = int(candidate.get("height") or 0)
    score = 0

    if width >= 1800:
        score += 12
    elif width >= 1400:
        score += 8
    elif width >= MIN_IMAGE_WIDTH:
        score += 4

    if width and height:
        ratio = width / max(height, 1)
        if ratio >= 1.7:
            score += 8
        elif ratio >= 1.35:
            score += 4

    normalized = normalize_candidate_text(candidate)
    for token in positive_tokens:
        if token and token in normalized:
            score += 8

    for token in focus_tokens:
        if token and token in normalized:
            score += 4

    score += len(validation.get("matched_place_terms") or []) * 22
    score += len(validation.get("matched_support_terms") or []) * 10
    score += len(validation.get("matched_brazil_terms") or []) * 10
    score += PROVIDER_SCORE_BOOST.get(candidate.get("provider") or "", 0)
    score += min(int(candidate.get("raw_popularity") or 0) // 250, 8)
    return score


def read_pixabay_key() -> str | None:
    env_key = os.environ.get("PIXABAY_API_KEY", "").strip()
    if env_key:
        return env_key
    try:
        legacy = yaml.safe_load(LEGACY_CONFIG_PATH.read_text(encoding="utf-8"))
    except Exception:
        legacy = None
    if isinstance(legacy, dict):
        api = legacy.get("api") or {}
        key = str(api.get("pixabay_key") or "").strip()
        return key or None
    return None


def download_and_convert(session: requests.Session, candidate: dict[str, Any], output_path: Path) -> tuple[str, int, int]:
    response = session.get(candidate["image_url"], timeout=DEFAULT_TIMEOUT)
    response.raise_for_status()
    source_bytes = response.content
    digest = hashlib.sha256(source_bytes).hexdigest()
    with Image.open(io.BytesIO(source_bytes)) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGB")
        elif image.mode == "RGBA":
            background = Image.new("RGB", image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background

        width, height = image.size
        if width < MIN_IMAGE_WIDTH or width <= height:
            raise ValueError(f"Image too small or not horizontal ({width}x{height})")

        if width > MAX_IMAGE_WIDTH:
            ratio = MAX_IMAGE_WIDTH / width
            image = image.resize((MAX_IMAGE_WIDTH, int(height * ratio)), Image.Resampling.LANCZOS)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(output_path, format="WEBP", quality=WEBP_QUALITY, method=6)
        saved_width, saved_height = image.size
    return digest, saved_width, saved_height


def download_source_asset(session: requests.Session, candidate: dict[str, Any], output_path: Path) -> tuple[str, int, int]:
    response = session.get(candidate["image_url"], timeout=DEFAULT_TIMEOUT)
    response.raise_for_status()
    source_bytes = response.content
    digest = hashlib.sha256(source_bytes).hexdigest()
    with Image.open(io.BytesIO(source_bytes)) as image:
        image = normalize_pil_image(image)
        width, height = image.size
        if min(width, height) < 320:
            raise ValueError(f"Image too small for curated library ({width}x{height})")

        if width > MAX_IMAGE_WIDTH:
            ratio = MAX_IMAGE_WIDTH / width
            image = image.resize((MAX_IMAGE_WIDTH, max(int(height * ratio), 1)), Image.Resampling.LANCZOS)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(output_path, format="WEBP", quality=WEBP_QUALITY, method=6)
        saved_width, saved_height = image.size
    return digest, saved_width, saved_height


def normalize_pil_image(image: Image.Image) -> Image.Image:
    image = ImageOps.exif_transpose(image)
    if image.mode not in {"RGB", "RGBA"}:
        return image.convert("RGB")
    if image.mode == "RGBA":
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[-1])
        return background
    return image


def compose_section_canvas(image: Image.Image) -> Image.Image:
    target_width, target_height = SECTION_CANVAS
    backdrop = ImageOps.fit(image.copy(), SECTION_CANVAS, Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    backdrop = backdrop.filter(ImageFilter.GaussianBlur(radius=22))
    backdrop = Image.blend(backdrop, Image.new("RGB", SECTION_CANVAS, (7, 16, 13)), 0.28)

    foreground = ImageOps.contain(
        image,
        (int(target_width * 0.9), int(target_height * 0.9)),
        Image.Resampling.LANCZOS,
    )
    canvas = backdrop.copy()
    left = (target_width - foreground.width) // 2
    top = (target_height - foreground.height) // 2
    canvas.paste(foreground, (left, top))
    return canvas


def source_queries(source: dict[str, Any]) -> list[str]:
    seeds = query_seed_phrases(source)
    place_terms = build_phrase_variants(source.get("label", ""))[:4]
    support_terms = build_phrase_variants(source.get("scene", ""))[:4]
    keyword_terms = unique_ordered(term for keyword in (source.get("keywords") or []) for term in build_phrase_variants(keyword))[:6]
    queries = unique_ordered(
        [
            f"{source.get('label', '')} Brazil",
            f"{source.get('scene', '')} Brazil",
            f"{source.get('label', '')} Brasil",
            *[f"{seed} Brazil" for seed in seeds[:4]],
            *[f"{term} Brazil" for term in place_terms],
            *[f"{term} Brasil" for term in place_terms[:2]],
            *[f"{term} Brazil" for term in support_terms[:2]],
            *[f"{term} Brazil" for term in keyword_terms[:3]],
        ]
    )
    return [query for query in queries if query.strip()][:10]


def curated_source_queries(source: dict[str, Any]) -> list[str]:
    label = str(source.get("label") or "").strip()
    scene = str(source.get("scene") or label).strip()
    place_terms = build_phrase_variants(label)[:1]
    queries = unique_ordered(
        [
            f"{label} Brazil",
            f"{scene} Brazil",
            f"{label} Brasil",
            *[f"{term} Brazil" for term in place_terms],
        ]
    )
    return [query for query in queries if query.strip()][:CURATED_QUERY_LIMIT]


def curated_asset_output_path(source: dict[str, Any], variant_id: str = "v01") -> tuple[str, Path]:
    region = next((value for value in source.get("regions", []) if value != "national"), "national")
    region_slug = slugify(region)
    filename = f"brazil-{source['slug']}-{slugify(variant_id)}.webp"
    relative = f"/assets/images/curated-brazil/{region_slug}/{filename}"
    return relative, ROOT / relative.lstrip("/")


def choose_candidates_for_source(
    clients: SearchClients,
    provider_order: tuple[str, ...],
    source: dict[str, Any],
    seen_provider_ids: set[str],
    limit: int,
) -> list[dict[str, Any]]:
    option_stub = {"source_validation": build_source_validation_profile(source)}
    positive_tokens = phrase_tokens(source.get("label", ""), source.get("scene", ""), " ".join(source.get("keywords", [])))
    focus_tokens = phrase_tokens(source.get("region_label", ""), "Brazil", "Brasil")
    ranked_candidates: list[tuple[int, dict[str, Any]]] = []
    local_seen: set[str] = set()
    target_buffer = max(limit * CURATED_CANDIDATE_BUFFER_MULTIPLIER, limit)

    for provider_name in provider_order:
        for query in curated_source_queries(source):
            try:
                if provider_name == "pixabay":
                    candidates = clients.search_pixabay(query, per_page=max(CURATED_DOWNLOAD_PER_PAGE, limit * 2))
                elif provider_name == "openverse":
                    candidates = clients.search_openverse(query, per_page=max(CURATED_DOWNLOAD_PER_PAGE, limit * 2))
                elif provider_name == "wikimedia":
                    candidates = clients.search_wikimedia(query, per_page=max(CURATED_DOWNLOAD_PER_PAGE, limit * 2))
                else:
                    continue
            except Exception:
                continue

            for candidate in candidates:
                provider_id = candidate.get("provider_id")
                if provider_id in seen_provider_ids or provider_id in local_seen:
                    continue
                validation = validate_candidate(candidate, option_stub, require_horizontal=False, min_width=900)
                if not validation.get("is_brazil_verified"):
                    continue
                score = score_candidate(candidate, validation, positive_tokens, focus_tokens)
                if score < 30:
                    continue
                if int(candidate.get("width") or 0) and int(candidate.get("height") or 0):
                    if int(candidate["width"]) > int(candidate["height"]):
                        score += 10
                    ratio = int(candidate["width"]) / max(int(candidate["height"]), 1)
                    if 1.7 <= ratio <= 2.05:
                        score += 8
                candidate["source_validation"] = validation
                candidate["query_used"] = query
                candidate["score"] = score
                local_seen.add(provider_id)
                ranked_candidates.append((score, candidate))
                if len(ranked_candidates) >= target_buffer:
                    break
            if len(ranked_candidates) >= target_buffer:
                break
        if len(ranked_candidates) >= target_buffer:
            break

    ranked_candidates.sort(key=lambda item: (-item[0], item[1].get("provider_id") or ""))
    return [candidate for _score, candidate in ranked_candidates]


def bootstrap_curated_library(args: argparse.Namespace) -> dict[str, Any]:
    manifest_path = curated_manifest_path(args)
    existing_payload = load_json(manifest_path, {})
    if not isinstance(existing_payload, dict):
        existing_payload = {}
    existing_sources_raw = dict(existing_payload.get("sources") or {})
    existing_sources: dict[str, dict[str, Any]] = {}
    for source_id, payload in existing_sources_raw.items():
        if not isinstance(payload, dict):
            continue
        assets = normalize_curated_assets(source_id, payload)
        normalized_payload = {**payload, "assets": assets}
        if assets and not normalized_payload.get("asset_path"):
            normalized_payload["asset_path"] = assets[0]["asset_path"]
        existing_sources[source_id] = normalized_payload

    route_sources, base_sources, _unique_sources, _family_sources = load_source_catalog(
        expand_scene_seeds=bool(getattr(args, "bootstrap_expanded_scenes", False))
    )
    del route_sources

    pixabay_key = read_pixabay_key()
    clients = SearchClients(pixabay_key)
    provider_order = tuple(item.strip() for item in (args.providers or ",".join(DEFAULT_PROVIDER_ORDER)).split(",") if item.strip())
    target_variants = max(int(args.curated_variants_per_source or DEFAULT_CURATED_VARIANTS_PER_SOURCE), 1)
    source_step = max(int(getattr(args, "curated_source_step", 1) or 1), 1)
    source_offset = int(getattr(args, "curated_source_offset", 0) or 0)

    seen_provider_ids: set[str] = set()
    seen_hashes: set[str] = set()
    if not args.refresh_curated_library:
        for payload in existing_sources.values():
            for asset in payload.get("assets") or []:
                provider_id = asset.get("provider_id")
                digest = asset.get("hash")
                if provider_id:
                    seen_provider_ids.add(provider_id)
                if digest:
                    seen_hashes.add(digest)

    downloaded_now = 0
    source_items = sorted(base_sources.values(), key=lambda item: item["label"])
    if source_step > 1:
        source_items = [source for index, source in enumerate(source_items) if index % source_step == source_offset]
    total = len(source_items)

    for index, source in enumerate(source_items, start=1):
        existing_entry = existing_sources.get(source["source_id"]) or {
            "source_id": source["source_id"],
            "label": source["label"],
            "scene": source.get("scene"),
            "keywords": source.get("keywords", []),
            "tags": source.get("tags", []),
            "regions": source.get("regions", []),
            "assets": [],
        }
        existing_assets = [] if args.refresh_curated_library else normalize_curated_assets(source["source_id"], existing_entry)
        if len(existing_assets) >= target_variants:
            continue

        candidates = choose_candidates_for_source(
            clients,
            provider_order,
            source,
            seen_provider_ids,
            max(target_variants - len(existing_assets), 1),
        )
        if candidates:
            for candidate in candidates:
                if len(existing_assets) >= target_variants:
                    break
                variant_id = f"v{len(existing_assets) + 1:02d}"
                local_rel, output_path = curated_asset_output_path(source, variant_id)
                try:
                    digest, width, height = download_source_asset(clients.session, candidate, output_path)
                except (requests.RequestException, UnidentifiedImageError, OSError, ValueError):
                    continue

                if digest in seen_hashes or any(asset.get("hash") == digest for asset in existing_assets):
                    output_path.unlink(missing_ok=True)
                    continue

                existing_assets.append(
                    {
                        "variant_id": variant_id,
                        "base_source_id": source["source_id"],
                        "asset_path": local_rel,
                        "provider": candidate.get("provider"),
                        "provider_id": candidate.get("provider_id"),
                        "license": candidate.get("license"),
                        "license_url": candidate.get("license_url"),
                        "creator": candidate.get("creator"),
                        "page_url": candidate.get("page_url"),
                        "query_used": candidate.get("query_used"),
                        "score": candidate.get("score"),
                        "hash": digest,
                        "width": width,
                        "height": height,
                        "downloaded_at": now_iso(),
                    }
                )
                if candidate.get("provider_id"):
                    seen_provider_ids.add(candidate["provider_id"])
                seen_hashes.add(digest)
                downloaded_now += 1

        existing_sources[source["source_id"]] = {
            "source_id": source["source_id"],
            "label": source["label"],
            "scene": source.get("scene"),
            "keywords": source.get("keywords", []),
            "tags": source.get("tags", []),
            "regions": source.get("regions", []),
            "asset_path": existing_assets[0]["asset_path"] if existing_assets else None,
            "provider": existing_assets[0].get("provider") if existing_assets else None,
            "provider_id": existing_assets[0].get("provider_id") if existing_assets else None,
            "license": existing_assets[0].get("license") if existing_assets else None,
            "license_url": existing_assets[0].get("license_url") if existing_assets else None,
            "creator": existing_assets[0].get("creator") if existing_assets else None,
            "page_url": existing_assets[0].get("page_url") if existing_assets else None,
            "query_used": existing_assets[0].get("query_used") if existing_assets else None,
            "score": existing_assets[0].get("score") if existing_assets else None,
            "hash": existing_assets[0].get("hash") if existing_assets else None,
            "width": existing_assets[0].get("width") if existing_assets else None,
            "height": existing_assets[0].get("height") if existing_assets else None,
            "downloaded_at": existing_assets[0].get("downloaded_at") if existing_assets else None,
            "assets": existing_assets,
        }

        if index % 10 == 0 or downloaded_now:
            payload = {
                "version": QUERY_VERSION,
                "generated_at": now_iso(),
                "summary": {
                    "sources": len(existing_sources),
                    "downloaded_now": downloaded_now,
                    "assets": sum(len((item.get("assets") or [])) for item in existing_sources.values()),
                    "target_variants_per_source": target_variants,
                    "source_offset": source_offset,
                    "source_step": source_step,
                },
                "sources": dict(sorted(existing_sources.items())),
            }
            write_json(manifest_path, payload)
            print(
                f"[curated-brazil] progress sources={index}/{total} downloaded={downloaded_now} "
                f"assets={len(existing_assets)} source={source['label']}",
                file=sys.stderr,
            )

    payload = {
        "version": QUERY_VERSION,
        "generated_at": now_iso(),
        "summary": {
            "sources": len(existing_sources),
            "downloaded_now": downloaded_now,
            "assets": sum(len((item.get("assets") or [])) for item in existing_sources.values()),
            "target_variants_per_source": target_variants,
            "source_offset": source_offset,
            "source_step": source_step,
        },
        "sources": dict(sorted(existing_sources.items())),
    }
    write_json(manifest_path, payload)
    return payload


def local_asset_candidate(option: dict[str, Any]) -> dict[str, Any] | None:
    anchor = option.get("anchor") or {}
    local_asset_path = anchor.get("local_asset_path")
    if not local_asset_path:
        return None
    full_path = ROOT / str(local_asset_path).lstrip("/")
    if not full_path.exists():
        return None
    validation = {
        "is_brazil_verified": True,
        "matched_place_terms": [normalize_text(anchor.get("label") or "")],
        "matched_support_terms": [],
        "matched_brazil_terms": ["brazil"],
        "provider_confidence": "curated-local",
    }
    return {
        "provider": LOCAL_CURATED_PROVIDER,
        "provider_id": f"{LOCAL_CURATED_PROVIDER}:{slugify((option.get('seo') or {}).get('public_path') or anchor.get('source_id') or 'brazil')}",
        "title": anchor.get("label"),
        "tags": anchor.get("keywords") or [],
        "creator": "Immigrate to Brazil curated Brazil library",
        "creator_url": None,
        "license": "Curated local Brazil source",
        "license_url": None,
        "page_url": local_asset_path,
        "image_url": None,
        "local_path": str(full_path),
        "width": None,
        "height": None,
        "raw_popularity": 0,
        "source_validation": validation,
        "query_used": anchor.get("label"),
        "score": 999,
        "source_mode": "local-curated",
    }


def copy_local_curated_image(candidate: dict[str, Any], output_path: Path) -> tuple[str, int, int]:
    source_path = Path(candidate["local_path"])
    cache_key = str(source_path.resolve())
    cached = LOCAL_CURATED_RENDER_CACHE.get(cache_key)
    if cached:
        rendered_bytes, digest, saved_width, saved_height = cached
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(rendered_bytes)
        return digest, saved_width, saved_height

    source_bytes = source_path.read_bytes()
    digest = hashlib.sha256(source_bytes).hexdigest()
    with Image.open(source_path) as image:
        image = normalize_pil_image(image)
        width, height = image.size
        if min(width, height) < 320:
            raise ValueError(f"Local curated image too small ({width}x{height})")

        image = compose_section_canvas(image)
        buffer = io.BytesIO()
        image.save(buffer, format="WEBP", quality=WEBP_QUALITY, method=6)
        rendered_bytes = buffer.getvalue()
        saved_width, saved_height = image.size

    LOCAL_CURATED_RENDER_CACHE[cache_key] = (rendered_bytes, digest, saved_width, saved_height)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(rendered_bytes)
    return digest, saved_width, saved_height


def build_section_manifests(args: argparse.Namespace) -> tuple[dict[str, Any], dict[str, Any]]:
    route_sources, unique_sources, family_sources = load_hero_sources()
    previous_image_manifest = load_json(IMAGE_MANIFEST_PATH, {})
    previous_option_map = existing_option_index(previous_image_manifest if isinstance(previous_image_manifest, dict) else {})
    selections = selection_lookup()

    sections = extract_sections(args)
    query_routes: dict[str, Any] = {}
    image_routes: dict[str, Any] = {}
    route_anchor_usage: dict[str, set[str]] = defaultdict(set)
    route_base_anchor_usage: dict[str, set[str]] = defaultdict(set)
    global_anchor_usage: dict[str, int] = defaultdict(int)
    global_base_anchor_usage: dict[str, int] = defaultdict(int)

    for section in sections:
        intent = match_intent(section["section_title"])
        overlay = OVERLAY_PRESETS[intent["overlay"]]
        primary_anchor, secondary_anchor = choose_anchor_sources(
            section["route"],
            section["family"],
            section["section_index"],
            section["section_title"],
            section["page_title"],
            intent,
            route_anchor_usage[section["route"]],
            route_base_anchor_usage[section["route"]],
            global_anchor_usage,
            global_base_anchor_usage,
            route_sources,
            unique_sources,
            family_sources,
        )
        route_anchor_usage[section["route"]].add(primary_anchor["source_id"])
        route_anchor_usage[section["route"]].add(secondary_anchor["source_id"])
        route_base_anchor_usage[section["route"]].add(primary_anchor.get("base_source_id") or primary_anchor["source_id"])
        route_base_anchor_usage[section["route"]].add(secondary_anchor.get("base_source_id") or secondary_anchor["source_id"])
        global_anchor_usage[primary_anchor["source_id"]] += 1
        global_anchor_usage[secondary_anchor["source_id"]] += 1
        global_base_anchor_usage[primary_anchor.get("base_source_id") or primary_anchor["source_id"]] += 1
        global_base_anchor_usage[secondary_anchor.get("base_source_id") or secondary_anchor["source_id"]] += 1

        options = [
            build_option_metadata(section, primary_anchor, "a", intent),
            build_option_metadata(section, secondary_anchor, "b", intent),
        ]
        options = [merge_existing_option(section["route"], section["section_id"], option, previous_option_map) for option in options]

        route_query_payload = query_routes.setdefault(
            section["route"],
            {
                "route": section["route"],
                "route_slug": section["route_slug"],
                "family": section["family"],
                "page_title": section["page_title"],
                "sections": {},
            },
        )
        route_image_payload = image_routes.setdefault(
            section["route"],
            {
                "route": section["route"],
                "route_slug": section["route_slug"],
                "family": section["family"],
                "page_title": section["page_title"],
                "sections": {},
            },
        )

        query_section = {
            "section_id": section["section_id"],
            "section_title": section["section_title"],
            "section_index": section["section_index"],
            "section_kind": section["section_kind"],
            "section_variant": section["section_variant"],
            "overlay": overlay,
            "intent": intent["key"],
            "body_path": section["body_path"],
            "page_json_path": section["page_json_path"],
            "options": [
                {
                    "option_key": option["option_key"],
                    "anchor": option["anchor"],
                    "queries": option["queries"],
                    "seo": option["seo"],
                    "alt": option["alt"],
                    "description": option["description"],
                    "keywords": option["keywords"],
                }
                for option in options
            ],
        }
        image_section = {
            "section_id": section["section_id"],
            "section_title": section["section_title"],
            "section_index": section["section_index"],
            "section_kind": section["section_kind"],
            "section_variant": section["section_variant"],
            "overlay": overlay,
            "intent": intent["key"],
            "body_path": section["body_path"],
            "page_json_path": section["page_json_path"],
            "selected_option": "a",
            "options": options,
        }

        preferred = (selections.get(section["route"]) or {}).get(section["section_id"])
        if preferred in {"a", "b"}:
            image_section["selected_option"] = preferred

        route_query_payload["sections"][section["section_id"]] = query_section
        route_image_payload["sections"][section["section_id"]] = image_section

    query_manifest = {
        "version": QUERY_VERSION,
        "generated_at": now_iso(),
        "summary": manifest_summary(query_routes),
        "routes": dict(sorted(query_routes.items())),
    }
    image_summary = manifest_summary(image_routes)
    image_summary["downloaded_options"] = downloaded_option_count(image_routes)
    image_manifest = {
        "version": QUERY_VERSION,
        "generated_at": now_iso(),
        "summary": image_summary,
        "routes": dict(sorted(image_routes.items())),
    }
    return query_manifest, image_manifest


def seed_dedupe_from_manifest(image_manifest: dict[str, Any]) -> tuple[set[str], set[str]]:
    provider_ids: set[str] = set()
    hashes: set[str] = set()
    for route_data in (image_manifest.get("routes") or {}).values():
        for section_data in (route_data.get("sections") or {}).values():
            for option in section_data.get("options") or []:
                if option.get("provider_id"):
                    provider_ids.add(option["provider_id"])
                if option.get("hash"):
                    hashes.add(option["hash"])
    return provider_ids, hashes


def plan_positive_tokens(option: dict[str, Any]) -> list[str]:
    anchor = option.get("anchor") or {}
    return phrase_tokens(
        anchor.get("label", ""),
        anchor.get("scene", ""),
        " ".join(anchor.get("keywords") or []),
    )


def plan_focus_tokens(section_data: dict[str, Any]) -> list[str]:
    return phrase_tokens(section_data.get("section_title", ""), section_data.get("page_title", ""), section_data.get("intent", ""))


def download_queries_for_provider(option: dict[str, Any], provider_name: str) -> list[str]:
    queries_en = option["queries"]["en"][:4]
    queries_pt = option["queries"]["pt"][:2]
    if provider_name == "pixabay":
        prioritized = [query for query in [*queries_en, *queries_pt] if "Brazil" in query or "Brasil" in query]
        return unique_ordered(prioritized[:4] or [*queries_en[:2], *queries_pt[:1]])
    return unique_ordered([*queries_en, *queries_pt][:4])


def choose_candidate_for_option(
    clients: SearchClients,
    provider_order: tuple[str, ...],
    option: dict[str, Any],
    section_data: dict[str, Any],
    seen_provider_ids: set[str],
    seen_hashes: set[str],
) -> dict[str, Any] | None:
    positive_tokens = plan_positive_tokens(option)
    focus_tokens = plan_focus_tokens(section_data)

    for provider_name in provider_order:
        for query in download_queries_for_provider(option, provider_name):
            try:
                if provider_name == "pixabay":
                    candidates = clients.search_pixabay(query)
                elif provider_name == "openverse":
                    candidates = clients.search_openverse(query)
                elif provider_name == "wikimedia":
                    candidates = clients.search_wikimedia(query)
                else:
                    continue
            except Exception:
                continue

            ranked: list[tuple[int, dict[str, Any]]] = []
            for candidate in candidates:
                if candidate.get("provider_id") in seen_provider_ids:
                    continue
                validation = validate_candidate(candidate, option)
                if not validation.get("is_brazil_verified"):
                    continue
                score = score_candidate(candidate, validation, positive_tokens, focus_tokens)
                if score < 36:
                    continue
                candidate["source_validation"] = validation
                ranked.append((score, candidate))

            ranked.sort(key=lambda item: (-item[0], item[1].get("provider_id") or ""))
            if not ranked:
                continue

            score, candidate = ranked[0]
            candidate["score"] = score
            candidate["query_used"] = query
            return candidate
    return None


def ordered_section_options(section_data: dict[str, Any], selected_only: bool) -> list[dict[str, Any]]:
    options = list(section_data.get("options", []))
    if not selected_only:
        return options

    by_key = {option.get("option_key"): option for option in options}
    ordered: list[dict[str, Any]] = []
    selected_key = section_data.get("selected_option")
    if selected_key in {"a", "b"} and by_key.get(selected_key):
        ordered.append(by_key[selected_key])
    for fallback_key in ("a", "b"):
        option = by_key.get(fallback_key)
        if option and option not in ordered:
            ordered.append(option)
    return ordered


def section_has_verified_selection(section_data: dict[str, Any]) -> bool:
    selected_key = section_data.get("selected_option")
    if selected_key in {"a", "b"}:
        for option in section_data.get("options", []):
            if option.get("option_key") == selected_key and option_has_verified_brazil_source(option):
                return True
    return any(option_has_verified_brazil_source(option) for option in section_data.get("options", []))


def choose_verified_option_key(section_data: dict[str, Any]) -> str | None:
    selected_key = section_data.get("selected_option")
    if selected_key in {"a", "b"}:
        for option in section_data.get("options", []):
            if option.get("option_key") == selected_key and option_has_verified_brazil_source(option):
                return selected_key
    for option in section_data.get("options", []):
        if option_has_verified_brazil_source(option):
            return option.get("option_key")
    return None


def apply_downloaded_option(option: dict[str, Any], candidate: dict[str, Any], local_rel: str, digest: str, width: int, height: int) -> None:
    option["status"] = "downloaded"
    option["source_validation"] = candidate.get("source_validation") or option.get("source_validation") or {}
    option["provider"] = candidate["provider"]
    option["provider_id"] = candidate["provider_id"]
    option["license"] = candidate.get("license")
    option["license_url"] = candidate.get("license_url")
    option["creator"] = candidate.get("creator")
    option["page_url"] = candidate.get("page_url")
    option["asset_path"] = local_rel
    option["hash"] = digest
    option["width"] = width
    option["height"] = height
    option["query_used"] = candidate.get("query_used")
    option["score"] = candidate.get("score")
    option["downloaded_at"] = now_iso()
    option["source_mode"] = candidate.get("source_mode") or "downloaded"


def download_candidates(args: argparse.Namespace, image_manifest: dict[str, Any]) -> dict[str, Any]:
    pixabay_key = read_pixabay_key()
    if not pixabay_key and "pixabay" in DEFAULT_PROVIDER_ORDER:
        print("No Pixabay API key found in PIXABAY_API_KEY; Pixabay searches will be skipped.", file=sys.stderr)

    clients = SearchClients(pixabay_key)
    provider_order = tuple(item.strip() for item in (args.providers or ",".join(DEFAULT_PROVIDER_ORDER)).split(",") if item.strip())
    existing_manifest = load_json(IMAGE_MANIFEST_PATH, {})
    seen_provider_ids, seen_hashes = seed_dedupe_from_manifest(existing_manifest if isinstance(existing_manifest, dict) else {})
    current_provider_ids, current_hashes = seed_dedupe_from_manifest(image_manifest)
    seen_provider_ids.update(current_provider_ids)
    seen_hashes.update(current_hashes)

    downloaded = 0
    total_sections = sum(len((route_data.get("sections") or {})) for route_data in image_manifest.get("routes", {}).values())
    processed_sections = 0
    last_checkpoint_downloaded = 0

    for route_data in image_manifest.get("routes", {}).values():
        for section_data in route_data.get("sections", {}).values():
            processed_sections += 1
            route = route_data.get("route") or ""
            section_id = section_data.get("section_id") or ""
            section_downloaded_before = downloaded

            if args.selected_only and not args.force and section_has_verified_selection(section_data):
                verified_key = choose_verified_option_key(section_data)
                if verified_key in {"a", "b"}:
                    section_data["selected_option"] = verified_key
                if processed_sections % 25 == 0:
                    print(
                        f"[section-images] progress sections={processed_sections}/{total_sections} downloaded={downloaded}",
                        file=sys.stderr,
                    )
                continue

            for option in ordered_section_options(section_data, args.selected_only):
                asset_path = option.get("asset_path")
                if asset_path and (ROOT / asset_path.lstrip("/")).exists() and not args.force:
                    continue

                local_rel = option["seo"]["public_path"]
                output_path = ROOT / local_rel.lstrip("/")
                local_candidate = local_asset_candidate(option)
                if local_candidate and (args.local_curated_only or option.get("option_key") == "a"):
                    try:
                        digest, width, height = copy_local_curated_image(local_candidate, output_path)
                    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
                        digest = width = height = None  # type: ignore[assignment]
                    if digest:
                        apply_downloaded_option(option, local_candidate, local_rel, digest, width, height)
                        downloaded += 1
                        print(
                            f"[section-images] downloaded {downloaded} "
                            f"route={route} section={section_id} option={option['option_key']} "
                            f"provider={option['provider']} query={option['query_used']}",
                            file=sys.stderr,
                        )
                        if args.selected_only:
                            if section_data.get("selected_option") not in {"a", "b"}:
                                section_data["selected_option"] = option["option_key"]
                            break
                        continue

                if args.local_curated_only:
                    continue

                candidate = choose_candidate_for_option(clients, provider_order, option, route_data | section_data, seen_provider_ids, seen_hashes)
                if not candidate:
                    continue

                try:
                    digest, width, height = download_and_convert(clients.session, candidate, output_path)
                except (requests.RequestException, UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
                    continue

                if candidate.get("provider") != LOCAL_CURATED_PROVIDER and digest in seen_hashes:
                    try:
                        output_path.unlink(missing_ok=True)
                    except OSError:
                        pass
                    continue

                if candidate.get("provider") != LOCAL_CURATED_PROVIDER:
                    seen_provider_ids.add(candidate["provider_id"])
                    seen_hashes.add(digest)
                apply_downloaded_option(option, candidate, local_rel, digest, width, height)
                downloaded += 1

                print(
                    f"[section-images] downloaded {downloaded} "
                    f"route={route} section={section_id} option={option['option_key']} "
                    f"provider={option['provider']} query={option['query_used']}",
                    file=sys.stderr,
                )
                if args.selected_only:
                    if section_data.get("selected_option") not in {"a", "b"}:
                        section_data["selected_option"] = option["option_key"]
                    break

            verified_key = choose_verified_option_key(section_data)
            if verified_key in {"a", "b"}:
                section_data["selected_option"] = verified_key

            if processed_sections % 25 == 0 or downloaded != section_downloaded_before:
                print(
                    f"[section-images] progress sections={processed_sections}/{total_sections} downloaded={downloaded}",
                    file=sys.stderr,
                )
            if downloaded - last_checkpoint_downloaded >= 10 or processed_sections % 25 == 0:
                image_manifest["downloaded_at"] = now_iso()
                image_manifest.setdefault("summary", {})["downloaded_now"] = downloaded
                image_manifest["summary"]["downloaded_options"] = downloaded_option_count(image_manifest.get("routes") or {})
                write_json(IMAGE_MANIFEST_PATH, image_manifest)
                last_checkpoint_downloaded = downloaded

    image_manifest["downloaded_at"] = now_iso()
    image_manifest.setdefault("summary", {})["downloaded_now"] = downloaded
    image_manifest["summary"]["downloaded_options"] = downloaded_option_count(image_manifest.get("routes") or {})
    return image_manifest


def print_summary(query_manifest: dict[str, Any], image_manifest: dict[str, Any]) -> None:
    query_summary = query_manifest.get("summary") or {}
    image_summary = image_manifest.get("summary") or {}
    print(
        f"[section-images] routes={query_summary.get('routes', 0)} "
        f"sections={query_summary.get('sections', 0)} "
        f"downloaded={image_summary.get('downloaded_options', 0)}"
    )


def manifest_summary(routes: dict[str, Any]) -> dict[str, int]:
    return {
        "routes": len(routes),
        "sections": sum(len((route_data.get("sections") or {})) for route_data in routes.values()),
    }


def downloaded_option_count(routes: dict[str, Any]) -> int:
    total = 0
    for route_data in routes.values():
        for section_data in (route_data.get("sections") or {}).values():
            for option in section_data.get("options") or []:
                if option.get("asset_path"):
                    total += 1
    return total


def should_merge_existing_routes(args: argparse.Namespace) -> bool:
    return bool(args.route or args.family or args.page_limit or args.section_limit)


def merge_manifest_routes(existing: dict[str, Any], fresh: dict[str, Any]) -> dict[str, Any]:
    existing_routes = dict(existing.get("routes") or {})
    fresh_routes = dict(fresh.get("routes") or {})

    for route, route_payload in fresh_routes.items():
        if route not in existing_routes:
            existing_routes[route] = route_payload
            continue

        merged_route = {**existing_routes[route], **route_payload}
        existing_sections = dict((existing_routes[route].get("sections") or {}))
        fresh_sections = dict((route_payload.get("sections") or {}))
        existing_sections.update(fresh_sections)
        merged_route["sections"] = existing_sections
        existing_routes[route] = merged_route

    merged = {**existing, **fresh}
    merged["routes"] = dict(sorted(existing_routes.items()))
    merged["summary"] = manifest_summary(merged["routes"])
    if "options" in next(iter((next(iter(merged["routes"].values()), {})).get("sections", {}).values()), {}):
        merged["summary"]["downloaded_options"] = downloaded_option_count(merged["routes"])
    if fresh.get("downloaded_at") or existing.get("downloaded_at"):
        merged["downloaded_at"] = fresh.get("downloaded_at") or existing.get("downloaded_at")
    return merged


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate bilingual section image manifests and optional downloads.")
    parser.add_argument("--route", help="Limit generation to a single route, for example /about/about/")
    parser.add_argument("--family", help="Limit generation to a family, for example services or brazil")
    parser.add_argument("--page-limit", type=int, default=0, help="Limit how many pages are scanned")
    parser.add_argument("--section-limit", type=int, default=0, help="Limit sections per page")
    parser.add_argument("--include-cta", action="store_true", help="Include consultation CTA sections")
    parser.add_argument("--include-faq", action="store_true", help="Include FAQ sections")
    parser.add_argument("--include-menus", action="store_true", help="Include hub/menu sections")
    parser.add_argument("--include-expansions", action="store_true", help="Include expansion/accordion sections")
    parser.add_argument("--download", action="store_true", help="Search providers and download section image options")
    parser.add_argument("--selected-only", action="store_true", help="Download only the selected or first successful option per section")
    parser.add_argument("--local-curated-only", action="store_true", help="Use only the local curated Brazil image library for selected section images")
    parser.add_argument("--bootstrap-curated-library", action="store_true", help="Download a broader local curated Brazil place library for section-image rotation")
    parser.add_argument("--bootstrap-only", action="store_true", help="Run the curated library bootstrap and exit without rebuilding section manifests")
    parser.add_argument("--bootstrap-expanded-scenes", action="store_true", help="Bootstrap the expanded Brazil scene-seed catalog instead of only the core place catalog")
    parser.add_argument("--refresh-curated-library", action="store_true", help="Redownload curated Brazil library assets even if they already exist")
    parser.add_argument("--curated-variants-per-source", type=int, default=DEFAULT_CURATED_VARIANTS_PER_SOURCE, help="Target unique curated image variants to keep per Brazil scene source")
    parser.add_argument("--curated-manifest-path", help="Optional output path for a curated library bootstrap shard manifest")
    parser.add_argument("--curated-source-step", type=int, default=1, help="When bootstrapping, process every Nth source to support parallel shards")
    parser.add_argument("--curated-source-offset", type=int, default=0, help="When bootstrapping, process only sources whose index modulo step matches this offset")
    parser.add_argument("--providers", help="Comma-separated provider order, default: wikimedia,openverse,pixabay")
    parser.add_argument("--force", action="store_true", help="Redownload assets even if files already exist")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.bootstrap_curated_library:
        bootstrap_curated_library(args)
        if args.bootstrap_only:
            return 0
    query_manifest, image_manifest = build_section_manifests(args)
    if args.download:
        image_manifest = download_candidates(args, image_manifest)

    if should_merge_existing_routes(args):
        existing_query = load_json(QUERY_MANIFEST_PATH, {})
        existing_image = load_json(IMAGE_MANIFEST_PATH, {})
        if isinstance(existing_query, dict) and existing_query.get("routes"):
            query_manifest = merge_manifest_routes(existing_query, query_manifest)
        if isinstance(existing_image, dict) and existing_image.get("routes"):
            image_manifest = merge_manifest_routes(existing_image, image_manifest)

    write_json(QUERY_MANIFEST_PATH, query_manifest)
    write_json(IMAGE_MANIFEST_PATH, image_manifest)
    write_section_index_csv(image_manifest)
    print_summary(query_manifest, image_manifest)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
