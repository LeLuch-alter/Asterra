-- Asterra — research graph demo data.
-- Run AFTER 0004_research_graph.sql and seed.sql.
-- Adds experiments, scientific sources and a forked research direction so the
-- graph, timeline and fork features have something to show.

insert into public.experiments (id, project_id, author_id, title, purpose, methodology, data_description, outcome, status, position) values
(
  'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
  'Experiment #1 — spectral indices vs. in-situ turbidity',
  'Check whether NDTI computed from Sentinel-2 correlates with turbidity measured at monitoring stations.',
  'Compute NDTI (B4/B3) for 5x5 pixel windows around each station, pair with the nearest monthly bulletin, fit a linear model with spatial cross-validation.',
  '412 image-station pairs for the Ili river, 2023-2025; cloud cover below 20%.',
  'R2 = 0.68 overall, but only 0.41 for narrow river sections — mixed shore pixels are the main error source.',
  'done', 0
),
(
  'dddddddd-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555',
  'Experiment #2 — random forest on multi-band features',
  'Test whether a classifier on all 12 bands beats a single index for detecting pollution events.',
  'Random forest, 300 trees, features = all bands + NDTI + NDCI; spatial blocking by river section to avoid leakage.',
  'Same 412 pairs plus 60 validation samples collected by hand in 2024.',
  '',
  'running', 1
),
(
  'dddddddd-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444',
  'ODMR contrast measurement',
  'Find out why fluorescence contrast is 2% instead of the 5-10% reported in the literature.',
  'Sweep microwave power and loop distance, record contrast with lock-in detection at each setting.',
  'Diamond sample NV-1, 520 nm laser at 30 mW, VCO microwave source.',
  'Contrast rises to 4.6% when the loop sits within 0.5 mm of the sample — the holder was the limiting factor.',
  'done', 0
)
on conflict (id) do nothing;

-- Results produced by those experiments.
update public.research_results set experiment_id = 'dddddddd-0000-0000-0000-000000000001'
where id = 'bbbbbbbb-0000-0000-0000-000000000002';
update public.research_results set experiment_id = 'dddddddd-0000-0000-0000-000000000003'
where id = 'bbbbbbbb-0000-0000-0000-000000000003';

-- Sources attached to the part of the research they support.
insert into public.research_sources (id, project_id, added_by, title, authors, year, url, note, target_type, target_id) values
(
  'eeeeeeee-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
  'Remote sensing of water quality: a review of spectral indices', 'Gholizadeh, Melesse & Reddi', 2016,
  'https://doi.org/10.3390/s16081298',
  'Gives the NDTI and NDCI formulas the methodology is built on.', 'methodology', null
),
(
  'eeeeeeee-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
  'Water quality monitoring of Central Asian rivers, 2019-2024', 'Kazhydromet', 2024,
  'https://www.kazhydromet.kz/',
  'The monthly bulletins used as ground-truth labels.', 'experiment', 'dddddddd-0000-0000-0000-000000000001'
),
(
  'eeeeeeee-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555',
  'Spatial cross-validation for remote sensing models', 'Roberts et al.', 2017,
  'https://doi.org/10.1111/ecog.02881',
  'Why nearby pixels must be blocked, not shuffled — shapes the evaluation design.', 'hypothesis', null
),
(
  'eeeeeeee-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444',
  'Magnetometry with nitrogen-vacancy centres in diamond', 'Rondin et al.', 2014,
  'https://doi.org/10.1088/0034-4885/77/5/056503',
  'Reference numbers for achievable ODMR contrast.', 'research_question', null
)
on conflict (id) do nothing;

-- A forked research direction: same idea, different data source.
insert into public.projects (
  id, owner_id, title, description, research_field, research_question, hypothesis, methodology,
  required_skills, status, visibility, forked_from
) values (
  'aaaaaaaa-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555',
  'AI-based detection of water pollution — drone imagery branch',
  'A branch of the satellite project that replaces Sentinel-2 scenes with low-altitude drone imagery, trading coverage for resolution on narrow river sections.',
  'Environmental Science',
  'Can centimetre-resolution drone imagery detect pollution in narrow river sections where satellite pixels are mixed?',
  'At 5 cm resolution the shore-pixel problem disappears, so detection accuracy on narrow sections rises above 0.8.',
  'Fly a fixed transect weekly, collect water samples at the same points, train the same classifier on drone bands.',
  '{"Python","drone operation","remote sensing","water chemistry"}',
  'idea', 'public', 'aaaaaaaa-0000-0000-0000-000000000001'
)
on conflict (id) do nothing;

-- Show that the research question evolved (v1 -> v2) on the main demo project.
update public.projects
set research_question = 'Can multispectral satellite imagery combined with a supervised classifier reliably detect surface water pollution events in medium-sized rivers, including narrow sections?'
where id = 'aaaaaaaa-0000-0000-0000-000000000001';
