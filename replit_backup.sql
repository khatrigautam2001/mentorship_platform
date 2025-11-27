--
-- PostgreSQL database dump
--

\restrict l2WsVp6Bxahcb6OfvykLUKao0Nyl2ylJheaI68dbJZdGTcgmPGh6ckG6xyhYrsh

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: badges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.badges (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    mentee_id character varying NOT NULL,
    skill_id character varying,
    awarded_at timestamp without time zone DEFAULT now() NOT NULL,
    individual_skill_id character varying
);


ALTER TABLE public.badges OWNER TO neondb_owner;

--
-- Name: individual_roadmap_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.individual_roadmap_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    mentee_id character varying NOT NULL,
    skill_id character varying,
    title text NOT NULL,
    "order" integer NOT NULL,
    is_mock_interview boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    individual_skill_id character varying,
    resource_url text
);


ALTER TABLE public.individual_roadmap_items OWNER TO neondb_owner;

--
-- Name: individual_skills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.individual_skills (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    mentee_id character varying NOT NULL,
    name text NOT NULL,
    description text,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.individual_skills OWNER TO neondb_owner;

--
-- Name: mock_interview_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.mock_interview_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    mentee_id character varying NOT NULL,
    skill_id character varying,
    status text NOT NULL,
    requested_at timestamp without time zone DEFAULT now() NOT NULL,
    resolved_at timestamp without time zone,
    individual_skill_id character varying
);


ALTER TABLE public.mock_interview_requests OWNER TO neondb_owner;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    mentee_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    date timestamp without time zone NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO neondb_owner;

--
-- Name: progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.progress (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    mentee_id character varying NOT NULL,
    item_id character varying NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.progress OWNER TO neondb_owner;

--
-- Name: roadmap_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.roadmap_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    skill_id character varying NOT NULL,
    title text NOT NULL,
    "order" integer NOT NULL,
    is_mock_interview boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    resource_url text
);


ALTER TABLE public.roadmap_items OWNER TO neondb_owner;

