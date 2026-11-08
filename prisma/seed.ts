import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "devquestdemo";

async function upsertSkills() {
  const skills = [
    { key: "Frontend", title: "Frontend" },
    { key: "Backend", title: "Backend" },
    { key: "Database", title: "Database" },
    { key: "Testing", title: "Testing" },
    { key: "DevOps", title: "DevOps" },
    { key: "UX_UI", title: "UX/UI" },
    { key: "Git", title: "Git" },
    { key: "Teamwork", title: "Teamwork" },
    { key: "Documentation", title: "Documentation" },
    { key: "ProductThinking", title: "Product Thinking" },
  ] as const;

  for (const s of skills) {
    await prisma.skill.upsert({
      where: { key: s.key },
      update: { title: s.title },
      create: s,
    });
  }
}

async function upsertDemoUsers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: "demo.leader@devquest.local" },
    update: {},
    create: {
      email: "demo.leader@devquest.local",
      name: "Demo Leader",
      passwordHash,
      locale: "en",
    },
  });

  await prisma.user.upsert({
    where: { email: "demo.member@devquest.local" },
    update: {},
    create: {
      email: "demo.member@devquest.local",
      name: "Demo Member",
      passwordHash,
      locale: "pl",
    },
  });

  await prisma.user.upsert({
    where: { email: "demo.solo@devquest.local" },
    update: {},
    create: {
      email: "demo.solo@devquest.local",
      name: "Demo Solo",
      passwordHash,
      locale: "en",
      preferredDirection: "Full-stack product delivery",
      totalXp: 2400,
      level: 4,
    },
  });
}

type SeedQuest = {
  chapterKey: "foundation" | "core-booking" | "release";
  slug: string;
  title: string;
  questType: "MAIN" | "SIDE";
  category:
    | "PLANNING"
    | "SETUP"
    | "FRONTEND"
    | "BACKEND"
    | "DATABASE"
    | "TESTING"
    | "DEVOPS"
    | "UX_UI"
    | "GIT"
    | "DOCUMENTATION"
    | "TEAMWORK"
    | "PRODUCT";
  difficulty: number;
  estimatedMinutes: number;
  baseXp: number;
  isRequired: boolean;
  isMainQuest: boolean;
  order: number;
  description: string;
  businessDescription: string;
  technicalGoal: string;
  acceptanceCriteria: string[];
};

