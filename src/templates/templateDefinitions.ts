import { Block, BlockType } from '../types';

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  category: 'Engineering & Tech' | 'Product & Strategy' | 'Productivity & Habits' | 'Meetings & Ops' | 'Knowledge & Research';
  icon: string;
  coverUrl: string;
  generateBlocks: (pageId: string) => Block[];
}

const makeBlock = (
  idSuffix: string,
  pageId: string,
  type: BlockType,
  text: string,
  orderIndex: number,
  extraContent: Record<string, unknown> = {}
): Block => ({
  id: `b_${crypto.randomUUID().slice(0, 8)}_${idSuffix}`,
  pageId,
  parentId: null,
  type,
  content: { text, ...extraContent },
  properties: {},
  orderIndex,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  // 1. Engineering Sprint & Kanban Roadmap
  {
    id: 'sprint_roadmap',
    title: 'Engineering Sprint & Roadmap',
    description: 'Sprint goals, epic breakdown, active backlog items, blocker tracking, and release checklist.',
    category: 'Engineering & Tech',
    icon: '🚀',
    coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', 'Sprint Objective: Finalize local-first offline synchronization, indexed queries, and v1.0 desktop release candidate.', 1, {
        icon: '🚀',
        bgColor: 'bg-[#5a5a40]/10 text-[#2c2c2a] dark:text-[#f0f0ea]',
      }),
      makeBlock('2', pageId, 'heading1', 'Sprint Overview & Timeline', 2),
      makeBlock('3', pageId, 'bullet', 'Sprint Duration: 2 Weeks (Aug 24 - Sep 07)', 3),
      makeBlock('4', pageId, 'bullet', 'Primary Target: 100% offline uptime & sub-5ms local IndexedDB transaction writes', 4),
      makeBlock('5', pageId, 'bullet', 'Tech Stack: React 19, TypeScript 5.8, Dexie.js, SQLite WAL', 5),
      makeBlock('6', pageId, 'heading2', 'Sprint Backlog & Deliverables', 6),
      makeBlock('7', pageId, 'todo', 'Refactor local storage diagnostics runner to probe ACID write transactions', 7, { checked: true }),
      makeBlock('8', pageId, 'todo', 'Optimize Service Worker cache for instantaneous offline cold boot', 8, { checked: true }),
      makeBlock('9', pageId, 'todo', 'Add dark/light mode theme listener with class-based tailwind variants', 9, { checked: true }),
      makeBlock('10', pageId, 'todo', 'Implement PWA install prompt & standalone application launcher', 10, { checked: false }),
      makeBlock('11', pageId, 'todo', 'Stress test 10,000 block page rendering performance', 11, { checked: false }),
      makeBlock('12', pageId, 'heading2', 'Blockers & Risk Mitigation', 12),
      makeBlock('13', pageId, 'quote', 'Notice: Browser private mode might limit persistent disk quotas. Always trigger navigator.storage.persist().', 13),
      makeBlock('14', pageId, 'heading2', 'Release Readiness Criteria', 14),
      makeBlock('15', pageId, 'todo', 'Zero TypeScript compiler errors in build logs', 15, { checked: true }),
      makeBlock('16', pageId, 'todo', 'All 11 IndexedDB entity stores pass automated integrity check', 16, { checked: false }),
    ],
  },

  // 2. Product Requirement Document (PRD)
  {
    id: 'product_spec',
    title: 'Product Requirement Document (PRD)',
    description: 'Comprehensive product spec with problem statement, user personas, functional requirements, and success metrics.',
    category: 'Product & Strategy',
    icon: '📄',
    coverUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', 'Status: Ready for Engineering Review • Author: Product Lead • Target Release: Q3', 1, {
        icon: '📋',
        bgColor: 'bg-emerald-50/80 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200',
      }),
      makeBlock('2', pageId, 'heading1', '1. Problem & Context', 2),
      makeBlock('3', pageId, 'paragraph', 'Modern knowledge workers suffer from cloud lock-in, sluggish network latencies, and invasive telemetry in centralized note tools. Ration addresses this by delivering a privacy-first, local-first workspace.', 3),
      makeBlock('4', pageId, 'heading1', '2. User Personas', 4),
      makeBlock('5', pageId, 'bullet', 'The Deep Worker: Demands zero latency, distraction-free typography, and keyboard navigation.', 5),
      makeBlock('6', pageId, 'bullet', 'The Field Researcher: Works in low/no connectivity environments (flights, transit, remote sites).', 6),
      makeBlock('7', pageId, 'bullet', 'The Privacy Advocate: Requires total ownership of database files stored locally on their device.', 7),
      makeBlock('8', pageId, 'heading1', '3. Key Functional Requirements', 8),
      makeBlock('9', pageId, 'todo', 'Fast block editor with Markdown shortcuts (#, *, [], >, ```)', 9, { checked: true }),
      makeBlock('10', pageId, 'todo', 'Embedded Database views (Kanban board, Table, Gallery, Calendar)', 10, { checked: true }),
      makeBlock('11', pageId, 'todo', 'Full version history with checkpoint recovery', 11, { checked: true }),
      makeBlock('12', pageId, 'todo', 'One-click PWA desktop installation with offline service worker', 12, { checked: false }),
      makeBlock('13', pageId, 'heading1', '4. Success Metrics & Guardrails', 13),
      makeBlock('14', pageId, 'bullet', 'Initial document load time < 50ms', 14),
      makeBlock('15', pageId, 'bullet', 'Zero data loss across unexpected system reboots or browser tab crashes', 15),
    ],
  },

  // 3. Personal Knowledge Wiki & Second Brain
  {
    id: 'second_brain',
    title: 'Personal Second Brain & Wiki',
    description: 'Zettelkasten knowledge base with fleeting notes, literature summaries, core evergreen mental models, and project links.',
    category: 'Knowledge & Research',
    icon: '🧠',
    coverUrl: 'https://images.unsplash.com/photo-1507842229451-79b1be886a0f?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', '“Knowledge isn’t power until it is applied and interconnected.” — Second Brain Index', 1, {
        icon: '💡',
        bgColor: 'bg-[#ecece4] text-[#2c2c2a] dark:bg-[#2c2c28] dark:text-[#f0f0ea]',
      }),
      makeBlock('2', pageId, 'heading1', '🧠 Knowledge Hub Navigation', 2),
      makeBlock('3', pageId, 'paragraph', 'Welcome to your local brain. Organize your thinking into actionable notes, literature reviews, and evergreen models.', 3),
      makeBlock('4', pageId, 'heading2', '📥 Inbox / Fleeting Notes', 4),
      makeBlock('5', pageId, 'bullet', 'Read: Designing Data-Intensive Applications (Chapter on Local Storage Engines)', 5),
      makeBlock('6', pageId, 'bullet', 'Idea: Implement bi-directional backlink graphs between page blocks', 6),
      makeBlock('7', pageId, 'heading2', '🌲 Evergreen Mental Models', 7),
      makeBlock('8', pageId, 'bullet', 'Local-First Software: Treat local storage as the primary source of truth, sync as a secondary network transport.', 8),
      makeBlock('9', pageId, 'bullet', 'Pareto Principle (80/20): Focus 80% of creative energy on core high-leverage workflows.', 9),
      makeBlock('10', pageId, 'bullet', 'Inversion Thinking: Instead of asking how to succeed, ask what failures would guarantee disaster and avoid them.', 10),
      makeBlock('11', pageId, 'heading2', '📚 Active Reading List', 11),
      makeBlock('12', pageId, 'todo', 'The Pragmatic Programmer — Finish Chapter 4', 12, { checked: true }),
      makeBlock('13', pageId, 'todo', 'Building a Second Brain — Tiago Forte', 13, { checked: true }),
      makeBlock('14', pageId, 'todo', 'System Design Interview — Alex Xu', 14, { checked: false }),
    ],
  },

  // 4. Weekly Meeting Notes & Decision Register
  {
    id: 'meeting_decisions',
    title: 'Team Sync & Decision Register',
    description: 'Structured meeting template with agenda items, real-time discussion notes, and permanent decision log.',
    category: 'Meetings & Ops',
    icon: '🗓️',
    coverUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', 'Meeting Date: Monday 10:00 AM • Facilitator: Project Lead • Attendees: Core Engineering & Design Team', 1, {
        icon: '👥',
        bgColor: 'bg-blue-50/70 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200',
      }),
      makeBlock('2', pageId, 'heading1', '📌 Agenda Items', 2),
      makeBlock('3', pageId, 'bullet', '1. Review current week sprint velocity & release candidate', 3),
      makeBlock('4', pageId, 'bullet', '2. Offline storage diagnostics runner verification', 4),
      makeBlock('5', pageId, 'bullet', '3. Dark and Light theme toggle styling audit', 5),
      makeBlock('6', pageId, 'heading1', '💬 Discussion Notes', 6),
      makeBlock('7', pageId, 'paragraph', 'Discussed user feedback on dark mode contrast in high-ambient lighting. Agreed on preserving the warm earthy palette (#f5f5f0 light / #1c1c1a dark) across all modals.', 7),
      makeBlock('8', pageId, 'heading1', '🎯 Key Decisions Made', 8),
      makeBlock('9', pageId, 'bullet', 'Decision 1: Adopt Service Worker cache-first strategy for zero-latency startup.', 9),
      makeBlock('10', pageId, 'bullet', 'Decision 2: Expand built-in templates library to 12 production presets.', 10),
      makeBlock('11', pageId, 'heading1', '⚡ Action Items & Assignees', 11),
      makeBlock('12', pageId, 'todo', 'Deploy PWA Web Manifest with standalone display mode', 12, { checked: false }),
      makeBlock('13', pageId, 'todo', 'Add interactive Download & Installation guide dialog', 13, { checked: false }),
    ],
  },

  // 5. Client Pipeline & Deal Flow CRM
  {
    id: 'client_crm',
    title: 'Client Pipeline & Deal Flow CRM',
    description: 'Track client relationships, contract valuations, discovery meetings, and milestone invoicing.',
    category: 'Product & Strategy',
    icon: '💼',
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', 'Pipeline Valuation: $145,000 active pipeline • 4 proposals in final review', 1, {
        icon: '💼',
        bgColor: 'bg-emerald-50/80 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200',
      }),
      makeBlock('2', pageId, 'heading1', '🔥 Qualified Leads & Stage Tracker', 2),
      makeBlock('3', pageId, 'bullet', 'Acme Corp ($45,000) — Enterprise local-first knowledge management pilot. Next: Contract signature.', 3),
      makeBlock('4', pageId, 'bullet', 'Veritas Labs ($60,000) — Offline database migration & custom audit tools. Next: Security review.', 4),
      makeBlock('5', pageId, 'bullet', 'Starlight Studio ($40,000) — Design system & template integration. Next: SOW draft.', 5),
      makeBlock('6', pageId, 'heading2', '📞 Recent Outreach & Discovery Log', 6),
      makeBlock('7', pageId, 'quote', 'Client Quote: “We need an editor that guarantees privacy and never loses a keystroke when Wi-Fi drops.”', 7),
      makeBlock('8', pageId, 'heading2', '✅ Next Action Items', 8),
      makeBlock('9', pageId, 'todo', 'Send updated pricing proposal to Acme Corp procurement', 9, { checked: false }),
      makeBlock('10', pageId, 'todo', 'Schedule technical architecture walkthrough with Veritas Labs', 10, { checked: false }),
    ],
  },

  // 6. Project Blueprint & Milestone Plan
  {
    id: 'project_blueprint',
    title: 'Project Blueprint & Milestone Plan',
    description: 'High-level project roadmap with phase milestones, deliverable checklists, and risk assessments.',
    category: 'Product & Strategy',
    icon: '🎯',
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', 'Project Objective: Launch offline-first Ration application with zero network dependency.', 1, {
        icon: '🎯',
        bgColor: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200',
      }),
      makeBlock('2', pageId, 'heading1', 'Key Milestones', 2),
      makeBlock('3', pageId, 'todo', 'Phase 1: Local persistence layer (IndexedDB / SQLite)', 3, { checked: true }),
      makeBlock('4', pageId, 'todo', 'Phase 2: Notion block editor and Slash commands', 4, { checked: true }),
      makeBlock('5', pageId, 'todo', 'Phase 3: Database Table & Kanban board views', 5, { checked: true }),
      makeBlock('6', pageId, 'todo', 'Phase 4: Automated backup export (.rationbackup) & restore', 6, { checked: true }),
      makeBlock('7', pageId, 'todo', 'Phase 5: Offline PWA manifest and desktop installation engine', 7, { checked: false }),
    ],
  },

  // 7. Daily Energy & Habit Protocol
  {
    id: 'daily_habits',
    title: 'Daily Energy & Habit Protocol',
    description: 'Personal routine tracker for morning hydration, deep work intervals, workout log, and evening reflection.',
    category: 'Productivity & Habits',
    icon: '🌱',
    coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', '“We are what we repeatedly do. Excellence, then, is not an act, but a habit.”', 1, {
        icon: '☀️',
        bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200',
      }),
      makeBlock('2', pageId, 'heading1', '🌅 Morning Protocol', 2),
      makeBlock('3', pageId, 'todo', '500ml water + electrolytes upon waking', 3, { checked: true }),
      makeBlock('4', pageId, 'todo', '10-minute natural sunlight exposure & morning walk', 4, { checked: true }),
      makeBlock('5', pageId, 'todo', 'Plan top 3 MITs (Most Important Tasks) for the day', 5, { checked: true }),
      makeBlock('6', pageId, 'heading1', '⚡ Deep Work Sessions', 6),
      makeBlock('7', pageId, 'todo', 'Session 1: 90 minutes high-focus coding (no notifications)', 7, { checked: false }),
      makeBlock('8', pageId, 'todo', 'Session 2: 60 minutes architecture and documentation', 8, { checked: false }),
      makeBlock('9', pageId, 'heading1', '🌙 Evening Reflection & Wind-down', 9),
      makeBlock('10', pageId, 'todo', 'Log 3 wins from today in Ration workspace', 10, { checked: false }),
      makeBlock('11', pageId, 'todo', 'Screen off 45 minutes before sleep & read fiction', 11, { checked: false }),
    ],
  },

  // 8. Academic Research & Literature Notes
  {
    id: 'research_thesis',
    title: 'Academic Research & Literature Review',
    description: 'Structured framework for recording research hypotheses, source citations, experimental findings, and thesis outlines.',
    category: 'Knowledge & Research',
    icon: '📚',
    coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', 'Research Topic: Conflict-Free Replicated Data Types (CRDTs) in Browser Local-First Storage Engines', 1, {
        icon: '🔬',
        bgColor: 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/40 dark:text-purple-200',
      }),
      makeBlock('2', pageId, 'heading1', '1. Research Question & Hypothesis', 2),
      makeBlock('3', pageId, 'paragraph', 'Can hybrid SQLite-IndexedDB architectures achieve deterministic offline conflict resolution while preserving sub-10ms transactional block commits?', 3),
      makeBlock('4', pageId, 'heading1', '2. Key Literature & Citations', 4),
      makeBlock('5', pageId, 'bullet', 'Kleppmann et al. (2019): "Local-first software: You own your data, in spite of the cloud"', 5),
      makeBlock('6', pageId, 'bullet', 'Shapiro et al. (2011): "Conflict-free Replicated Data Types (CRDTs)"', 6),
      makeBlock('7', pageId, 'heading1', '3. Experimental Observations', 7),
      makeBlock('8', pageId, 'quote', 'IndexedDB key-value stores demonstrate 99.4% reliable write performance when combined with in-memory write queues.', 8),
      makeBlock('9', pageId, 'heading1', '4. Outstanding Questions', 9),
      makeBlock('10', pageId, 'todo', 'Benchmark multi-tab Dexie transaction locking under continuous 100Hz write stream', 10, { checked: false }),
    ],
  },

  // 9. Content Production & Editorial Pipeline
  {
    id: 'content_planner',
    title: 'Content Creator & Editorial Pipeline',
    description: 'Editorial calendar for tracking YouTube videos, technical blog posts, newsletters, and distribution assets.',
    category: 'Productivity & Habits',
    icon: '🎬',
    coverUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', 'Publishing Cadence: 1 Deep-Dive Article / Week • 2 Technical Shorts / Week', 1, {
        icon: '🎥',
        bgColor: 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200',
      }),
      makeBlock('2', pageId, 'heading1', '📅 Upcoming Publication Schedule', 2),
      makeBlock('3', pageId, 'bullet', 'Article: Why Local-First Apps Are the Future of Desktop Productivity (Drafting)', 3),
      makeBlock('4', pageId, 'bullet', 'Video: Building a SQLite + React Block Editor in 2026 (Scripting)', 4),
      makeBlock('5', pageId, 'heading1', '📝 Video Outline & Key Talking Points', 5),
      makeBlock('6', pageId, 'bullet', 'Hook: Why cloud notes feel slow and disconnect you from your data', 6),
      makeBlock('7', pageId, 'bullet', 'Architecture: How Ration uses IndexedDB + SQLite to store data offline', 7),
      makeBlock('8', pageId, 'bullet', 'Demo: Instantaneous drag-and-drop Kanban, slash commands, and diagnostics', 8),
      makeBlock('9', pageId, 'heading1', '✅ Pre-Publish Checklist', 9),
      makeBlock('10', pageId, 'todo', 'Generate high-res thumbnail with natural tone typography', 10, { checked: false }),
      makeBlock('11', pageId, 'todo', 'Proofread code snippets and verify repository links', 11, { checked: false }),
    ],
  },

  // 10. Company OKRs & Strategic Alignment
  {
    id: 'company_okrs',
    title: 'Quarterly OKRs & Strategic Alignment',
    description: 'Set ambitious quarterly objectives with measurable key results, ownership assignments, and scorecards.',
    category: 'Product & Strategy',
    icon: '🏆',
    coverUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', 'Q3 Strategic Focus: Product Stability, Offline First-Class Experience, and User Autonomy.', 1, {
        icon: '🏆',
        bgColor: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200',
      }),
      makeBlock('2', pageId, 'heading1', 'Objective 1: Establish Ration as the gold standard in local productivity', 2),
      makeBlock('3', pageId, 'bullet', 'KR 1.1: Achieve 100% test coverage on storage health check runner', 3),
      makeBlock('4', pageId, 'bullet', 'KR 1.2: Maintain sub-5ms input latency across all block transformations', 4),
      makeBlock('5', pageId, 'bullet', 'KR 1.3: Enable zero-configuration PWA installation across Chrome, Safari & Edge', 5),
      makeBlock('6', pageId, 'heading1', 'Objective 2: Expand Template Ecosystem', 6),
      makeBlock('7', pageId, 'bullet', 'KR 2.1: Ship 12 built-in production templates covering engineering, business, and research', 7),
      makeBlock('8', pageId, 'bullet', 'KR 2.2: Add instant one-click template instantiation from sidebar & modal', 8),
    ],
  },

  // 11. System Architecture Decision Record (ADR)
  {
    id: 'system_architecture',
    title: 'System Architecture Decision Record (ADR)',
    description: 'Record architectural design choices, trade-offs, alternatives considered, and long-term implications.',
    category: 'Engineering & Tech',
    icon: '🏛️',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', 'ADR-007 • Status: Accepted • Deciders: Core Engineering • Date: 2026-08-24', 1, {
        icon: '🏛️',
        bgColor: 'bg-[#5a5a40]/10 text-[#2c2c2a] dark:text-[#f0f0ea]',
      }),
      makeBlock('2', pageId, 'heading1', '1. Context & Problem Statement', 2),
      makeBlock('3', pageId, 'paragraph', 'We require a persistent storage architecture that operates in both browser environments (IndexedDB) and native desktop shells (SQLite WAL) with a unified repository interface.', 3),
      makeBlock('4', pageId, 'heading1', '2. Decision Outcome', 4),
      makeBlock('5', pageId, 'bullet', 'Adopt Dexie.js as the primary transactional abstraction layer for web and Tauri webviews.', 5),
      makeBlock('6', pageId, 'bullet', 'Implement StorageHealthCheckRunner for continuous automated self-healing and I/O latency monitoring.', 6),
      makeBlock('7', pageId, 'heading1', '3. Consequences & Trade-offs', 7),
      makeBlock('8', pageId, 'bullet', 'Positive: Zero server requirements, instant load times, and complete user data sovereignty.', 8),
      makeBlock('9', pageId, 'bullet', 'Positive: Portable JSON backups (.rationbackup) allow seamless migrations across machines.', 9),
      makeBlock('10', pageId, 'bullet', 'Negative: Multi-device sync requires local backup export/import or peer-to-peer sync.', 10),
    ],
  },

  // 12. Meal Prep & Nutrition Planner
  {
    id: 'weekly_meal_prep',
    title: 'Meal Prep & Nutrition Planner',
    description: 'Weekly meal calendar, macronutrient targets, categorized grocery shopping list, and recipe notes.',
    category: 'Productivity & Habits',
    icon: '🥗',
    coverUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80',
    generateBlocks: (pageId) => [
      makeBlock('1', pageId, 'callout', 'Weekly Nutrition Focus: High protein, Mediterranean whole foods, 3L daily hydration', 1, {
        icon: '🥑',
        bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200',
      }),
      makeBlock('2', pageId, 'heading1', '🍽️ Weekly Meal Schedule', 2),
      makeBlock('3', pageId, 'bullet', 'Monday: Grilled Lemon Herb Chicken with Roasted Mediterranean Vegetables & Quinoa', 3),
      makeBlock('4', pageId, 'bullet', 'Tuesday: Wild Salmon Bowl with Avocado, Edamame, and Brown Rice', 4),
      makeBlock('5', pageId, 'bullet', 'Wednesday: Spiced Chickpea & Spinach Curry with Basmati', 5),
      makeBlock('6', pageId, 'bullet', 'Thursday: Grass-fed Beef Stir-Fry with Bok Choy and Ginger', 6),
      makeBlock('7', pageId, 'heading1', '🛒 Categorized Grocery List', 7),
      makeBlock('8', pageId, 'todo', 'Produce: Spinach, Kale, Avocados, Lemons, Ginger, Garlic, Sweet Potatoes', 8, { checked: true }),
      makeBlock('9', pageId, 'todo', 'Proteins: Chicken breasts, Salmon fillets, Greek yogurt, Eggs', 9, { checked: false }),
      makeBlock('10', pageId, 'todo', 'Pantry: Extra Virgin Olive Oil, Quinoa, Brown Rice, Chia Seeds, Walnuts', 10, { checked: false }),
    ],
  },
];