--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: skills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.skills (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    "order" integer NOT NULL,
    badge_icon text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.skills OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text NOT NULL,
    name text NOT NULL,
    phone text,
    photo text,
    mentor_id character varying,
    total_fee numeric(10,2),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    plain_password text
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: badges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.badges (id, mentee_id, skill_id, awarded_at, individual_skill_id) FROM stdin;
ee6610ec-06f9-4af7-8a18-e290601d85fa	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-skill	2025-11-24 11:33:56.181533	\N
65f4e372-e3ca-4bc9-a52c-79cffb52b9dc	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-skill	2025-11-24 11:41:19.922901	\N
8570169b-978f-4a2e-831a-c684023924fc	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	excel-skill	2025-11-24 11:55:01.184848	\N
e48feccc-4514-4928-ba4a-a270541d77ce	f4d3094a-68f2-48e8-be1b-407b887c081c	c8a72ed1-2287-4448-8cf5-737ee62f239e	2025-11-24 18:26:02.963991	\N
8560bb3a-332d-4774-b541-944dbe74d94f	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	c8a72ed1-2287-4448-8cf5-737ee62f239e	2025-11-24 18:34:49.547076	\N
0fb8744c-57c7-4e5a-b640-5d4defaecd95	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	f8408a62-4831-4a7a-87a7-7627e9a2849f	2025-11-25 02:59:27.437887	\N
bb41abf2-9e10-432c-b954-6fd76ee4c847	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	2025-11-25 03:04:03.523961	424f3af9-f9f2-42bc-bc68-2d4cc0b045f1
\.


--
-- Data for Name: individual_roadmap_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.individual_roadmap_items (id, mentee_id, skill_id, title, "order", is_mock_interview, created_at, individual_skill_id, resource_url) FROM stdin;
b724c1de-7d3d-44a5-bdb9-0f618becb215	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	mock test 1	0	t	2025-11-24 19:25:00.019068	c0f6df72-68f4-4fef-a3e8-4595659e0dff	\N
ba2f0724-62a4-427d-84ca-898ac86da2fa	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	test	1	f	2025-11-24 19:31:15.202772	c0f6df72-68f4-4fef-a3e8-4595659e0dff	\N
66cfb35b-690a-47d1-8c6e-a14ea3de96e3	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	mock 1	0	t	2025-11-24 19:38:20.292203	be7bc7af-0e3d-47dd-80e6-5a8875e3887f	\N
9f788cf3-d0b9-4ead-a80e-76b4b6f657e0	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	mock 2	0	t	2025-11-24 19:38:26.193622	be7bc7af-0e3d-47dd-80e6-5a8875e3887f	\N
360eb81a-d2da-4c3e-b3dc-d487b38ad404	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-skill	Excel Playlist	0	f	2025-11-24 10:42:15.158496	\N	https://www.youtube.com/watch?v=09FlqkANCws&list=PLc20sA5NNOvpcp5xL3q3CILSkLpc1EEcV
88e0af51-760b-4d77-a77d-4e4534bca77c	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-skill	Excel Practice	1	f	2025-11-24 10:42:14.71115	\N	https://excel-practice-online.com/exercises/
c2cfd084-8eea-423c-a65d-b0f845f77d7d	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-skill	Excel Full Course	2	f	2025-11-24 10:42:15.149438	\N	https://youtu.be/SA_SDo-cqpg?si=A5mZZ1Gf0HTr0naO
c6268202-0589-4bd6-b80e-64aaa4cb0c56	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-skill	Excel advanced formulas	3	f	2025-11-24 10:42:15.151152	\N	\N
186ec2a3-e579-4a07-a00d-3e1f1b43083b	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-skill	Excel Assignment	4	f	2025-11-24 10:42:15.166264	\N	https://excel-practice-online.com/excel-practice-tests/
cd4923f8-62c9-4612-aeb0-97bf5e7193fa	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-skill	Excel Projects	5	f	2025-11-24 10:42:15.160319	\N	\N
9d9c2219-a3c1-4321-b802-789d80dcc863	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-skill	Excel Mock Interview	6	t	2025-11-24 10:42:15.163945	\N	\N
7b17c79a-398b-4dfa-b4a0-c3abb0c16780	f4d3094a-68f2-48e8-be1b-407b887c081c	\N	test 2	0	f	2025-11-24 11:04:45.802055	4a6ea336-2a8c-4fab-8df6-fc39445d85c2	\N
fbc2e23a-3aa2-4a23-b15e-1f71db5f359e	f4d3094a-68f2-48e8-be1b-407b887c081c	\N	test	1	f	2025-11-24 10:45:40.55483	4a6ea336-2a8c-4fab-8df6-fc39445d85c2	\N
d1e4d129-ce69-4b2f-9bdc-6e9496831cbe	f4d3094a-68f2-48e8-be1b-407b887c081c	c8a72ed1-2287-4448-8cf5-737ee62f239e	test mock	3	t	2025-11-24 18:32:12.075905	\N	\N
a44935c8-67a2-4733-8086-e6e963b9adbc	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	c8a72ed1-2287-4448-8cf5-737ee62f239e	test mock	3	t	2025-11-24 18:32:40.216711	\N	\N
a932e763-c453-4884-ab4d-1675db56995f	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	test 1	0	t	2025-11-24 19:46:53.702638	71fd8dc5-f8eb-4c59-adc4-f4b2775fadc4	\N
0efb91b9-5b0b-4e9c-9d79-d8539fac1f00	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	test python	0	f	2025-11-24 18:36:54.9747	98cdd411-a8fd-4ecb-bdeb-725c21b40b56	\N
ba0182f0-df29-4fdd-a3fa-be95c6a48537	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	python mock	1	t	2025-11-24 18:33:06.968004	98cdd411-a8fd-4ecb-bdeb-725c21b40b56	\N
f618dd9b-1226-4b19-b44b-bc65e73c45ec	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	custom mock	0	t	2025-11-25 02:42:36.41199	424f3af9-f9f2-42bc-bc68-2d4cc0b045f1	\N
a1cd69d2-386b-4c37-a74f-c1bd679a10ed	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	test 1	1	t	2025-11-25 02:54:10.418997	424f3af9-f9f2-42bc-bc68-2d4cc0b045f1	\N
\.


--
-- Data for Name: individual_skills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.individual_skills (id, mentee_id, name, description, "order", created_at) FROM stdin;
424f3af9-f9f2-42bc-bc68-2d4cc0b045f1	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	Custom Badge	\N	0	2025-11-25 02:41:54.648003
98cdd411-a8fd-4ecb-bdeb-725c21b40b56	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	python	\N	3	2025-11-24 18:32:49.037498
be7bc7af-0e3d-47dd-80e6-5a8875e3887f	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	2 mock	\N	6	2025-11-24 19:36:46.840879
71fd8dc5-f8eb-4c59-adc4-f4b2775fadc4	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	test reject	\N	7	2025-11-24 19:46:23.741267
c0f6df72-68f4-4fef-a3e8-4595659e0dff	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	mock test	\N	9	2025-11-24 19:24:39.046529
4a6ea336-2a8c-4fab-8df6-fc39445d85c2	f4d3094a-68f2-48e8-be1b-407b887c081c	test	test	2	2025-11-24 10:45:04.850581
\.


--
-- Data for Name: mock_interview_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.mock_interview_requests (id, mentee_id, skill_id, status, requested_at, resolved_at, individual_skill_id) FROM stdin;
8d73f097-0139-4f0c-9a2a-c7d286d0d005	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-skill	approved	2025-11-24 11:33:26.381211	2025-11-24 11:33:55.963	\N
eedba464-6536-44e4-ad99-d16139941197	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-skill	approved	2025-11-24 11:40:41.825562	2025-11-24 11:41:19.701	\N
11a3f3ef-0a46-496c-af67-ca5092bcb49a	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	excel-skill	approved	2025-11-24 11:54:32.81549	2025-11-24 11:55:00.968	\N
e40e2c64-284d-407b-a4aa-24f1c0d19b22	f4d3094a-68f2-48e8-be1b-407b887c081c	c8a72ed1-2287-4448-8cf5-737ee62f239e	approved	2025-11-24 18:25:28.264723	2025-11-24 18:26:02.748	\N
1a89835c-0f83-4e3e-9b42-db043f86484e	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	c8a72ed1-2287-4448-8cf5-737ee62f239e	approved	2025-11-24 18:34:16.073829	2025-11-24 18:34:49.334	\N
1d024af5-1f5f-4b8e-bb43-4839f2d6c167	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	approved	2025-11-24 19:16:01.256074	2025-11-24 19:18:02.227	98cdd411-a8fd-4ecb-bdeb-725c21b40b56
e28745a2-751d-486d-8dc9-7325c2fba325	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	approved	2025-11-24 19:26:06.61191	2025-11-24 19:27:00.147	c0f6df72-68f4-4fef-a3e8-4595659e0dff
b715a0b4-7144-4882-8ad1-c6d2c9d80c73	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	approved	2025-11-24 19:41:22.315704	2025-11-24 19:41:56.494	be7bc7af-0e3d-47dd-80e6-5a8875e3887f
2a597469-97fe-4bb7-a44f-06538c3e5561	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	rejected	2025-11-24 19:47:36.178751	2025-11-24 19:49:06.67	71fd8dc5-f8eb-4c59-adc4-f4b2775fadc4
ce60c39c-0c35-42eb-baaa-f9a452ce22ee	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	f8408a62-4831-4a7a-87a7-7627e9a2849f	approved	2025-11-25 02:59:03.751272	2025-11-25 02:59:27.221	\N
5374a8d1-38cd-400a-b686-1edebc7c70d7	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	\N	approved	2025-11-25 03:03:31.023002	2025-11-25 03:04:03.309	424f3af9-f9f2-42bc-bc68-2d4cc0b045f1
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payments (id, mentee_id, amount, date, notes, created_at) FROM stdin;
d110b576-c652-40b6-bc9f-6b68bf09d733	f4d3094a-68f2-48e8-be1b-407b887c081c	10000.00	2025-11-24 10:24:13.463	Initial payment	2025-11-24 10:24:13.534029
2b5a7b90-3ee9-4256-9491-c54904d2c5e3	f4d3094a-68f2-48e8-be1b-407b887c081c	10000.00	2025-11-24 00:00:00	\N	2025-11-24 10:26:21.775948
13675b71-024b-4840-8a23-4cf54c173511	f4d3094a-68f2-48e8-be1b-407b887c081c	2000.00	2025-11-24 00:00:00	\N	2025-11-24 11:06:31.01571
3eb348ca-f839-4d1a-aa06-01dce4913de2	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	5000.00	2025-11-24 11:53:15.048	Initial payment	2025-11-24 11:53:15.119619
\.


--
-- Data for Name: progress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.progress (id, mentee_id, item_id, completed, completed_at) FROM stdin;
6eaf6c5c-4645-478b-b37a-b7a150acddff	f4d3094a-68f2-48e8-be1b-407b887c081c	b6fa0bf3-25ce-4266-acc3-cee3c672119d	t	2025-11-24 11:12:33.716
602fa801-a0de-4bc5-97b0-c7229f20ac59	f4d3094a-68f2-48e8-be1b-407b887c081c	340bd313-9cdc-400c-9e6c-f3144c40fc46	t	2025-11-24 11:30:55.853
036201a6-c291-4729-8702-e4da27763909	f4d3094a-68f2-48e8-be1b-407b887c081c	360eb81a-d2da-4c3e-b3dc-d487b38ad404	t	2025-11-24 11:33:01.624
a4d5672e-9c96-4b1b-9017-77bed2af8488	f4d3094a-68f2-48e8-be1b-407b887c081c	88e0af51-760b-4d77-a77d-4e4534bca77c	t	2025-11-24 11:33:05.935
628be16d-7bfc-4a23-8054-6f9bcecbe44f	f4d3094a-68f2-48e8-be1b-407b887c081c	c2cfd084-8eea-423c-a65d-b0f845f77d7d	t	2025-11-24 11:33:10.081
b1a4beed-267a-4880-9054-713d17c9b78b	f4d3094a-68f2-48e8-be1b-407b887c081c	c6268202-0589-4bd6-b80e-64aaa4cb0c56	t	2025-11-24 11:33:14.231
5d51d547-3ecf-437e-ab70-97e0e2aa80c2	f4d3094a-68f2-48e8-be1b-407b887c081c	186ec2a3-e579-4a07-a00d-3e1f1b43083b	t	2025-11-24 11:33:18.344
80db577f-67e5-4103-9738-69c1016efcd3	f4d3094a-68f2-48e8-be1b-407b887c081c	cd4923f8-62c9-4612-aeb0-97bf5e7193fa	t	2025-11-24 11:33:22.718
163ca4aa-bdf7-435d-9d10-33d400c622ec	f4d3094a-68f2-48e8-be1b-407b887c081c	excel-6	t	2025-11-24 11:41:20.286
6c5bcf7a-0982-48b0-b01c-b07306258cb8	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	b6fa0bf3-25ce-4266-acc3-cee3c672119d	t	2025-11-24 11:53:59.48
be137cac-12b1-4462-b960-d12ed37422c5	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	340bd313-9cdc-400c-9e6c-f3144c40fc46	t	2025-11-24 11:54:03.518
f5cd6b0f-e4fc-40bb-acb2-ff852bb7486f	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	excel-3	t	2025-11-24 11:54:07.776
aaecd13e-bc42-47b3-bd0d-af01b13a5231	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	excel-2	t	2025-11-24 11:54:11.904
db19ee7a-c239-4116-80d1-c0707352327b	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	excel-1	t	2025-11-24 11:54:15.784
f1b69901-602b-4a96-aa70-bb411be8bb47	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	4dd08d75-28e4-4d97-b571-c2674c1c906c	t	2025-11-24 11:54:19.864
eb3ea16b-97f0-450b-b33b-092c1e0986a7	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	excel-4	t	2025-11-24 11:54:24.646
c5eb77d0-2619-40ef-91a5-bb005623508c	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	excel-5	t	2025-11-24 11:54:28.832
7d12d2aa-6b07-44d1-9f9a-3eb3da253385	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	excel-6	t	2025-11-24 11:55:01.549
1937731e-c312-4f8b-8249-9d44f6d33a18	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	sql-1	t	2025-11-24 12:00:43.914
4f066d60-8ecb-4411-abfa-d4280bfc0a64	f4d3094a-68f2-48e8-be1b-407b887c081c	e5fdd618-a41f-4d32-9272-bcce1cf685e1	t	2025-11-24 18:26:03.323
41be1765-6871-4f5d-9d1e-686955f12d64	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	e5fdd618-a41f-4d32-9272-bcce1cf685e1	t	2025-11-24 18:34:49.904
3ed7cb17-77e4-4cd2-897b-7b55c19c36e0	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	0efb91b9-5b0b-4e9c-9d79-d8539fac1f00	t	2025-11-24 18:45:55.383
f5506755-58a0-44f2-a8ee-c4dee32a1ff7	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	sql-2	t	2025-11-24 19:22:54.837
a6c28f04-20c1-43b0-bec6-d198643ee09a	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	b724c1de-7d3d-44a5-bdb9-0f618becb215	t	2025-11-24 19:27:00.572
a38d4e95-fd1e-49d0-9516-94ef5c73212d	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	ba2f0724-62a4-427d-84ca-898ac86da2fa	t	2025-11-24 19:31:55.858
32cb90be-d6e9-4275-a5ae-314b78ace959	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	9f788cf3-d0b9-4ead-a80e-76b4b6f657e0	t	2025-11-24 19:41:56.921
9140f205-67ea-4493-af1b-d3ffd93349e6	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	7ca97f96-f58b-4515-843f-a9bae6935e2c	t	2025-11-25 02:43:19.368
efcdd43a-b547-4f4e-a921-225fe52652b5	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	ad52c31d-291b-403f-8fa7-becdaa04906a	t	2025-11-25 02:58:59.531
039b284e-1c19-475d-9c32-8de394c1ed61	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	15805f6a-ee33-470a-a29c-7928f8c16f0a	t	2025-11-25 02:59:27.946
1dd0dea7-bc24-497c-926e-d25a72ba5e09	536b8f03-715a-4f3f-a022-5cb30bbb6cf3	f618dd9b-1226-4b19-b44b-bc65e73c45ec	t	2025-11-25 03:04:04.025
\.


--
-- Data for Name: roadmap_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.roadmap_items (id, skill_id, title, "order", is_mock_interview, created_at, resource_url) FROM stdin;
sql-8	sql-skill	SQL Mock Interview	7	t	2025-11-23 03:13:24.783438	\N
excel-5	excel-skill	Excel Projects	5	f	2025-11-23 03:13:24.636393	\N
sql-1	sql-skill	SQL Full Playlist	0	f	2025-11-23 03:13:24.783438	https://youtube.com/playlist?list=PLGf6Ram2AQh2GpckMjstVH6AaTm0kPfgI&si=PYdInUE5BPx_9rxy
sql-2	sql-skill	SQL Advanced Course(Must do if need to crack high level interviews)	1	f	2025-11-23 03:13:24.783438	https://t.me/+0gm8TEgeguUwZGFl
sql-3	sql-skill	SQL Practice Website	2	f	2025-11-23 03:13:24.783438	https://sqlbolt.com/
sql-4	sql-skill	SQL Practice Website(Advanced)	3	f	2025-11-23 03:13:24.783438	https://sqlzoo.net/wiki/SQL_Tutorial
sql-5	sql-skill	SQL Assignment	4	f	2025-11-23 03:13:24.783438	https://docs.google.com/document/d/10UNZKMmO0DRxu9p_0_YIOrj2JmMVbPraIu_srV2Dh1c/edit?tab=t.0
sql-6	sql-skill	SQL Interview Questions Playlist	5	f	2025-11-23 03:13:24.783438	https://www.youtube.com/watch?v=4xPxGX4mfb4&list=PLBTZqjSKn0IcR6DhoLUibOG8frnWbZdSH
sql-7	sql-skill	SQL Interview Questions Playlist 2	6	f	2025-11-23 03:13:24.783438	https://www.youtube.com/watch?v=aE623ff7zkM&list=PLavw5C92dz9EIYmNXJ8ZtQ1bmLIpt0SpV
4dd08d75-28e4-4d97-b571-c2674c1c906c	excel-skill	Excel advanced formulas	3	f	2025-11-23 05:26:58.273497	\N
excel-4	excel-skill	Excel Assignment	4	f	2025-11-23 03:13:24.636393	https://excel-practice-online.com/excel-practice-tests/
excel-2	excel-skill	Excel Playlist	1	f	2025-11-23 03:13:24.636393	https://www.youtube.com/watch?v=09FlqkANCws&list=PLc20sA5NNOvpcp5xL3q3CILSkLpc1EEcV
excel-3	excel-skill	Excel Practice	0	f	2025-11-23 03:13:24.636393	https://excel-practice-online.com/exercises/
excel-1	excel-skill	Excel Full Course	2	f	2025-11-23 03:13:24.636393	https://youtu.be/SA_SDo-cqpg?si=A5mZZ1Gf0HTr0naO
ada30a73-933e-4ff5-96d4-4c68ab87e62d	b1fefa15-23f1-4cda-9a84-d944c17ae7b1	Power BI docs	0	f	2025-11-23 05:50:54.397612	https://learn.microsoft.com/en-us/power-bi/
b6fa0bf3-25ce-4266-acc3-cee3c672119d	c8a72ed1-2287-4448-8cf5-737ee62f239e	test 2	0	f	2025-11-24 11:08:46.5261	\N
340bd313-9cdc-400c-9e6c-f3144c40fc46	c8a72ed1-2287-4448-8cf5-737ee62f239e	test	1	f	2025-11-24 11:08:19.854837	\N
e5fdd618-a41f-4d32-9272-bcce1cf685e1	c8a72ed1-2287-4448-8cf5-737ee62f239e	test mock	2	t	2025-11-24 17:33:57.007925	\N
excel-6	excel-skill	Excel Mock Interview	6	t	2025-11-23 03:13:24.636393	\N
ad52c31d-291b-403f-8fa7-becdaa04906a	f8408a62-4831-4a7a-87a7-7627e9a2849f	test	1	f	2025-11-25 02:23:02.696562	\N
7ca97f96-f58b-4515-843f-a9bae6935e2c	f8408a62-4831-4a7a-87a7-7627e9a2849f	test	0	f	2025-11-25 02:14:47.479576	\N
15805f6a-ee33-470a-a29c-7928f8c16f0a	f8408a62-4831-4a7a-87a7-7627e9a2849f	test mock	2	t	2025-11-25 02:40:35.124354	\N
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.skills (id, name, description, "order", badge_icon, created_at) FROM stdin;
f8408a62-4831-4a7a-87a7-7627e9a2849f	global badge	\N	1	\N	2025-11-25 02:14:46.30037
c8a72ed1-2287-4448-8cf5-737ee62f239e	test	\N	2	\N	2025-11-24 11:08:18.845032
excel-skill	Excel	Master Excel fundamentals	4	\N	2025-11-23 03:13:24.483121
sql-skill	SQL	Learn SQL database queries	5	\N	2025-11-23 03:13:24.483121
b1fefa15-23f1-4cda-9a84-d944c17ae7b1	Power BI	\N	8	\N	2025-11-23 05:50:53.27682
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, password, role, name, phone, photo, mentor_id, total_fee, created_at, plain_password) FROM stdin;
1247d646-16d2-4343-a997-e00abf0ca549	mentor@test.com	$2b$10$2kLIwcJM.9HskEujLBi4xu0rFowtVvEcQSIZkTA9w/M74ypNXNH.6	mentor	Test Mentor			\N	\N	2025-11-22 20:13:19.444563	\N
3aec2c5c-8505-4d18-8708-180533c3f41b	mentor2@test.com	$2b$10$msf4RiDgpvAwridy7XQvaeIQjm8MsNrpR02GYPQo6sfmfkp00D7q6	mentor	Dr. Smith			\N	\N	2025-11-22 20:13:30.987335	\N
f4d3094a-68f2-48e8-be1b-407b887c081c	gg044850@gmail.com	$2b$10$fP63izbLX8gl4CnBTuILvOjuIb5n7ERdirZFygY1SXY6Wx2P9I02m	mentee	Gokulakrishnan S	+916383986774		3aec2c5c-8505-4d18-8708-180533c3f41b	30000.00	2025-11-24 10:24:13.383151	Y4ke7TuMRUu6
536b8f03-715a-4f3f-a022-5cb30bbb6cf3	ragul@gmail.com	$2b$10$qrTrb13Mxg8aUuUxyVT1ROGExsGsszGe/FqmyuT11fq2vrRgn53e6	mentee	ragul			3aec2c5c-8505-4d18-8708-180533c3f41b	30000.00	2025-11-24 11:53:14.960227	MWePhBJhrsmT
\.


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: individual_roadmap_items individual_roadmap_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.individual_roadmap_items
    ADD CONSTRAINT individual_roadmap_items_pkey PRIMARY KEY (id);


