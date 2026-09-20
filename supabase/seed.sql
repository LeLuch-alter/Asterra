-- Asterra — demo seed data
-- Run AFTER 0001_init.sql in the Supabase SQL editor.
-- Creates 6 demo accounts (password for all: demo1234), 4 projects, members, results and a roadmap.
-- Safe to re-run: existing rows with the same ids are skipped.

-- ---------------------------------------------------------------------------
-- Demo users (auth.users) — the profiles trigger creates matching profile rows.
-- ---------------------------------------------------------------------------
-- Note: GoTrue cannot read NULL in the token/change columns, so they are set to '' explicitly.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token
)
select
  v.id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v.email,
  crypt('demo1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', v.full_name), now(), now(),
  '', '', '', '', '', '', '', ''
from (values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'aigerim@demo.asterra',  'Aigerim Nurlan'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'daniyar@demo.asterra',  'Daniyar Seitkali'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'elena@demo.asterra',    'Elena Petrova'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'marat@demo.asterra',    'Marat Abenov'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'sofia@demo.asterra',    'Sofia Kim'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'timur@demo.asterra',    'Timur Zhaksylyk')
) as v(id, email, full_name)
on conflict (id) do nothing;

-- Repair rows created by an earlier version of this seed (NULL -> '').
update auth.users set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
where email like '%@demo.asterra';

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users u
where u.email like '%@demo.asterra'
  and not exists (select 1 from auth.identities i where i.user_id = u.id);

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
update public.profiles set
  role = 'student', organization = 'Nazarbayev University', experience_years = 1, is_mentor = false,
  bio = 'Third-year computer science student interested in applying machine learning to environmental monitoring.',
  research_fields = '{"Computer Science","Environmental Science"}',
  skills = '{"Python","machine learning","remote sensing","data visualization"}',
  interests = '{"water quality","satellite imagery","climate data"}'
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles set
  role = 'researcher', organization = 'Al-Farabi Kazakh National University', experience_years = 6, is_mentor = true,
  bio = 'Hydrologist working on water pollution detection in Central Asian rivers. Happy to mentor student projects on field sampling and data analysis.',
  research_fields = '{"Environmental Science","Chemistry"}',
  skills = '{"water chemistry","field sampling","statistics","R","GIS"}',
  interests = '{"river ecosystems","pollution monitoring","citizen science"}'
where id = '22222222-2222-2222-2222-222222222222';

update public.profiles set
  role = 'mentor', organization = 'Institute of Molecular Biology', experience_years = 14, is_mentor = true,
  bio = 'Molecular biologist and research supervisor. I mentor students on experimental design, lab methods and scientific writing.',
  research_fields = '{"Biology","Medicine"}',
  skills = '{"experimental design","PCR","cell culture","scientific writing","statistics"}',
  interests = '{"gene expression","microbiome","science education"}'
where id = '33333333-3333-3333-3333-333333333333';

update public.profiles set
  role = 'student', organization = 'Satbayev University', experience_years = 2, is_mentor = false,
  bio = 'Physics student building low-cost sensors. I like turning lab ideas into working hardware.',
  research_fields = '{"Physics","Engineering"}',
  skills = '{"electronics","Arduino","C++","signal processing","3D printing"}',
  interests = '{"quantum sensing","IoT","open hardware"}'
where id = '44444444-4444-4444-4444-444444444444';

update public.profiles set
  role = 'researcher', organization = 'KIMEP University', experience_years = 4, is_mentor = true,
  bio = 'Data scientist and lecturer. Research on NLP for scientific literature and AI-assisted research workflows.',
  research_fields = '{"Computer Science","Artificial Intelligence"}',
  skills = '{"Python","NLP","deep learning","PyTorch","SQL","data engineering"}',
  interests = '{"large language models","literature mining","research tools"}'
where id = '55555555-5555-5555-5555-555555555555';

update public.profiles set
  role = 'student', organization = 'Nazarbayev University', experience_years = 0, is_mentor = false,
  bio = 'First-year biology student curious about neuroscience and how the gut microbiome affects behaviour.',
  research_fields = '{"Biology","Neuroscience"}',
  skills = '{"lab basics","literature review","Excel"}',
  interests = '{"microbiome","memory","animal behaviour"}'
where id = '66666666-6666-6666-6666-666666666666';

