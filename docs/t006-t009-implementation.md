# T006–T009 implementation notes

## T006 Inspiration filters

`/inspiration/` now supports multi-select filters for style, space, artist and palette. Selections within one group use OR; active groups combine with AND. The result count updates live and the fixed reference-only notice remains visible. Desktop exposes grouped underlined controls; mobile uses a compact select control.

## T007 Business Custom

`/business-custom/` is a standalone landing page with four service context labels, three clearly marked concept / pending-authorization case cards, and a B2B inquiry form for company, contact, budget range, context and timeline. No case claims completed work or client proof.

## T008 Artist profiles

Each artist route now includes biography, philosophy, style/media tags, portfolio placeholders, experience pending confirmation, transparent reference-quote language and a commission CTA carrying artist context into the form. Portfolio entries are reference directions, not purchasable inventory.

## T009 Direction finder

`/art-direction/` contains four required questions (space, style, budget, timeline). Results provide transparent suggestions from the content model and link to a prefilled `/custom-commission/` URL. The page explicitly states that suggestions are not automatic matching, quotation, or fulfillment commitments.

## Business boundaries

No cart, checkout, price SKU, stock, order or instant-purchase flow was introduced. Existing static architecture and page routes remain intact; this iteration adds one static direction-tool route and keeps all assets local/content-bearing.