async function upsertBookingCrisis() {
  const campaign = await prisma.campaignTemplate.upsert({
    where: { slug: "booking-crisis" },
    update: {
      title: "Booking Crisis",
      description:
        "A local service business needs a reliable online booking system because its phone and paper-based process causes mistakes, double bookings and availability conflicts.",
      businessProblem:
        "BrightLane Studio relies on phone calls and a paper diary to schedule appointments. Staff write bookings by hand, availability is unclear, and customers receive conflicting confirmations. The owner loses revenue from no-shows, double bookings, and hours spent fixing scheduling mistakes.",
      projectGoal:
        "Deliver a dependable online booking application that lets customers reserve services online, shows real availability, and gives employees a simple view of upcoming appointments.",
      scope:
        "MVP covers service catalog, employee availability, customer booking flow, double-booking prevention, employee dashboard, validation, responsive UI, README, and a deployable release. Advanced notifications and complex rescheduling may be deferred based on client decisions.",
      prerequisites: [
        "Basic HTML, CSS, and JavaScript",
        "Git fundamentals (clone, commit, branch)",
        "Willingness to collaborate and document decisions",
      ],
      skillKeys: [
        "Frontend",
        "Backend",
        "Database",
        "Testing",
        "Git",
        "Teamwork",
        "Documentation",
        "ProductThinking",
      ],
      difficulty: "BEGINNER",
      estimatedDuration: "2–4 weeks",
      minimumTeamSize: 1,
      maximumTeamSize: 4,
      supportsSolo: true,
      status: "PUBLISHED",
      coverImage: "/campaigns/booking-crisis.png",
    },
    create: {
      title: "Booking Crisis",
      slug: "booking-crisis",
      description:
        "A local service business needs a reliable online booking system because its phone and paper-based process causes mistakes, double bookings and availability conflicts.",
      businessProblem:
        "BrightLane Studio relies on phone calls and a paper diary to schedule appointments. Staff write bookings by hand, availability is unclear, and customers receive conflicting confirmations. The owner loses revenue from no-shows, double bookings, and hours spent fixing scheduling mistakes.",
      projectGoal:
        "Deliver a dependable online booking application that lets customers reserve services online, shows real availability, and gives employees a simple view of upcoming appointments.",
      scope:
        "MVP covers service catalog, employee availability, customer booking flow, double-booking prevention, employee dashboard, validation, responsive UI, README, and a deployable release. Advanced notifications and complex rescheduling may be deferred based on client decisions.",
      prerequisites: [
        "Basic HTML, CSS, and JavaScript",
        "Git fundamentals (clone, commit, branch)",
        "Willingness to collaborate and document decisions",
      ],
      skillKeys: [
        "Frontend",
        "Backend",
        "Database",
        "Testing",
        "Git",
        "Teamwork",
        "Documentation",
        "ProductThinking",
      ],
      difficulty: "BEGINNER",
      estimatedDuration: "2–4 weeks",
      minimumTeamSize: 1,
      maximumTeamSize: 4,
      supportsSolo: true,
      status: "PUBLISHED",
      coverImage: "/campaigns/booking-crisis.png",
    },
  });

  const chapters = [
    {
      key: "foundation",
      title: "Foundation",
      order: 1,
      description:
        "Align on requirements, repository workflow, project structure, database model, and team responsibilities before writing feature code.",
    },
    {
      key: "core-booking",
      title: "Core Booking",
      order: 2,
      description:
        "Build the essential booking experience: services, employees, booking form, persistence, slot availability, and conflict prevention.",
    },
    {
      key: "release",
      title: "Release",
      order: 3,
      description:
        "Stabilize the product with responsive behaviour, tests, documentation, deployment preparation, and client review.",
    },
  ] as const;

  const chapterIdByKey: Record<(typeof chapters)[number]["key"], string> = {
    foundation: "",
    "core-booking": "",
    release: "",
  };

  for (const c of chapters) {
    const chapter = await prisma.campaignChapterTemplate.upsert({
      where: { id: `${campaign.id}-${c.key}` },
      update: {
        campaignTemplateId: campaign.id,
        title: c.title,
        order: c.order,
        description: c.description,
      },
      create: {
        id: `${campaign.id}-${c.key}`,
        campaignTemplateId: campaign.id,
        title: c.title,
        order: c.order,
        description: c.description,
      },
    });
    chapterIdByKey[c.key] = chapter.id;
  }

  const quests: SeedQuest[] = [
    // Chapter 1
    {
      chapterKey: "foundation",
      slug: "analyze-requirements",
      title: "Analyse the business requirements",
      questType: "MAIN",
      category: "PRODUCT",
      difficulty: 1,
      estimatedMinutes: 90,
      baseXp: 120,
      isRequired: true,
      isMainQuest: true,
      order: 1,
      description: "Clarify what the booking system must do and what is out of scope for MVP.",
      businessDescription: "Reduce mistakes and conflicts via a clear single process for bookings.",
      technicalGoal: "Produce a requirements document with assumptions and edge cases.",
      acceptanceCriteria: ["Core entities listed", "MVP scope defined", "Edge cases documented"],
    },
    {
      chapterKey: "foundation",
      slug: "select-tech-stack",
      title: "Select the technology stack",
      questType: "MAIN",
      category: "PLANNING",
      difficulty: 1,
      estimatedMinutes: 60,
      baseXp: 90,
      isRequired: true,
      isMainQuest: true,
      order: 2,
      description: "Pick the stack and justify trade-offs for a small team project.",
      businessDescription: "Choose tools that enable safe, fast delivery.",
      technicalGoal: "Document stack, risks and mitigations.",
      acceptanceCriteria: ["Stack documented", "Risks noted", "Decision committed to repo"],
    },
    {
      chapterKey: "foundation",
      slug: "create-github-repo",
      title: "Create the GitHub repository",
      questType: "MAIN",
      category: "GIT",
      difficulty: 1,
      estimatedMinutes: 30,
      baseXp: 60,
      isRequired: true,
      isMainQuest: true,
      order: 3,
      description: "Create a repository and ensure the team can collaborate safely.",
      businessDescription: "Enable collaboration, review, history and traceability.",
      technicalGoal: "Initialize repo with templates and basic protections.",
      acceptanceCriteria: ["Repo created", "Default branch set", "Templates added"],
    },
    {
      chapterKey: "foundation",
      slug: "define-branching-strategy",
      title: "Define the branching strategy",
      questType: "MAIN",
      category: "GIT",
      difficulty: 1,
      estimatedMinutes: 45,
      baseXp: 70,
      isRequired: true,
      isMainQuest: true,
      order: 4,
      description: "Define how the team uses branches, PRs and reviews.",
      businessDescription: "Reduce conflicts and ensure consistent delivery cadence.",
      technicalGoal: "Write a short doc describing branch naming and PR rules.",
      acceptanceCriteria: ["Branch naming", "PR workflow", "Review responsibility"],
    },
    {
      chapterKey: "foundation",
      slug: "prepare-project-structure",
      title: "Prepare the project structure",
      questType: "MAIN",
      category: "SETUP",
      difficulty: 2,
      estimatedMinutes: 90,
      baseXp: 140,
      isRequired: true,
      isMainQuest: true,
      order: 5,
      description: "Set up the base project skeleton and quality tooling.",
      businessDescription: "Start with maintainable structure to avoid rework later.",
      technicalGoal: "Create folders, lint/format scripts, and env validation.",
      acceptanceCriteria: ["Folders created", "Scripts added", "CI stub added"],
    },
    {
      chapterKey: "foundation",
      slug: "initial-db-model",
      title: "Design the initial database model",
      questType: "MAIN",
      category: "DATABASE",
      difficulty: 2,
      estimatedMinutes: 120,
      baseXp: 160,
      isRequired: true,
      isMainQuest: true,
      order: 6,
      description: "Model the booking domain and key DevQuest entities at a high level.",
      businessDescription: "Avoid data loss and broken flows by designing schema early.",
      technicalGoal: "Draft entities and relationships; identify constraints.",
      acceptanceCriteria: ["Entities defined", "Constraints listed", "Migration created"],
    },
    {
      chapterKey: "foundation",
      slug: "team-responsibilities",
      title: "Define team responsibilities",
      questType: "MAIN",
      category: "TEAMWORK",
      difficulty: 1,
      estimatedMinutes: 45,
      baseXp: 70,
      isRequired: true,
      isMainQuest: true,
      order: 7,
      description: "Assign ownership areas and communication rules.",
      businessDescription: "Reduce bottlenecks and make ownership explicit.",
      technicalGoal: "Create a responsibility matrix with owners and backups.",
      acceptanceCriteria: ["Owners assigned", "Backups assigned", "Decision logged"],
    },
    {
      chapterKey: "foundation",
      slug: "wireframes",
      title: "Create initial wireframes",
      questType: "SIDE",
      category: "UX_UI",
      difficulty: 1,
      estimatedMinutes: 60,
      baseXp: 60,
      isRequired: false,
      isMainQuest: false,
      order: 8,
      description: "Sketch the booking flow and admin surfaces to align the team.",
      businessDescription: "Early alignment reduces rework and client surprises.",
      technicalGoal: "Wireframe booking form, list views and cancellation flow.",
      acceptanceCriteria: ["Main screens sketched", "User flow described"],
    },

    // Chapter 2
    {
      chapterKey: "core-booking",
      slug: "services-list",
      title: "Build the services list",
      questType: "MAIN",
      category: "FRONTEND",
      difficulty: 2,
      estimatedMinutes: 90,
      baseXp: 130,
      isRequired: true,
      isMainQuest: true,
      order: 1,
      description: "Implement services list UI and server-side read path.",
      businessDescription: "Users must choose what they’re booking.",
      technicalGoal: "Create service model and list screen with empty/error states.",
      acceptanceCriteria: ["List screen", "Server-side read", "Empty/error states"],
    },
    {
      chapterKey: "core-booking",
      slug: "employees-list",
      title: "Build the employees list",
      questType: "MAIN",
      category: "FRONTEND",
      difficulty: 2,
      estimatedMinutes: 90,
      baseXp: 130,
      isRequired: true,
      isMainQuest: true,
      order: 2,
      description: "Implement employees list with basic filtering.",
      businessDescription: "Customers select staff or get assigned automatically.",
      technicalGoal: "Create employee model and list UI with empty/error states.",
      acceptanceCriteria: ["List UI", "Filtering", "Empty/error states"],
    },
    {
      chapterKey: "core-booking",
      slug: "booking-form",
      title: "Create the booking form",
      questType: "MAIN",
      category: "FRONTEND",
      difficulty: 3,
      estimatedMinutes: 180,
      baseXp: 220,
      isRequired: true,
      isMainQuest: true,
      order: 3,
      description: "Build booking form with validation.",
      businessDescription: "Customers book appointments without calling.",
      technicalGoal: "React Hook Form + Zod; accessible input states.",
      acceptanceCriteria: ["Validated form", "Accessible navigation", "Clear errors"],
    },
    {
      chapterKey: "core-booking",
      slug: "save-booking",
      title: "Save a booking",
      questType: "MAIN",
      category: "BACKEND",
      difficulty: 3,
      estimatedMinutes: 150,
      baseXp: 200,
      isRequired: true,
      isMainQuest: true,
      order: 4,
      description: "Persist bookings in the database with validation.",
      businessDescription: "Bookings must be reliable and traceable.",
      technicalGoal: "Server action/route handler with Zod validation.",
      acceptanceCriteria: ["Booking saved", "Server validation", "Graceful errors"],
    },
    {
      chapterKey: "core-booking",
      slug: "available-time-slots",
      title: "Display available time slots",
      questType: "MAIN",
      category: "BACKEND",
      difficulty: 3,
      estimatedMinutes: 180,
      baseXp: 220,
      isRequired: true,
      isMainQuest: true,
      order: 5,
      description: "Compute available time slots for selected service and employee.",
      businessDescription: "Avoid phone calls and reduce confusion.",
      technicalGoal: "Slot generation that considers business hours and existing bookings.",
      acceptanceCriteria: ["Slots computed", "Edge cases handled", "Timezone noted"],
    },
    {
      chapterKey: "core-booking",
      slug: "prevent-double-booking",
      title: "Prevent double booking",
      questType: "MAIN",
      category: "DATABASE",
      difficulty: 4,
      estimatedMinutes: 180,
      baseXp: 250,
      isRequired: true,
      isMainQuest: true,
      order: 6,
      description: "Enforce constraints to prevent two bookings for the same slot.",
      businessDescription: "Double bookings damage trust and create cancellations.",
      technicalGoal: "Use transactions/constraints and handle race conditions.",
      acceptanceCriteria: ["Constraint enforced", "Concurrency considered", "User-friendly error"],
    },
    {
      chapterKey: "core-booking",
      slug: "employee-dashboard",
      title: "Create the employee dashboard",
      questType: "MAIN",
      category: "FRONTEND",
      difficulty: 3,
      estimatedMinutes: 150,
      baseXp: 200,
      isRequired: true,
      isMainQuest: true,
      order: 7,
      description: "Create staff dashboard for upcoming bookings.",
      businessDescription: "Employees need visibility and ability to act on bookings.",
      technicalGoal: "List upcoming bookings with loading/empty states.",
      acceptanceCriteria: ["Upcoming list", "States handled", "Access guarded"],
    },
    {
      chapterKey: "core-booking",
      slug: "booking-cancellation",
      title: "Add booking cancellation",
      questType: "SIDE",
      category: "BACKEND",
      difficulty: 2,
      estimatedMinutes: 90,
      baseXp: 120,
      isRequired: false,
      isMainQuest: false,
      order: 8,
      description: "Allow cancelling a booking and reflect it in staff views.",
      businessDescription: "Reduce no-shows and keep availability correct.",
      technicalGoal: "Cancellation field + server validation + minimal UI affordance.",
      acceptanceCriteria: ["Booking can be cancelled", "Reason stored", "State reflected"],
    },
    {
      chapterKey: "core-booking",
      slug: "validation-and-errors",
      title: "Add validation and error handling",
      questType: "MAIN",
      category: "TESTING",
      difficulty: 2,
      estimatedMinutes: 90,
      baseXp: 140,
      isRequired: true,
      isMainQuest: true,
      order: 9,
      description: "Harden inputs and ensure consistent error states.",
      businessDescription: "Fewer failed bookings and support issues.",
      technicalGoal: "Zod schemas across server actions, consistent error surfaces.",
      acceptanceCriteria: [
        "Server errors handled",
        "Client messages clear",
        "Invalid inputs blocked",
      ],
    },

    // Chapter 3
    {
      chapterKey: "release",
      slug: "responsive-behaviour",
      title: "Add responsive behaviour",
      questType: "MAIN",
      category: "UX_UI",
      difficulty: 2,
      estimatedMinutes: 120,
      baseXp: 160,
      isRequired: true,
      isMainQuest: true,
      order: 1,
      description: "Make booking flow and dashboards usable on mobile and tablet.",
      businessDescription: "Mobile users must be able to book without friction.",
      technicalGoal: "Audit breakpoints, simplify complex views, verify accessibility.",
      acceptanceCriteria: ["Mobile layout works", "No horizontal scroll", "Tap targets OK"],
    },
    {
      chapterKey: "release",
      slug: "test-booking-flow",
      title: "Test the booking flow",
      questType: "MAIN",
      category: "TESTING",
      difficulty: 3,
      estimatedMinutes: 150,
      baseXp: 200,
      isRequired: true,
      isMainQuest: true,
      order: 2,
      description: "Add tests for critical booking scenarios.",
      businessDescription: "Prevent regressions before release.",
      technicalGoal: "Add a minimal unit/e2e plan and run in CI.",
      acceptanceCriteria: ["Critical tests exist", "CI runs tests", "Flake risk noted"],
    },
    {
      chapterKey: "release",
      slug: "prepare-readme",
      title: "Prepare README",
      questType: "MAIN",
      category: "DOCUMENTATION",
      difficulty: 1,
      estimatedMinutes: 60,
      baseXp: 90,
      isRequired: true,
      isMainQuest: true,
      order: 3,
      description: "Write a professional README for developers and recruiters.",
      businessDescription: "Improve credibility and onboarding speed.",
      technicalGoal: "Explain stack, setup, env vars, DB, tests, deployment.",
      acceptanceCriteria: ["Setup steps", "Env vars", "Testing instructions"],
    },
    {
      chapterKey: "release",
      slug: "prepare-deployment",
      title: "Prepare deployment",
      questType: "MAIN",
      category: "DEVOPS",
      difficulty: 2,
      estimatedMinutes: 120,
      baseXp: 160,
      isRequired: true,
      isMainQuest: true,
      order: 4,
      description: "Prepare deployment plan and environment configuration.",
      businessDescription: "Ship quickly and repeatably.",
      technicalGoal: "Select provider, document env vars, confirm build pipeline.",
      acceptanceCriteria: ["Provider chosen", "Env vars listed", "Build confirmed"],
    },
    {
      chapterKey: "release",
      slug: "fix-release-blockers",
      title: "Fix release blockers",
      questType: "MAIN",
      category: "PRODUCT",
      difficulty: 2,
      estimatedMinutes: 90,
      baseXp: 140,
      isRequired: true,
      isMainQuest: true,
      order: 5,
      description: "Resolve critical issues before shipping.",
      businessDescription: "Protect user trust and reduce support load.",
      technicalGoal: "Triage, fix, verify with tests.",
      acceptanceCriteria: ["Blockers cleared", "Regression risk noted", "Fixes validated"],
    },
    {
      chapterKey: "release",
      slug: "client-review",
      title: "Complete the client review",
      questType: "MAIN",
      category: "TEAMWORK",
      difficulty: 1,
      estimatedMinutes: 60,
      baseXp: 90,
      isRequired: true,
      isMainQuest: true,
      order: 6,
      description: "Walk through the solution with the client and record feedback.",
      businessDescription: "Align expectations and secure approval.",
      technicalGoal: "Demo plan + notes + follow-ups.",
      acceptanceCriteria: ["Demo done", "Feedback recorded", "Follow-ups created"],
    },
    {
      chapterKey: "release",
      slug: "publish-application",
      title: "Publish the application",
      questType: "MAIN",
      category: "DEVOPS",
      difficulty: 2,
      estimatedMinutes: 90,
      baseXp: 140,
      isRequired: true,
      isMainQuest: true,
      order: 7,
      description: "Publish the booking system and verify production checklist.",
      businessDescription: "Deliver a complete working product.",
      technicalGoal: "Deploy, verify critical path, document rollback plan.",
      acceptanceCriteria: ["App deployed", "Critical path verified", "Rollback plan documented"],
    },
  ];

  // Replace quests for this campaign (idempotent seed)
  await prisma.questAssignment.deleteMany({
    where: {
      projectQuest: { questTemplate: { chapterTemplate: { campaignTemplateId: campaign.id } } },
    },
  });
  await prisma.questSubmission.deleteMany({
    where: {
      projectQuest: { questTemplate: { chapterTemplate: { campaignTemplateId: campaign.id } } },
    },
  });
  await prisma.questComment.deleteMany({
    where: {
      projectQuest: { questTemplate: { chapterTemplate: { campaignTemplateId: campaign.id } } },
    },
  });
  await prisma.projectQuest.deleteMany({
    where: { questTemplate: { chapterTemplate: { campaignTemplateId: campaign.id } } },
  });
  await prisma.questDependencyTemplate.deleteMany({
    where: { questTemplate: { chapterTemplate: { campaignTemplateId: campaign.id } } },
  });
  await prisma.questSkillRewardTemplate.deleteMany({
    where: { questTemplate: { chapterTemplate: { campaignTemplateId: campaign.id } } },
  });
  await prisma.questTemplate.deleteMany({
    where: { chapterTemplate: { campaignTemplateId: campaign.id } },
  });

  const questIdBySlug: Record<string, string> = {};
  for (const q of quests) {
    const created = await prisma.questTemplate.create({
      data: {
        chapterTemplateId: chapterIdByKey[q.chapterKey],
        title: q.title,
        slug: q.slug,
        questType: q.questType,
        category: q.category,
        description: q.description,
        businessDescription: q.businessDescription,
        technicalGoal: q.technicalGoal,
        difficulty: q.difficulty,
        estimatedMinutes: q.estimatedMinutes,
        baseXp: q.baseXp,
        isRequired: q.isRequired,
        isMainQuest: q.isMainQuest,
        order: q.order,
        unlockRule: "dependencies",
        acceptanceCriteria: q.acceptanceCriteria,
        learningResources: [],
      },
    });
    questIdBySlug[q.slug] = created.id;
  }

  const deps: Array<[string, string]> = [
    ["select-tech-stack", "analyze-requirements"],
    ["create-github-repo", "select-tech-stack"],
    ["define-branching-strategy", "create-github-repo"],
    ["prepare-project-structure", "define-branching-strategy"],
    ["initial-db-model", "prepare-project-structure"],
    ["team-responsibilities", "analyze-requirements"],

    ["services-list", "initial-db-model"],
    ["employees-list", "initial-db-model"],
    ["booking-form", "services-list"],
    ["booking-form", "employees-list"],
    ["save-booking", "booking-form"],
    ["available-time-slots", "save-booking"],
    ["prevent-double-booking", "available-time-slots"],
    ["employee-dashboard", "save-booking"],
    ["booking-cancellation", "save-booking"],
    ["validation-and-errors", "save-booking"],

    ["responsive-behaviour", "employee-dashboard"],
    ["test-booking-flow", "prevent-double-booking"],
    ["prepare-readme", "prepare-project-structure"],
    ["prepare-deployment", "test-booking-flow"],
    ["fix-release-blockers", "prepare-deployment"],
    ["client-review", "fix-release-blockers"],
    ["publish-application", "client-review"],
  ];

  for (const [quest, dependsOn] of deps) {
    const questTemplateId = questIdBySlug[quest];
    const dependsOnQuestTemplateId = questIdBySlug[dependsOn];
    if (!questTemplateId || !dependsOnQuestTemplateId) continue;
    await prisma.questDependencyTemplate.create({
      data: { questTemplateId, dependsOnQuestTemplateId },
    });
  }

  const skills = await prisma.skill.findMany();
  const skillByKey = Object.fromEntries(skills.map((s) => [s.key, s.id]));

  const categorySkillMap: Record<SeedQuest["category"], string[]> = {
    PLANNING: ["ProductThinking", "Teamwork"],
    SETUP: ["Backend", "DevOps"],
    FRONTEND: ["Frontend", "UX_UI"],
    BACKEND: ["Backend", "Database"],
    DATABASE: ["Database", "Backend"],
    TESTING: ["Testing", "Git"],
    DEVOPS: ["DevOps", "Git"],
    UX_UI: ["UX_UI", "Frontend"],
    GIT: ["Git", "Teamwork"],
    DOCUMENTATION: ["Documentation", "Teamwork"],
    TEAMWORK: ["Teamwork", "ProductThinking"],
    PRODUCT: ["ProductThinking", "Documentation"],
  };

  for (const q of quests) {
    const questTemplateId = questIdBySlug[q.slug];
    if (!questTemplateId) continue;
    const skillKeys = categorySkillMap[q.category] ?? ["Teamwork"];
    const split = Math.max(1, Math.floor(q.baseXp / skillKeys.length));
    let remainder = q.baseXp;
    for (const [index, key] of skillKeys.entries()) {
      const skillId = skillByKey[key];
      if (!skillId) continue;
      const xp = index === skillKeys.length - 1 ? remainder : split;
      remainder -= xp;
      await prisma.questSkillRewardTemplate.create({
        data: { questTemplateId, skillId, xp },
      });
    }
  }

  // Client events (Phase 4 will implement behavior; seeded now for realism)
  await prisma.clientEventComment.deleteMany({
    where: { projectClientEvent: { project: { campaignTemplateId: campaign.id } } },
  });
  await prisma.projectClientEvent.deleteMany({
    where: { project: { campaignTemplateId: campaign.id } },
  });
  await prisma.clientEventOptionTemplate.deleteMany({
    where: { clientEventTemplate: { campaignTemplateId: campaign.id } },
  });
  await prisma.clientEventTemplate.deleteMany({ where: { campaignTemplateId: campaign.id } });

  const events = [
    {
      key: "unavailable-dates",
      title: "Unavailable dates",
      subject: "Employees need to block unavailable dates",
      message:
        "Staff need to mark days off so customers are not offered slots when employees are unavailable. Without this, bookings may be accepted for invalid times.",
      triggerType: "QUEST_COMPLETED" as const,
      triggerConfiguration: { questSlug: "initial-db-model" },
      importance: "NORMAL" as const,
      affectedQuestSlugs: ["available-time-slots"],
    },
    {
      key: "rescheduling",
      title: "Rescheduling",
      subject: "Customers need to reschedule bookings",
      message:
        "Several customers asked to move appointments without calling the studio. The client wants a self-service rescheduling flow.",
      triggerType: "CHAPTER_START" as const,
      triggerConfiguration: { chapterOrder: 2 },
      importance: "NORMAL" as const,
      affectedQuestSlugs: ["booking-cancellation"],
    },
    {
      key: "double-booking",
      title: "Double booking incident",
      subject: "A double booking occurred",
      message:
        "Two customers arrived for the same slot during testing. The client is upset and wants assurance this cannot happen in production.",
      triggerType: "QUEST_COMPLETED" as const,
      triggerConfiguration: { questSlug: "prevent-double-booking" },
      importance: "CRITICAL" as const,
      affectedQuestSlugs: ["prevent-double-booking", "test-booking-flow"],
    },
    {
      key: "earlier-release",
      title: "Earlier release",
      subject: "The client wants an earlier release",
      message:
        "The owner asks to launch one week earlier to capture seasonal demand. The team must decide what can be safely compressed.",
      triggerType: "TIME_SINCE_START" as const,
      triggerConfiguration: { daysSinceStart: 7 },
      importance: "HIGH" as const,
      affectedQuestSlugs: ["prepare-deployment", "publish-application"],
    },
    {
      key: "email-notifications",
      title: "Email notifications",
      subject: "The client asks for email notifications",
      message:
        "Customers expect booking confirmations and reminders by email. The client considers this important for trust and reduced no-shows.",
      triggerType: "CHAPTER_START" as const,
      triggerConfiguration: { chapterOrder: 3 },
      importance: "NORMAL" as const,
      affectedQuestSlugs: ["prepare-readme"],
    },
  ] as const;

  const standardOptions = [
    {
      label: "Accept and implement",
      description: "Take the full scope into the current release.",
      decisionType: "ACCEPT" as const,
      healthImpact: -6,
      xpImpact: 60,
      resultMessage: "Scope increased. Delivery risk noted and communicated to the client.",
    },
    {
      label: "Reject with justification",
      description: "Explain why this is out of scope for the current MVP.",
      decisionType: "REJECT" as const,
      healthImpact: -10,
      xpImpact: 10,
      resultMessage: "Client may be dissatisfied. Document the reasoning clearly.",
    },
    {
      label: "Propose limited version",
      description: "Deliver the smallest useful version that addresses the core need.",
      decisionType: "LIMITED" as const,
      healthImpact: -2,
      xpImpact: 40,
      resultMessage: "Pragmatic compromise accepted with documented trade-offs.",
    },
    {
      label: "Defer to next release",
      description: "Log the request and focus on the critical path for this release.",
      decisionType: "DEFER" as const,
      healthImpact: -8,
      xpImpact: 20,
      resultMessage: "Deferred with explicit follow-up items for the next release.",
    },
  ];

  for (const [idx, e] of events.entries()) {
    const affectedIds = e.affectedQuestSlugs.map((slug) => questIdBySlug[slug]).filter(Boolean);

    await prisma.clientEventTemplate.create({
      data: {
        campaignTemplateId: campaign.id,
        chapterTemplateId: null,
        title: e.title,
        subject: e.subject,
        message: e.message,
        triggerType: e.triggerType,
        triggerConfiguration: e.triggerConfiguration,
        responseDeadlineHours: 72,
        affectedQuestTemplateIds: affectedIds,
        order: idx + 1,
        options: {
          create: standardOptions.map((o) => ({
            label: o.label,
            description: o.description,
            decisionType: o.decisionType,
            healthImpact: o.healthImpact,
            xpImpact: o.xpImpact,
            resultMessage: o.resultMessage,
            followUpConfiguration: {},
          })),
        },
      },
    });
  }
}