--
-- Name: individual_skills individual_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.individual_skills
    ADD CONSTRAINT individual_skills_pkey PRIMARY KEY (id);


--
-- Name: mock_interview_requests mock_interview_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mock_interview_requests
    ADD CONSTRAINT mock_interview_requests_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);


--
-- Name: roadmap_items roadmap_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmap_items
    ADD CONSTRAINT roadmap_items_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: badges badges_individual_skill_id_individual_skills_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_individual_skill_id_individual_skills_id_fk FOREIGN KEY (individual_skill_id) REFERENCES public.individual_skills(id) ON DELETE CASCADE;


--
-- Name: badges badges_mentee_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_mentee_id_users_id_fk FOREIGN KEY (mentee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: badges badges_skill_id_skills_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_skill_id_skills_id_fk FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: individual_roadmap_items individual_roadmap_items_individual_skill_id_individual_skills_; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.individual_roadmap_items
    ADD CONSTRAINT individual_roadmap_items_individual_skill_id_individual_skills_ FOREIGN KEY (individual_skill_id) REFERENCES public.individual_skills(id) ON DELETE CASCADE;


--
-- Name: individual_roadmap_items individual_roadmap_items_mentee_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.individual_roadmap_items
    ADD CONSTRAINT individual_roadmap_items_mentee_id_users_id_fk FOREIGN KEY (mentee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: individual_roadmap_items individual_roadmap_items_skill_id_skills_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.individual_roadmap_items
    ADD CONSTRAINT individual_roadmap_items_skill_id_skills_id_fk FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: individual_skills individual_skills_mentee_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.individual_skills
    ADD CONSTRAINT individual_skills_mentee_id_users_id_fk FOREIGN KEY (mentee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mock_interview_requests mock_interview_requests_individual_skill_id_individual_skills_i; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mock_interview_requests
    ADD CONSTRAINT mock_interview_requests_individual_skill_id_individual_skills_i FOREIGN KEY (individual_skill_id) REFERENCES public.individual_skills(id) ON DELETE CASCADE;


--
-- Name: mock_interview_requests mock_interview_requests_mentee_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mock_interview_requests
    ADD CONSTRAINT mock_interview_requests_mentee_id_users_id_fk FOREIGN KEY (mentee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mock_interview_requests mock_interview_requests_skill_id_skills_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mock_interview_requests
    ADD CONSTRAINT mock_interview_requests_skill_id_skills_id_fk FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: payments payments_mentee_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_mentee_id_users_id_fk FOREIGN KEY (mentee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: progress progress_mentee_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_mentee_id_users_id_fk FOREIGN KEY (mentee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: roadmap_items roadmap_items_skill_id_skills_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roadmap_items
    ADD CONSTRAINT roadmap_items_skill_id_skills_id_fk FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: users users_mentor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_mentor_id_users_id_fk FOREIGN KEY (mentor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict l2WsVp6Bxahcb6OfvykLUKao0Nyl2ylJheaI68dbJZdGTcgmPGh6ckG6xyhYrsh