-- ---------------------------------------------------------------------------
-- Projects (owner is auto-added as member by trigger)
-- ---------------------------------------------------------------------------
insert into public.projects (id, owner_id, title, description, research_field, research_question, hypothesis, methodology, required_skills, status, visibility)
values
(
  'aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
  'AI-based detection of water pollution from satellite imagery',
  'We want to detect pollution events in rivers and lakes of Kazakhstan using freely available Sentinel-2 satellite images and a machine learning classifier. The goal is an early-warning map that local communities can use.',
  'Environmental Science',
  'Can multispectral satellite imagery combined with a supervised classifier reliably detect surface water pollution events in medium-sized rivers?',
  'Pollution events change the spectral signature of water (turbidity, chlorophyll, surface films) strongly enough to be classified with >80% accuracy when ground-truth samples are available.',
  'Collect Sentinel-2 scenes for 3 rivers over 2 years, match them with water-quality measurements from public monitoring stations, train and evaluate a random forest / CNN classifier.',
  '{"Python","remote sensing","machine learning","water chemistry","GIS"}',
  'planning', 'public'
),
(
  'aaaaaaaa-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444',
  'Low-cost diamond NV-center magnetometer for classroom use',
  'Design and build an affordable nitrogen-vacancy diamond magnetometer that works at room temperature, so that university labs can demonstrate quantum sensing without cryogenics.',
  'Physics',
  'Can a sub-$500 NV-center setup achieve magnetic field sensitivity sufficient for classroom demonstrations?',
  'Using a green laser diode, a simple microwave source and lock-in detection, sensitivity around 1 µT/√Hz is achievable.',
  'Assemble optical setup, characterise fluorescence contrast, implement ODMR readout on a microcontroller, benchmark against a Hall sensor.',
  '{"electronics","optics","signal processing","C++"}',
  'in_progress', 'public'
),
(
  'aaaaaaaa-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555',
  'Mining research trends from open-access abstracts with LLMs',
  'Use large language models to extract methods, datasets and findings from open-access abstracts and build a searchable map of research trends for students choosing a thesis topic.',
  'Computer Science',
  'How accurately can an LLM extract structured method/dataset/finding triples from scientific abstracts compared with human annotation?',
  'With few-shot prompting and schema validation, extraction agreement with human annotators exceeds 85% for methods and datasets.',
  'Sample 1,000 abstracts from arXiv and PubMed, annotate 200 manually, compare LLM extractions, build a demo search UI.',
  '{"Python","NLP","prompt engineering","data annotation"}',
  'idea', 'public'
),
(
  'aaaaaaaa-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333',
  'Gut microbiome and memory formation in mice (student lab rotation)',
  'A supervised student project replicating recent findings on how gut bacteria influence hippocampal activity. Private until the protocol is approved.',
  'Biology',
  'Does recolonisation of germ-free mice with specific bacterial strains restore memory performance?',
  'Recolonisation restores performance in the novel object recognition test to control levels within four weeks.',
  'Behavioural testing, 16S sequencing, immunohistochemistry of hippocampal sections.',
  '{"lab basics","cell culture","statistics"}',
  'planning', 'private'
)
on conflict (id) do nothing;

-- Extra members
insert into public.project_members (project_id, user_id, role) values
('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'mentor'),
('aaaaaaaa-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'researcher'),
('aaaaaaaa-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'contributor'),
('aaaaaaaa-0000-0000-0000-000000000004', '66666666-6666-6666-6666-666666666666', 'contributor')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Research results
-- ---------------------------------------------------------------------------
insert into public.research_results (id, project_id, author_id, title, content) values
(
  'bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
  'Literature review: spectral indices for water quality',
  'Reviewed 14 papers on using Sentinel-2 bands for turbidity and chlorophyll-a estimation. The Normalized Difference Turbidity Index (NDTI, bands B4 and B3) and the NDCI (B5 and B4) are the most commonly used. Several studies report R² between 0.6 and 0.8 against in-situ measurements, but almost all are for lakes rather than rivers. Rivers are narrower, so mixed pixels at the shore are a major issue; two papers recommend masking pixels within 20 m of the bank.

Open questions: how to handle cloud cover in spring, and whether the public monitoring stations sample often enough to align with satellite overpasses (every 5 days).'
),
(
  'bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
  'Available ground-truth data',
  'Kazhydromet publishes monthly water-quality bulletins with dissolved oxygen, BOD, nitrates and petroleum products for 40+ stations. Monthly resolution is coarse but usable for training labels if we aggregate satellite indices per month. I also have a private dataset of 60 samples from the Ili river (2024) that we can use for validation.'
),
(
  'bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444',
  'First fluorescence measurements',
  'Assembled the optical path with a 520 nm laser diode (30 mW), a dichroic mirror and a photodiode with a 600 nm long-pass filter. Fluorescence from the diamond sample is clearly visible. ODMR dip at 2.87 GHz observed with ~2% contrast using a cheap VCO as the microwave source. Contrast is lower than the 5-10% reported in the literature; suspect microwave delivery (the wire loop is too far from the diamond). Next step: print a holder that keeps the loop within 0.5 mm.'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Roadmap for project 1
-- ---------------------------------------------------------------------------
insert into public.research_roadmap_items (id, project_id, title, description, position, status) values
('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Define the research question', 'Narrow the question to 3 rivers and a clear definition of a "pollution event" (threshold on turbidity or petroleum products).', 0, 'done'),
('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Literature review', 'Spectral indices for water quality, prior work on rivers vs lakes, cloud masking approaches.', 1, 'done'),
('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Collect satellite imagery', 'Download Sentinel-2 L2A scenes 2023-2025 for the Ili, Irtysh and Syr Darya via the Copernicus API; apply cloud mask.', 2, 'in_progress'),
('cccccccc-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'Assemble ground-truth labels', 'Align Kazhydromet monthly bulletins and the Ili validation samples with image dates.', 3, 'todo'),
('cccccccc-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'Train baseline classifier', 'Random forest on spectral indices; evaluate with spatial cross-validation to avoid leakage between nearby pixels.', 4, 'todo'),
('cccccccc-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', 'Analyse results and error cases', 'Confusion matrix per river, inspect false positives (algae blooms, shallow water).', 5, 'todo'),
('cccccccc-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000001', 'Write up and build the demo map', 'Short report + interactive map of detected events for the presentation.', 6, 'todo')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- A notification for the demo student
-- ---------------------------------------------------------------------------
insert into public.notifications (user_id, type, payload) values
('11111111-1111-1111-1111-111111111111', 'added_to_project',
 '{"project_id":"aaaaaaaa-0000-0000-0000-000000000003","project_title":"Mining research trends from open-access abstracts with LLMs","by":"55555555-5555-5555-5555-555555555555"}')
on conflict do nothing;