async function upsertAchievements() {
  for (const def of [
    {
      key: "first_deployment",
      title: "First Deployment",
      description: "Completed the deployment preparation quest.",
      icon: "rocket",
      rarity: "COMMON" as const,
    },
    {
      key: "clean_handoff",
      title: "Clean Handoff",
      description: "Completed client review with project health above 70.",
      icon: "handshake",
      rarity: "RARE" as const,
    },
    {
      key: "review_guardian",
      title: "Review Guardian",
      description: "Accepted three quest submissions as team leader.",
      icon: "shield",
      rarity: "RARE" as const,
    },
    {
      key: "zero_critical_bugs",
      title: "Zero Critical Bugs",
      description: "Resolved the double booking incident without health dropping below 50.",
      icon: "bug",
      rarity: "EPIC" as const,
    },
    {
      key: "team_player",
      title: "Team Player",
      description: "Earned at least 100 teamwork XP on the project.",
      icon: "users",
      rarity: "COMMON" as const,
    },
    {
      key: "scope_negotiator",
      title: "Scope Negotiator",
      description: "Resolved a client event with a limited or deferred decision.",
      icon: "scale",
      rarity: "RARE" as const,
    },
    {
      key: "reliable_contributor",
      title: "Reliable Contributor",
      description: "Completed five quests on the project.",
      icon: "check-circle",
      rarity: "COMMON" as const,
    },
    {
      key: "release_survivor",
      title: "Release Survivor",
      description: "Reached the Release chapter with health above 25.",
      icon: "flag",
      rarity: "EPIC" as const,
    },
  ]) {
    await prisma.achievement.upsert({
      where: { key: def.key },
      update: {
        title: def.title,
        description: def.description,
        icon: def.icon,
        rarity: def.rarity,
      },
      create: def,
    });
  }
}

async function seedDemoProjects() {
  const campaign = await prisma.campaignTemplate.findUnique({ where: { slug: "booking-crisis" } });
  if (!campaign) return;

  const releaseChapter = await prisma.campaignChapterTemplate.findFirst({
    where: { campaignTemplateId: campaign.id, title: "Release" },
  });

  const [leader, member, solo] = await Promise.all([
    prisma.user.findUnique({ where: { email: "demo.leader@devquest.local" } }),
    prisma.user.findUnique({ where: { email: "demo.member@devquest.local" } }),
    prisma.user.findUnique({ where: { email: "demo.solo@devquest.local" } }),
  ]);
  if (!leader || !member || !solo) return;

  const questTemplates = await prisma.questTemplate.findMany({
    where: { chapterTemplate: { campaignTemplateId: campaign.id } },
    select: { id: true, slug: true, isRequired: true, isMainQuest: true },
  });
  const questIdBySlug = Object.fromEntries(questTemplates.map((q) => [q.slug, q.id]));

  const demoStack = {
    frontend: "Next.js",
    backend: "Next.js API Routes",
    database: "PostgreSQL",
    orm: "Prisma",
    authentication: "Auth.js",
    testing: "Playwright",
    deployment: "Vercel",
  };

  async function ensureProjectQuests(projectId: string) {
    const count = await prisma.projectQuest.count({ where: { projectId } });
    if (count > 0) return;
    await prisma.projectQuest.createMany({
      data: questTemplates.map((t) => ({
        projectId,
        questTemplateId: t.id,
        status: "LOCKED" as const,
      })),
    });
  }

  async function setQuestStatuses(
    projectId: string,
    completedSlugs: string[],
    overrides: Record<string, "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "REVIEW" | "COMPLETED"> = {},
  ) {
    await ensureProjectQuests(projectId);
    const now = new Date();
    for (const t of questTemplates) {
      let status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" = "LOCKED";
      if (completedSlugs.includes(t.slug)) status = "COMPLETED";
      if (overrides[t.slug]) status = overrides[t.slug]!;
      await prisma.projectQuest.updateMany({
        where: { projectId, questTemplateId: t.id },
        data: {
          status,
          unlockedAt: status !== "LOCKED" ? now : null,
          startedAt: ["IN_PROGRESS", "REVIEW", "COMPLETED"].includes(status) ? now : null,
          completedAt: status === "COMPLETED" ? now : null,
        },
      });
    }
  }

  const requiredMainSlugs = questTemplates
    .filter((q) => q.isRequired && q.isMainQuest)
    .map((q) => q.slug);

  const almostDoneSlugs = requiredMainSlugs.filter((s) => s !== "publish-application");

  // --- Completed public portfolio project ---
  const publicProjectId = "demo-public-completed-project";
  await prisma.project.upsert({
    where: { id: publicProjectId },
    update: {
      status: "COMPLETED",
      isDemo: true,
      isPublic: true,
      publicSlug: "brightlane-booking",
      solutionDescription:
        "BrightLane Booking is a responsive web application that lets customers reserve studio services online while preventing double bookings through server-side validation and a normalized PostgreSQL schema.",
      repositoryUrl: "https://github.com/example/brightlane-booking",
      liveDemoUrl: "https://brightlane-booking.example.com",
      completedAt: new Date("2025-05-15"),
      projectHealth: 82,
      techStack: demoStack,
    },
    create: {
      id: publicProjectId,
      campaignTemplateId: campaign.id,
      title: "BrightLane Booking",
      slug: "brightlane-booking-demo",
      mode: "TEAM",
      status: "COMPLETED",
      leaderId: leader.id,
      currentChapterId: releaseChapter?.id ?? null,
      projectHealth: 82,
      startedAt: new Date("2025-04-20"),
      completedAt: new Date("2025-05-15"),
      isPublic: true,
      publicSlug: "brightlane-booking",
      repositoryUrl: "https://github.com/example/brightlane-booking",
      liveDemoUrl: "https://brightlane-booking.example.com",
      solutionDescription:
        "BrightLane Booking is a responsive web application that lets customers reserve studio services online while preventing double bookings through server-side validation and a normalized PostgreSQL schema.",
      isDemo: true,
      techStack: demoStack,
      setupStep: "COMPLETED",
      members: {
        create: [
          {
            userId: leader.id,
            role: "LEADER",
            preferredRoles: ["fullstack"],
            approvedRoles: ["fullstack", "testing", "documentation"],
            contributionScore: 420,
            teamworkXp: 180,
          },
          {
            userId: member.id,
            role: "MEMBER",
            preferredRoles: ["frontend"],
            approvedRoles: ["frontend", "ux_ui"],
            contributionScore: 380,
            teamworkXp: 150,
          },
        ],
      },
    },
  });

  await setQuestStatuses(publicProjectId, requiredMainSlugs);

  await prisma.finalReport.upsert({
    where: { projectId: publicProjectId },
    update: {},
    create: {
      projectId: publicProjectId,
      finalGrade: "B",
      finalHealth: 82,
      completionScore: 100,
      teamworkScore: 78,
      testingScore: 85,
      documentationScore: 80,
      adaptabilityScore: 74,
      summary:
        'Campaign "Booking Crisis" completed with grade B. Final health: 82 (Stable). All required main quests completed in 25 days.',
      reportPayload: {
        durationDays: 25,
        requiredQuestsCompleted: requiredMainSlugs.length,
        requiredQuestsTotal: requiredMainSlugs.length,
        optionalQuestsCompleted: 1,
        optionalQuestsTotal: 2,
        unresolvedItems: [],
        clientDecisions: [],
        achievements: [{ title: "First Deployment", rarity: "COMMON" }],
        strongestAreas: ["Frontend", "Backend", "Testing"],
        recommendations: [
          "Consider an intermediate campaign with integrations and deployment hardening.",
        ],
      },
      userReports: {
        create: [
          {
            userId: leader.id,
            questsCompleted: 12,
            commitsSubmitted: 14,
            reviewsCompleted: 8,
            contributionSummary:
              "Demo Leader completed 12 quests, performed 8 reviews, and contributed primarily in fullstack, testing, documentation. Teamwork XP earned: 180.",
            strongestSkills: ["Frontend", "Backend", "Git"],
            improvementAreas: ["UX_UI", "DevOps"],
            finalScore: 88,
            skillXpBreakdown: { Frontend: 420, Backend: 380, Git: 210 },
            roleContribution: ["fullstack", "testing", "documentation"],
            suggestedNextDirection: "Full-stack product delivery",
          },
          {
            userId: member.id,
            questsCompleted: 10,
            commitsSubmitted: 12,
            reviewsCompleted: 2,
            contributionSummary:
              "Demo Member completed 10 quests, performed 2 reviews, and contributed primarily in frontend, ux_ui. Teamwork XP earned: 150.",
            strongestSkills: ["Frontend", "UX_UI", "Git"],
            improvementAreas: ["Backend", "Testing"],
            finalScore: 82,
            skillXpBreakdown: { Frontend: 520, UX_UI: 180, Git: 160 },
            roleContribution: ["frontend", "ux_ui"],
            suggestedNextDirection: "Product-facing frontend engineering",
          },
        ],
      },
    },
  });

  // --- Completed solo project ---
  const soloProjectId = "demo-solo-completed-project";
  await prisma.project.upsert({
    where: { id: soloProjectId },
    update: { status: "COMPLETED", isDemo: true, setupStep: "COMPLETED" },
    create: {
      id: soloProjectId,
      campaignTemplateId: campaign.id,
      title: "Solo Booking MVP",
      slug: "solo-booking-demo",
      mode: "SOLO",
      status: "COMPLETED",
      leaderId: solo.id,
      projectHealth: 76,
      startedAt: new Date("2025-03-01"),
      completedAt: new Date("2025-03-28"),
      isDemo: true,
      techStack: demoStack,
      setupStep: "COMPLETED",
      solutionDescription:
        "A solo delivery of the BrightLane booking MVP with core scheduling flows and deployment documentation.",
      members: {
        create: {
          userId: solo.id,
          role: "LEADER",
          preferredRoles: ["fullstack"],
          approvedRoles: ["fullstack", "testing", "documentation"],
          contributionScore: 500,
          teamworkXp: 40,
        },
      },
    },
  });
  await setQuestStatuses(soloProjectId, requiredMainSlugs);

  // --- Active team project for exploration and e2e ---
  const activeProjectId = "demo-team-active-project";
  const publishQuestTemplateId = questIdBySlug["publish-application"];

  await prisma.finalReport.deleteMany({ where: { projectId: activeProjectId } });
  await prisma.project.upsert({
    where: { id: activeProjectId },
    update: {
      status: "ACTIVE",
      isDemo: true,
      setupStep: "COMPLETED",
      projectHealth: 72,
      techStack: demoStack,
      completedAt: null,
      isPublic: false,
      publicSlug: null,
      solutionDescription: null,
      repositoryUrl: null,
      liveDemoUrl: null,
    },
    create: {
      id: activeProjectId,
      campaignTemplateId: campaign.id,
      title: "BrightLane Team Sprint",
      slug: "demo-team-active",
      mode: "TEAM",
      status: "ACTIVE",
      leaderId: leader.id,
      currentChapterId: releaseChapter?.id ?? null,
      projectHealth: 72,
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      isDemo: true,
      techStack: demoStack,
      setupStep: "COMPLETED",
      members: {
        create: [
          {
            userId: leader.id,
            role: "LEADER",
            preferredRoles: ["fullstack"],
            approvedRoles: ["fullstack", "testing", "documentation"],
            contributionScore: 320,
            teamworkXp: 120,
          },
          {
            userId: member.id,
            role: "MEMBER",
            preferredRoles: ["frontend"],
            approvedRoles: ["frontend", "testing"],
            contributionScore: 280,
            teamworkXp: 95,
          },
        ],
      },
    },
  });

  await setQuestStatuses(activeProjectId, almostDoneSlugs, {
    "publish-application": "IN_PROGRESS",
  });

  if (publishQuestTemplateId) {
    const publishQuest = await prisma.projectQuest.findFirst({
      where: { projectId: activeProjectId, questTemplateId: publishQuestTemplateId },
    });
    if (publishQuest) {
      await prisma.questSubmission.deleteMany({ where: { projectQuestId: publishQuest.id } });
      await prisma.questAssignment.deleteMany({ where: { projectQuestId: publishQuest.id } });
      await prisma.questAssignment.create({
        data: { projectQuestId: publishQuest.id, userId: member.id },
      });
    }
  }

  // Client events for active demo project
  await prisma.projectClientEvent.deleteMany({ where: { projectId: activeProjectId } });
  const clientTemplates = await prisma.clientEventTemplate.findMany({
    where: { campaignTemplateId: campaign.id },
    include: { options: { take: 1 } },
  });
  const tplByTitle = Object.fromEntries(clientTemplates.map((t) => [t.title, t]));

  const doubleBooking = tplByTitle["Double booking incident"];
  if (doubleBooking?.options[0]) {
    await prisma.projectClientEvent.create({
      data: {
        projectId: activeProjectId,
        clientEventTemplateId: doubleBooking.id,
        status: "RESOLVED",
        importance: "CRITICAL",
        selectedOptionId: doubleBooking.options[0].id,
        respondedAt: new Date(),
        resultMessage: doubleBooking.options[0].resultMessage,
      },
    });
  }

  const emailNotifications = tplByTitle["Email notifications"];
  if (emailNotifications?.options[0]) {
    await prisma.projectClientEvent.create({
      data: {
        projectId: activeProjectId,
        clientEventTemplateId: emailNotifications.id,
        status: "PENDING",
        importance: "NORMAL",
        responseDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Sample activities + achievements on active project
  await prisma.projectActivity.deleteMany({ where: { projectId: activeProjectId } });
  await prisma.projectActivity.createMany({
    data: [
      {
        projectId: activeProjectId,
        userId: member.id,
        type: "QUEST_STARTED",
        title: "Quest started",
        description: "Publish the application",
        metadata: {},
      },
      {
        projectId: activeProjectId,
        userId: leader.id,
        type: "CLIENT_EVENT_RESOLVED",
        title: "Client event resolved",
        description: "Double booking incident addressed.",
        metadata: {},
      },
    ],
  });

  const teamPlayer = await prisma.achievement.findUnique({ where: { key: "team_player" } });
  if (teamPlayer) {
    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId_projectId: {
          userId: member.id,
          achievementId: teamPlayer.id,
          projectId: activeProjectId,
        },
      },
      update: {},
      create: {
        userId: member.id,
        projectId: activeProjectId,
        achievementId: teamPlayer.id,
      },
    });
  }

  // Skill XP for profile richness
  const skills = await prisma.skill.findMany();
  const skillMap = Object.fromEntries(skills.map((s) => [s.key, s.id]));
  for (const [userId, entries] of [
    [leader.id, { Frontend: 320, Backend: 280, Git: 150, Teamwork: 120 }],
    [member.id, { Frontend: 400, UX_UI: 120, Git: 100, Teamwork: 95 }],
    [solo.id, { Frontend: 500, Backend: 450, Testing: 200, Documentation: 180 }],
  ] as const) {
    for (const [key, xp] of Object.entries(entries)) {
      const skillId = skillMap[key];
      if (!skillId) continue;
      await prisma.userSkill.upsert({
        where: { userId_skillId: { userId, skillId } },
        update: { xp },
        create: { userId, skillId, xp },
      });
    }
  }
}

async function main() {
  await upsertSkills();
  await upsertDemoUsers();
  await upsertAchievements();
  await upsertBookingCrisis();
  await seedDemoProjects();
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
