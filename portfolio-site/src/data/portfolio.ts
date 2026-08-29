export type Metric = {
  value: string;
  label: string;
};

export type ExternalMetric = {
  value: string;
  label: string;
  year: string;
  sourceName: string;
  sourceUrl: string;
  businessMeaning: string;
};

export type GalleryImageType =
  | "render"
  | "photo"
  | "context-reference"
  | "diagram"
  | "chart"
  | "poster"
  | "technical-drawing"
  | "interface"
  | "project-board"
  | "process";

export type GalleryImage = {
  id: string;
  src: string;
  thumbnailSrc?: string;
  alt: string;
  caption: string;
  type: GalleryImageType;
  fit?: "cover" | "contain";
  aspectRatio: string;
  background?: string;
  sizeX: number;
  sizeY: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
  sourceName: string;
  sourceUrl?: string;
  license?: string;
};

export type StakeholderValue = {
  stakeholder: string;
  value: string;
};

export type ProjectDetailEnglish = {
  categoryDetail: string;
  description: string;
  thesis: string;
  context: string;
  analysisConclusion: string;
  methods: string[];
  findings: string[];
  decisions: string[];
  alt: string;
  finalAlt: string;
  finalTitle: string;
  finalSummary: string;
  externalBusinessMeanings: string[];
  galleryCopy: Array<{
    id: string;
    alt: string;
    caption: string;
  }>;
};

export type Project = {
  id: string;
  index: string;
  slug: string;
  href: string;
  heroWord: string;
  heroTone: "wood" | "gray" | "mangosteen" | "sky" | "ink" | "gold";
  titleZh: string;
  titleEn: string;
  previewLabel: string;
  categoryZh: string;
  categoryEn: string;
  categoryDetail: string;
  year: string;
  role: string;
  detailEn: ProjectDetailEnglish;
  description: string;
  thesis: string;
  context: string;
  analysisConclusion: string;
  methods: string[];
  findings: string[];
  decisions: string[];
  deliverables: string[];
  coverImage: string;
  previewImage?: string;
  alt: string;
  finalImage: string;
  finalAlt: string;
  finalTitle: string;
  finalSummary: string;
  gallery: GalleryImage[];
  tags: string[];
  metrics: Metric[];
  externalMetrics: ExternalMetric[];
  stakeholderValues?: StakeholderValue[];
  outcomeMetrics?: Metric[];
  marqueeText: string;
  marqueeLabel: string;
};

export const navigation = [
  { label: "关于", href: "#about" },
  { label: "项目", href: "#work" },
  { label: "联系", href: "#contact" },
] as const;

const PROJECT_SOURCE = "Project research";

export const projects: Project[] = [
  {
    id: "01",
    index: "01",
    slug: "hotel-service-system",
    href: "/projects/hotel-service-system",
    heroWord: "HOTEL",
    heroTone: "wood",
    titleZh: "门把手与隐私交互系统",
    titleEn: "Hotel Access & Privacy Interaction System",
    previewLabel: "把手调研创新",
    categoryZh: "服务系统设计",
    categoryEn: "Service System Design",
    categoryDetail: "实体交互 × 房态沟通 × 服务响应",
    year: "PROJECT ARCHIVE",
    role: "User Research · Questionnaire Analysis · Service Blueprint · Information Synthesis",
    detailEn: {
      categoryDetail: "Physical Interaction × Room-Status Communication × Service Response",
      description: "This service-system concept reimagines the hotel doorway as more than an access point: it becomes a physical information interface connecting entry, privacy preferences, room status, and staff response.",
      thesis: "As hotel journeys become increasingly digital, the door handle remains a critical physical touchpoint encountered by both guests and operational teams every day.",
      context: "The research compared four sources of friction—hands-full access, do-not-disturb communication, room-status visibility, and service interruption—across the guest, front-desk, and housekeeping journey.",
      analysisConclusion: "The opportunity was not to add more controls, but to make access rights, privacy boundaries, and service status legible through one coherent physical interaction.",
      methods: ["Analysis of 30 questionnaire records", "Benchmarking across five competitive dimensions", "Interviews, contextual observation, and service-blueprint mapping"],
      findings: ["Guests need autonomous access and an explicit way to define their privacy boundaries.", "Housekeeping staff need to understand room status and service requests before approaching the door.", "Hotel operations need physical actions to become traceable service information."],
      decisions: ["An elbow-operable handle reduces entry friction when guests are carrying luggage or other items.", "An integrated room-status control turns privacy preferences into a clear, visible state.", "The handle and back-of-house response flow connect guests, front-desk staff, and housekeeping within one service system."],
      alt: "Concept rendering of a hotel door handle with card access and room-status controls",
      finalAlt: "System map connecting the door handle, room-status information, and hotel service response",
      finalTitle: "One doorway touchpoint integrating privacy, access, and service communication.",
      finalSummary: "The final system connects the guest's physical action at the door with room-status communication and hotel response, creating a service flow that is visible, understandable, and actionable for every stakeholder.",
      externalBusinessMeanings: ["Self-service and low-contact journeys have become meaningful drivers of hotel choice, so the doorway should reinforce guest autonomy rather than introduce new service friction.", "The scale of digital-key adoption shows that the physical doorway must continue the mobile access journey instead of becoming a disconnected information gap."],
      galleryCopy: [
        { id: "door-system-map", alt: "Hotel door-handle and service-system map", caption: "The complete relationship between the physical touchpoint, room-status information, and service response." },
        { id: "door-questionnaire", alt: "Questionnaire findings on hotel access and housekeeping interactions", caption: "Questionnaire findings organized around recurring friction in access, status visibility, and service communication." },
        { id: "door-persona", alt: "Guest persona carrying luggage at a hotel doorway", caption: "The persona links hands-full entry, time pressure, and the need for explicit privacy communication." },
        { id: "door-cleaning-blueprint", alt: "Hotel-room cleaning service blueprint", caption: "The end-to-end flow from a room-status setting at the door to back-of-house execution." },
        { id: "door-service-blueprint", alt: "Service blueprint connecting guests, front-desk staff, and housekeeping", caption: "How guest, front-desk, and housekeeping actions coordinate across the hotel service journey." },
        { id: "door-final-render", alt: "Final hotel door-handle and privacy-status concept", caption: "The handle, card-access area, and room-status communication are integrated into one physical interface." },
      ],
    },
    description: "把门口从单一通行部件，转化为连接访问、隐私状态与服务响应的实体信息触点。",
    thesis: "当酒店体验持续数字化，门把手仍是住客与运营流程每天都会经过的关键物理界面。",
    context: "调研聚焦双手占用、免打扰表达、房态识别和服务中断四类摩擦，并把住客、前台与保洁的需求放在同一条服务链路中比较。",
    analysisConclusion: "门口交互的核心不是增加按钮，而是让访问权限、隐私边界和服务状态在同一个动作中被准确看见。",
    methods: ["30 份问卷记录", "5 个竞品对标维度", "访谈、场景观察与服务蓝图"],
    findings: ["住客需要自主进入与明确的隐私边界。", "保洁需要在靠近房门前识别房态与服务请求。", "酒店运营需要把实体动作转化为可追踪的服务信息。"],
    decisions: ["肘部可操作把手降低双手占用时的进入负担。", "房态切换把隐私边界转化为清晰、可见的状态。", "门把手与后台响应链路共同连接住客、前台与保洁。"],
    deliverables: ["Questionnaire Analysis", "Guest Persona", "Service Blueprint", "Interaction System"],
    coverImage: "/media/hotel-hero.webp",
    alt: "门把手、房卡感应区与房门状态交互概念",
    finalImage: "/media/project-gallery/hotel/system-map.jpg",
    finalAlt: "门把手、房态信息与服务响应系统图",
    finalTitle: "一个门口触点，整合隐私、访问与服务沟通。",
    finalSummary: "最终系统把住客的实体动作、房态表达和酒店响应整合成一条可理解、可执行的服务链路。",
    gallery: [
      { id: "door-system-map", src: "/media/project-gallery/hotel/system-map.jpg", alt: "酒店门把手与服务系统关系图", caption: "实体触点、房态信息与服务响应的完整系统图。", type: "project-board", fit: "contain", aspectRatio: "16 / 9", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 1200, height: 675, sourceName: PROJECT_SOURCE },
      { id: "door-questionnaire", src: "/media/project-gallery/hotel/questionnaire.jpg", alt: "酒店门锁与客房清洁问卷信息图", caption: "问卷结果被整理为进入、状态与服务沟通的高频摩擦。", type: "chart", fit: "contain", aspectRatio: "16 / 9", background: "#EEE8DE", sizeX: 3, sizeY: 2, width: 1200, height: 675, sourceName: PROJECT_SOURCE },
      { id: "door-persona", src: "/media/project-gallery/hotel/guest-persona.jpg", alt: "携带行李的酒店住客用户画像", caption: "住客画像说明双手占用、快速进入和隐私表达之间的联系。", type: "project-board", fit: "contain", aspectRatio: "16 / 9", background: "#EEE8DE", sizeX: 3, sizeY: 2, width: 1200, height: 675, sourceName: PROJECT_SOURCE },
      { id: "door-cleaning-blueprint", src: "/media/project-gallery/hotel/cleaning-blueprint.jpg", alt: "客房清洁服务蓝图", caption: "清洁状态从房门设置到后台执行的完整链路。", type: "diagram", fit: "contain", aspectRatio: "16 / 9", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 1200, height: 675, sourceName: PROJECT_SOURCE },
      { id: "door-service-blueprint", src: "/media/project-gallery/hotel/service-blueprint.jpg", alt: "住客、前台与保洁服务蓝图", caption: "住客、前台与保洁在不同触点中的协同关系。", type: "diagram", fit: "contain", aspectRatio: "16 / 9", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 1200, height: 675, sourceName: PROJECT_SOURCE },
      { id: "door-final-render", src: "/media/hotel-hero.webp", alt: "酒店门把手与隐私状态最终概念", caption: "把手、房卡感应和房态表达被整合为统一物理界面。", type: "render", fit: "cover", aspectRatio: "1360 / 875", background: "#D9C9B7", sizeX: 3, sizeY: 2, width: 1360, height: 875, sourceName: "Project final rendering" },
    ],
    tags: ["User Research", "Privacy Interaction", "Service Blueprint"],
    metrics: [
      { value: "30", label: "Questionnaire responses" },
      { value: "4", label: "Interaction priorities" },
      { value: "5", label: "Benchmark dimensions" },
    ],
    externalMetrics: [
      { value: "73%", label: "Travelers more likely to stay at hotels offering self-service technology", year: "2022", sourceName: "Oracle Hospitality + Skift", sourceUrl: "https://www.oracle.com/news/announcement/oracle-hospitality-in-2025-consumer-research-study-2022-06-01/", businessMeaning: "自主、低接触的服务旅程已经成为住宿选择的重要条件。" },
      { value: "12.3M", label: "Hilton Digital Keys downloaded from January to August", year: "2023", sourceName: "Hilton 2024 Trends Report", sourceUrl: "https://stories.hilton.com/2024trends-connectivity-personalization", businessMeaning: "房门触点需要和移动端访问流程保持连续，而不是形成新的信息断点。" },
    ],
    stakeholderValues: [
      { stakeholder: "GUEST", value: "Privacy, autonomy and fewer unnecessary interruptions" },
      { stakeholder: "STAFF", value: "Clearer room status before service begins" },
      { stakeholder: "OPERATIONS", value: "A legible workflow connected to one physical touchpoint" },
    ],
    marqueeText: "DOOR HANDLE & PRIVACY INTERACTION",
    marqueeLabel: "VIEW PROJECT",
  },
  {
    id: "02",
    index: "02",
    slug: "manual-coffee-grinder",
    href: "/projects/manual-coffee-grinder",
    heroWord: "GRIND",
    heroTone: "gray",
    titleZh: "手摇咖啡磨豆机创新设计",
    titleEn: "Integrated Hand-Cranked Coffee Grinder",
    previewLabel: "咖啡机改良",
    categoryZh: "产品研究与定位",
    categoryEn: "Product Research",
    categoryDetail: "问卷分析 × 竞品对标 × 产品定位",
    year: "PROJECT ARCHIVE",
    role: "Questionnaire Analysis · Competitor Benchmarking · Insight Prioritization · Product Positioning",
    detailEn: {
      categoryDetail: "Questionnaire Analysis × Competitor Benchmarking × Product Positioning",
      description: "This project consolidates bean storage, hand grinding, and brewing into a lighter integrated product designed to shorten and simplify the portable coffee workflow.",
      thesis: "The main friction in portable coffee does not come from grinding alone; it accumulates across preparation, tool changes, packing, and cleaning when several separate products are involved.",
      context: "Fifty-seven questionnaire responses and hands-on observations were coded into a common framework, then compared with competitor structures to identify the needs that most strongly shape a portable experience.",
      analysisConclusion: "Portability, ease of cleaning, grind consistency, and operating efficiency jointly define the product position; structural integration has to improve all four rather than optimize one in isolation.",
      methods: ["Analysis of 57 questionnaire responses", "Observation of the preparation and operating sequence", "Benchmarking of competitor functions and mechanical structures"],
      findings: ["Portability, cleanability, consistency, and efficiency form the four core user needs.", "Switching among separate tools extends both preparation and packing time.", "Grind adjustment and component cleaning must remain clear and manageable in mobile settings."],
      decisions: ["Bean storage, grinding, and brewing are combined into one continuous workflow.", "A removable structure creates an explicit cleaning path and reduces the burden of reorganizing separate parts.", "The grind-adjustment and storage systems are positioned together to support both consistent results and portable use."],
      alt: "Black and white renderings of an integrated hand-cranked coffee grinder concept",
      finalAlt: "Final rendering of the integrated hand-cranked coffee grinder",
      finalTitle: "One product connecting bean storage, grinding, and brewing.",
      finalSummary: "The final concept reduces tool changes and overall carrying weight, turning outdoor coffee preparation from a fragmented setup into a continuous, legible sequence.",
      externalBusinessMeanings: ["Because coffee preparation is a high-frequency routine, small inefficiencies in setup and cleaning become recurring product-experience costs.", "As specialty coffee becomes an everyday habit, portable equipment must preserve both the ritual and the consistency users expect from careful brewing."],
      galleryCopy: [
        { id: "grinder-context", alt: "Integrated hand-cranked coffee grinder in a preparation setting", caption: "The product's scale and relationship to the preparation workflow in a tabletop context." },
        { id: "grinder-observation", alt: "Observation notes from using a hand-cranked coffee grinder", caption: "Observed issues in grip, assembly, component changes, and limited preparation space." },
        { id: "grinder-benchmark", alt: "Competitive benchmark for hand-cranked coffee grinders", caption: "Competitors compared across portability, cleaning, grind performance, and operating efficiency." },
        { id: "grinder-exploded", alt: "Exploded view of the complete coffee-grinder assembly", caption: "The full relationship among bean storage, grinding, brewing, and packing components." },
        { id: "grinder-sketch-open", alt: "Structural sketches for opening and cleaning the grinder", caption: "Exploration of opening, disassembly, cleaning, and component storage." },
        { id: "grinder-sketch-use", alt: "Ergonomic sketches of the grinder in use", caption: "Studies of grip, applied force, and the brewing workflow." },
        { id: "grinder-final", alt: "Final product rendering of the integrated grinder", caption: "The resolved integrated structure and overall product expression." },
        { id: "grinder-lineup", alt: "Black and white variants of the integrated grinder", caption: "The final color directions and their relationship as a product family." },
      ],
    },
    description: "把分散的储豆、研磨与冲煮工具，收敛为更轻、更快的一体式便携咖啡工作流。",
    thesis: "便携咖啡的主要摩擦不只来自研磨本身，而是多件设备在准备、切换和清洁中的累积成本。",
    context: "57 份问卷与操作观察被统一编码，并与竞品结构对标，用来识别决定便携体验的优先级。",
    analysisConclusion: "便携性、易清洁、研磨一致性与操作效率共同决定产品定位，结构整合必须同时服务这四项需求。",
    methods: ["57 份问卷分析", "操作路径观察", "竞品功能与结构对标"],
    findings: ["便携、清洁、一致性和效率构成四项核心需求。", "多件工具的切换拉长准备与收纳时间。", "研磨调节和组件拆洗需要在移动场景中保持清晰。"],
    decisions: ["储豆、研磨与冲煮合并为单一连续工作流。", "可拆结构对应明确清洁路径，降低整理负担。", "研磨调节与收纳结构并置，兼顾稳定出品和移动使用。"],
    deliverables: ["Questionnaire Analysis", "Competitor Benchmark", "Product Brief", "Technical Drawings", "Final Renderings"],
    coverImage: "/media/grinder-cover.webp",
    alt: "黑白两款一体式手摇咖啡磨豆机概念渲染",
    finalImage: "/media/project-gallery/grinder/final.webp",
    finalAlt: "一体式手摇咖啡磨豆机最终概念渲染",
    finalTitle: "一套产品，串联储豆、研磨与冲煮。",
    finalSummary: "最终方案减少工具切换与整机负担，让户外咖啡从分散准备变为连续操作。",
    gallery: [
      { id: "grinder-context", src: "/media/project-gallery/grinder/context-render.png", alt: "一体式手摇咖啡磨豆机使用情境", caption: "桌面准备场景中的产品比例与使用关系。", type: "render", fit: "cover", aspectRatio: "16 / 9", background: "#D7D3CE", sizeX: 4, sizeY: 2, width: 2560, height: 1440, sourceName: "Project rendering" },
      { id: "grinder-observation", src: "/media/project-gallery/grinder/observation.jpg", alt: "手摇咖啡磨豆机操作观察记录", caption: "握持、装配、零件切换与空间限制的观察记录。", type: "photo", fit: "cover", aspectRatio: "4 / 3", background: "#D9D5CE", sizeX: 2, sizeY: 2, width: 831, height: 623, sourceName: PROJECT_SOURCE },
      { id: "grinder-benchmark", src: "/media/project-gallery/grinder/benchmark.jpg", alt: "手摇咖啡磨豆机竞品分析表", caption: "竞品对标聚焦便携、清洁、研磨表现与操作效率。", type: "chart", fit: "contain", aspectRatio: "18 / 7", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 900, height: 350, sourceName: PROJECT_SOURCE },
      { id: "grinder-exploded", src: "/media/project-gallery/grinder/exploded.webp", alt: "手摇咖啡磨豆机完整爆炸结构图", caption: "储豆、研磨、冲煮与收纳组件的完整结构。", type: "technical-drawing", fit: "contain", aspectRatio: "788 / 1400", background: "#EEE8DE", sizeX: 2, sizeY: 3, width: 788, height: 1400, sourceName: PROJECT_SOURCE },
      { id: "grinder-sketch-open", src: "/media/project-gallery/grinder/sketch-open.png", alt: "磨豆机开合与拆洗结构草图", caption: "开合、拆洗和组件收纳的结构推演。", type: "technical-drawing", fit: "contain", aspectRatio: "1280 / 1565", background: "#EEE8DE", sizeX: 2, sizeY: 3, width: 1280, height: 1565, sourceName: PROJECT_SOURCE },
      { id: "grinder-sketch-use", src: "/media/project-gallery/grinder/sketch-use.png", alt: "磨豆机握持与操作草图", caption: "握持、施力和冲煮工作流的使用推演。", type: "technical-drawing", fit: "contain", aspectRatio: "1280 / 1898", background: "#EEE8DE", sizeX: 2, sizeY: 3, width: 1280, height: 1898, sourceName: PROJECT_SOURCE },
      { id: "grinder-final", src: "/media/project-gallery/grinder/final.webp", alt: "一体式磨豆机最终产品渲染", caption: "一体化结构的最终产品呈现。", type: "render", fit: "cover", aspectRatio: "16 / 9", background: "#D7D3CE", sizeX: 4, sizeY: 2, width: 1920, height: 1080, sourceName: "Project final rendering" },
      { id: "grinder-lineup", src: "/media/grinder-cover.webp", alt: "黑白两款一体式磨豆机方案", caption: "最终色彩与产品系列关系。", type: "render", fit: "cover", aspectRatio: "16 / 9", background: "#D7D3CE", sizeX: 3, sizeY: 2, width: 1920, height: 1080, sourceName: "Project final rendering" },
    ],
    tags: ["Questionnaire Analysis", "Competitor Benchmarking", "Product Positioning"],
    metrics: [
      { value: "57", label: "Questionnaire responses" },
      { value: "4", label: "Core user needs" },
      { value: "25%", label: "Operating time reduced" },
      { value: "30%", label: "Total weight reduced" },
    ],
    externalMetrics: [
      { value: "67%", label: "US adults who drank coffee in the past day", year: "2024", sourceName: "National Coffee Association", sourceUrl: "https://www.ncausa.org/Newsroom/Past-day-specialty-coffee-consumption-at-13-year-high", businessMeaning: "高频饮用让准备效率与清洁成本成为持续发生的产品体验问题。" },
      { value: "45%", label: "US adults who drank specialty coffee in the past day", year: "2024", sourceName: "National Coffee Association", sourceUrl: "https://www.ncausa.org/Newsroom/Past-day-specialty-coffee-consumption-at-13-year-high", businessMeaning: "精品咖啡进入日常消费后，便携器具仍需兼顾仪式感与稳定表现。" },
    ],
    outcomeMetrics: [
      { value: "25%", label: "Operating time reduced" },
      { value: "30%", label: "Total weight reduced" },
    ],
    marqueeText: "HAND-CRANKED COFFEE GRINDER",
    marqueeLabel: "VIEW PROJECT",
  },
  {
    id: "03",
    index: "03",
    slug: "biomaterial-experiment",
    href: "/projects/biomaterial-experiment",
    heroWord: "MATTER",
    heroTone: "mangosteen",
    titleZh: "山竹皮创新材料实验",
    titleEn: "Mangosteen-Peel Biomaterial Experiment",
    previewLabel: "山竹实验",
    categoryZh: "可持续材料探索",
    categoryEn: "Material Exploration",
    categoryDetail: "实验记录 × 材料比较 × 信息综合",
    year: "2025",
    role: "Experiment Logging · Material Comparison · Information Synthesis · Application Framing",
    detailEn: {
      categoryDetail: "Experiment Logging × Material Comparison × Information Synthesis",
      description: "This material exploration turns mangosteen-peel waste into a structured experimental sequence, making treatment methods, mixture ratios, sample conditions, and potential applications directly comparable.",
      thesis: "The value of a circular material comes not only from its feedstock, but also from how clearly its process, sample differences, failures, and application boundaries are documented.",
      context: "Using mangosteen peel as the primary input, the project records pretreatment, mixing, curing, drying, and surface conditions in sequence, then compares samples through a consistent set of attributes.",
      analysisConclusion: "Mixture ratios, drying conditions, and surface qualities must be evaluated within the same framework before a material experiment can support a repeatable design decision.",
      methods: ["More than ten mixture-ratio tests", "Continuous documentation of process steps and failed samples", "Comparison of surface, form, and processing conditions"],
      findings: ["The peel's texture and fibrous appearance make the material's biological origin legible.", "Failed samples show that treatment sequence and drying conditions matter as much as the mixture itself.", "A consistent property sheet makes differences among samples visible and comparable."],
      decisions: ["The mangosteen-peel texture is retained to strengthen material identity and the circular-material narrative.", "Successful and failed samples are documented within the same experimental system.", "The complete sample sequence is used to support the selection of a final application direction."],
      alt: "Natural surface and application form developed from mangosteen-peel material",
      finalAlt: "Final application exploration using the mangosteen-peel material",
      finalTitle: "Turning fruit-peel waste into a recognizable material language.",
      finalSummary: "The final outcome brings together a complete experiment log, comparative sample analysis, and an application study, establishing a documented foundation for further sustainable-material development.",
      externalBusinessMeanings: ["The scale of organic waste creates a clear circular-design opportunity for converting discarded biological matter into usable material inputs.", "Because household food waste is generated in dispersed, everyday settings, meaningful reuse depends on processing methods that are accessible, repeatable, and easy to document."],
      galleryCopy: [
        { id: "material-process", alt: "Complete mangosteen-peel material process", caption: "A continuous experiment record covering peel treatment, screening, mixing, and forming." },
        { id: "material-pretreatment", alt: "Mangosteen-peel pretreatment steps", caption: "The transformation from whole peel to a prepared powder input." },
        { id: "material-experiment", alt: "Comparison of mangosteen-peel material samples", caption: "Samples compared through thickness, edge quality, and surface condition." },
        { id: "material-failure", alt: "Review of failed mangosteen-peel material samples", caption: "Failed samples used to identify critical variables in treatment, curing, and drying." },
        { id: "material-result", alt: "Final mangosteen-peel material samples", caption: "The texture, color, and form of the resolved samples are documented in full." },
        { id: "material-properties", alt: "Property comparison sheet for mangosteen-peel samples", caption: "Sample conditions organized into a consistent property framework for direct comparison." },
        { id: "material-application", alt: "Final application exploration for the mangosteen-peel material", caption: "The selected direction for communicating the material's origin and application potential." },
      ],
    },
    description: "把山竹皮废弃物的处理、配比和样品状态整理成可比较的实验序列与应用方向。",
    thesis: "循环材料的价值不仅来自原料来源，也来自对过程、样品差异和应用边界的清晰记录。",
    context: "项目以山竹皮为主要原料，对预处理、混合、固化和表面状态进行连续记录，并用统一维度比较样品。",
    analysisConclusion: "配比、干燥和表面状态必须被放在同一比较框架内，才能把材料实验转化为可复用的设计判断。",
    methods: ["10+ 组配比测试", "连续过程与失败样品记录", "表面、形态与加工状态比较"],
    findings: ["果皮纹理和纤维感构成材料的来源识别。", "失败样品说明处理顺序与干燥条件同样重要。", "统一的属性表让样品差异可以被横向比较。"],
    decisions: ["保留山竹皮纹理，强化材料来源与循环叙事。", "把成功与失败样品放进同一实验记录体系。", "以完整样品序列支持最终应用方向选择。"],
    deliverables: ["Material Research Log", "Process Record", "Sample Comparison", "Property Sheet", "Application Exploration"],
    coverImage: "/media/biomaterials-application.webp",
    alt: "山竹皮创新材料的自然表面与应用形态",
    finalImage: "/media/biomaterials-application.webp",
    finalAlt: "山竹皮材料的最终应用探索",
    finalTitle: "把果皮废弃物转化为可识别的材料语言。",
    finalSummary: "完整实验记录、样品比较与应用探索共同构成可持续材料方向的最终成果。",
    gallery: [
      { id: "material-process", src: "/media/project-gallery/materials/process.jpg", alt: "山竹皮材料完整处理过程", caption: "果皮处理、筛分、混合与成型的连续实验记录。", type: "process", fit: "contain", aspectRatio: "16 / 9", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 1200, height: 675, sourceName: PROJECT_SOURCE },
      { id: "material-pretreatment", src: "/media/project-gallery/materials/pretreatment.jpg", alt: "山竹皮预处理步骤", caption: "从完整果皮到粉末原料的预处理步骤。", type: "process", fit: "contain", aspectRatio: "16 / 9", background: "#EEE8DE", sizeX: 3, sizeY: 2, width: 1200, height: 675, sourceName: PROJECT_SOURCE },
      { id: "material-experiment", src: "/media/project-gallery/materials/experiment-03.jpg", alt: "山竹皮实验样品比较", caption: "厚度、边缘和表面状态的样品比较。", type: "process", fit: "contain", aspectRatio: "1200 / 481", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 1200, height: 481, sourceName: PROJECT_SOURCE },
      { id: "material-failure", src: "/media/project-gallery/materials/failure-review.jpg", alt: "山竹皮材料失败样品复盘", caption: "失败样品用于识别处理、固化与干燥中的关键变量。", type: "project-board", fit: "contain", aspectRatio: "1200 / 481", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 1200, height: 481, sourceName: PROJECT_SOURCE },
      { id: "material-result", src: "/media/project-gallery/materials/result-review.jpg", alt: "山竹皮材料最终样品", caption: "最终样品的纹理、色彩与形态被完整保留。", type: "project-board", fit: "contain", aspectRatio: "1200 / 481", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 1200, height: 481, sourceName: PROJECT_SOURCE },
      { id: "material-properties", src: "/media/project-gallery/materials/property-sheet.jpg", alt: "山竹皮样品属性对比表", caption: "样品状态被统一整理为可横向比较的属性表。", type: "chart", fit: "contain", aspectRatio: "16 / 9", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 1200, height: 675, sourceName: PROJECT_SOURCE },
      { id: "material-application", src: "/media/biomaterials-application.webp", alt: "山竹皮材料最终应用探索", caption: "材料来源识别与应用表达的最终方向。", type: "render", fit: "cover", aspectRatio: "1488 / 600", background: "#CDB6B2", sizeX: 4, sizeY: 2, width: 1488, height: 600, sourceName: "Project final rendering" },
    ],
    tags: ["Circular Materials", "Experiment Logging", "Information Synthesis"],
    metrics: [
      { value: "10+", label: "Material ratios tested" },
      { value: "3", label: "Comparison lenses" },
      { value: "1", label: "Selected application direction" },
    ],
    externalMetrics: [
      { value: "1.05B t", label: "Food waste generated globally", year: "2022", sourceName: "UNEP Food Waste Index 2024", sourceUrl: "https://www.unep.org/news-and-stories/press-release/world-squanders-over-1-billion-meals-day-un-report", businessMeaning: "大规模有机废弃物流为废物再材料化提供了明确的循环设计场景。" },
      { value: "60%", label: "Share of global food waste generated by households", year: "2022", sourceName: "UNEP Food Waste Index 2024", sourceUrl: "https://wedocs.unep.org/bitstream/handle/20.500.11822/45275/Food-Waste-Index-2024-key-messages.pdf", businessMeaning: "分散产生的果皮废弃物需要低门槛、可复制的处理与转化路径。" },
    ],
    marqueeText: "MANGOSTEEN PEEL MATERIAL",
    marqueeLabel: "VIEW PROJECT",
  },
  {
    id: "04",
    index: "04",
    slug: "pure-voyage",
    href: "/projects/pure-voyage",
    heroWord: "VOYAGE",
    heroTone: "sky",
    titleZh: "PURE VOYAGE 车载吸尘器",
    titleEn: "PURE VOYAGE Portable In-Car Vacuum",
    previewLabel: "车载清洁新形态",
    categoryZh: "移动场景产品设计",
    categoryEn: "Product Design",
    categoryDetail: "场景研究 × 竞品分析 × 产品建模",
    year: "PROJECT ARCHIVE",
    role: "Scenario Research · Competitor Analysis · Product Modeling · Product Positioning",
    detailEn: {
      categoryDetail: "Scenario Research × Competitor Analysis × Product Modeling",
      description: "Designed around road trips, narrow interior gaps, and quick cleanups, PURE VOYAGE is a compact in-car cleaning system built for convenient storage and immediate use.",
      thesis: "Cleaning a vehicle is rarely one continuous household task; it is a series of frequent, fragmented moments involving crumbs, dust, upholstery, and hard-to-reach edges.",
      context: "The project separates interior crevices, seat surfaces, and outdoor use into three task groups, then compares product architectures, charging strategies, and storage methods against those scenarios.",
      analysisConclusion: "True portability depends on the coordination of in-car storage, quick recharging, and attachments that reach different surfaces—not simply on making the main body smaller.",
      methods: ["Mapping of three recurring cleaning tasks", "Comparison of two product-architecture directions", "Competitor analysis across function, storage, and power supply"],
      findings: ["Interior crevices, seat surfaces, and outdoor contexts require different forms of reach.", "Storage and charging determine whether the product is genuinely available for immediate use.", "Product identity, grip proportions, and the cleaning sequence need to operate as one system."],
      decisions: ["A magnetic battery supports quick removal, charging, and return to a defined storage position.", "A rotating crevice tool reaches seat gaps and narrow interior edges.", "Direct USB Type-C power connects charging across in-car and outdoor contexts."],
      alt: "Concept rendering of the PURE VOYAGE portable in-car vacuum",
      finalAlt: "Cutaway rendering showing the complete internal structure of the PURE VOYAGE vacuum",
      finalTitle: "Stored in the car, ready at hand, and adaptable across cleaning tasks.",
      finalSummary: "The final concept combines a compact body, task-specific reach, and a clear charging strategy to create a coherent mobile cleaning system rather than a standalone miniature appliance.",
      externalBusinessMeanings: ["China's large installed base of vehicles sustains a broad, recurring context for products that support compact storage and quick interior cleaning.", "The continuing addition of newly registered vehicles creates stable opportunities for portable accessories within everyday family mobility."],
      galleryCopy: [
        { id: "vacuum-hero-render", alt: "Front three-quarter rendering of the PURE VOYAGE in-car vacuum", caption: "The resolved dark-body concept establishes the product's compact proportions, grip, and front intake architecture." },
        { id: "vacuum-lineup", alt: "Form-exploration lineup for the in-car vacuum", caption: "Alternative forms developed around in-car storage and handheld operation." },
        { id: "vacuum-model", alt: "Complete product model of the portable in-car vacuum", caption: "The resolved model communicates portable proportions and the intended grip relationship." },
        { id: "vacuum-internal", alt: "Complete internal structure of the in-car vacuum", caption: "The internal layout connects the battery, dust collection, and maintenance logic." },
        { id: "vacuum-mechanism", alt: "Mechanical system of the portable in-car vacuum", caption: "The rotating attachment and modular structure support distinct cleaning tasks." },
        { id: "vacuum-cutaway", alt: "Complete cutaway rendering of the in-car vacuum", caption: "The final concept's proportions, structure, and internal components." },
        { id: "vacuum-final", alt: "Final rendering of the PURE VOYAGE in-car vacuum", caption: "The final expression of the compact body and mobile-cleaning scenario." },
      ],
    },
    description: "围绕自驾、车内缝隙和临时清洁任务，形成便携、易收纳的车载清洁产品系统。",
    thesis: "车内清洁不是一次完整家务，而是由碎屑、灰尘与狭窄边角构成的高频碎片化任务。",
    context: "项目把车内边角、座椅表面和户外使用拆分成三类任务，并比较产品路线、供电和收纳方式。",
    analysisConclusion: "真正的便携性来自随车收纳、快速补能和不同边角触达方式的协同，而不是单纯缩小机身。",
    methods: ["3 类高频清洁任务", "2 条产品路线比较", "竞品功能、收纳与供电分析"],
    findings: ["车内边角、座椅与户外场景需要不同触达方式。", "收纳与供电决定产品能否被随手取用。", "产品识别、握持比例和清洁路径需要统一。"],
    decisions: ["磁吸电池支持随取随用与收纳归位。", "旋转扁吸头覆盖座椅缝隙和狭窄边角。", "Type-C 直连供电连接车内与户外补能。"],
    deliverables: ["Scenario Map", "Competitor Review", "Route Study", "Product Modeling", "Final Renderings"],
    coverImage: "/media/vacuum-cover.webp",
    alt: "PURE VOYAGE 便携车载吸尘器概念渲染",
    finalImage: "/media/project-gallery/vacuum/cutaway.jpg",
    finalAlt: "PURE VOYAGE 车载吸尘器完整剖切结构渲染",
    finalTitle: "随车收纳、随手取用、覆盖多种清洁任务。",
    finalSummary: "最终产品以便携机身、可触达吸头和清晰补能方式构成完整移动清洁系统。",
    gallery: [
      { id: "vacuum-hero-render", src: "/media/project-gallery/vacuum/hero-render.jpg", alt: "PURE VOYAGE 车载吸尘器深色整机主视图", caption: "深色整机方案展示紧凑比例、握持关系与前端进气结构。", type: "render", fit: "contain", aspectRatio: "3 / 4", background: "#EEE8DE", sizeX: 3, sizeY: 3, width: 675, height: 900, sourceName: PROJECT_SOURCE },
      { id: "vacuum-lineup", src: "/media/project-gallery/vacuum/lineup.jpg", alt: "车载吸尘器形态探索阵列", caption: "不同形态围绕车内收纳与手持操作展开。", type: "render", fit: "contain", aspectRatio: "5 / 4", background: "#EEE8DE", sizeX: 3, sizeY: 2, width: 700, height: 560, sourceName: PROJECT_SOURCE },
      { id: "vacuum-model", src: "/media/project-gallery/vacuum/product-model.webp", alt: "车载吸尘器完整产品模型", caption: "完整产品模型表达便携比例与握持关系。", type: "render", fit: "contain", aspectRatio: "1290 / 1184", background: "#EEE8DE", sizeX: 3, sizeY: 3, width: 1290, height: 1184, sourceName: PROJECT_SOURCE },
      { id: "vacuum-internal", src: "/media/project-gallery/vacuum/internal-structure.jpg", alt: "车载吸尘器完整内部结构", caption: "内部布局对应电池、集尘与维护逻辑。", type: "technical-drawing", fit: "contain", aspectRatio: "16 / 9", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 859, height: 483, sourceName: PROJECT_SOURCE },
      { id: "vacuum-mechanism", src: "/media/project-gallery/vacuum/mechanism.webp", alt: "车载吸尘器完整结构机制", caption: "旋转吸头与模块关系支撑不同清洁任务。", type: "technical-drawing", fit: "contain", aspectRatio: "16 / 9", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 859, height: 483, sourceName: PROJECT_SOURCE },
      { id: "vacuum-cutaway", src: "/media/project-gallery/vacuum/cutaway.jpg", alt: "车载吸尘器完整剖切渲染", caption: "最终方案的产品比例、结构与内部组件。", type: "render", fit: "contain", aspectRatio: "874 / 900", background: "#EEE8DE", sizeX: 3, sizeY: 3, width: 874, height: 900, sourceName: "Project final rendering" },
      { id: "vacuum-final", src: "/media/vacuum-cover.webp", alt: "PURE VOYAGE 车载吸尘器最终渲染", caption: "便携机身与移动清洁场景的最终表达。", type: "render", fit: "contain", aspectRatio: "1360 / 1400", background: "#D3DEE4", sizeX: 3, sizeY: 3, width: 1360, height: 1400, sourceName: "Project final rendering" },
    ],
    tags: ["Scenario Research", "Competitor Analysis", "Product Modeling"],
    metrics: [
      { value: "3", label: "Cleaning tasks" },
      { value: "2", label: "Product routes" },
      { value: "4", label: "Core functions" },
    ],
    externalMetrics: [
      { value: "353M", label: "Automobiles registered in China", year: "2024", sourceName: "Ministry of Public Security", sourceUrl: "https://big5.www.gov.cn/gate/big5/www.gov.cn/lianbo/bumen/202501/content_6999762.htm", businessMeaning: "庞大的在用车辆基数持续扩大车内收纳与便携清洁的使用场景。" },
      { value: "26.9M", label: "Newly registered automobiles in China", year: "2024", sourceName: "Ministry of Public Security", sourceUrl: "https://big5.www.gov.cn/gate/big5/www.gov.cn/lianbo/bumen/202501/content_6999762.htm", businessMeaning: "新增车辆持续进入家庭出行体系，便携车载用品具有稳定的增量触点。" },
    ],
    marqueeText: "PURE VOYAGE IN-CAR VACUUM",
    marqueeLabel: "VIEW PROJECT",
  },
  {
    id: "05",
    index: "05",
    slug: "auri-hand",
    href: "/projects/auri-hand",
    heroWord: "AURI",
    heroTone: "gold",
    titleZh: "AuriHand 老年疗愈手套",
    titleEn: "AuriHand Assistive & Therapeutic Glove",
    previewLabel: "疗愈手套共创",
    categoryZh: "辅助产品与关怀体验",
    categoryEn: "Assistive Product Design",
    categoryDetail: "市场研究 × 需求分析 × 决策支持",
    year: "PROJECT ARCHIVE",
    role: "Market Research · User Interviews · Needs Analysis · Product Strategy · Presentation Integration",
    detailEn: {
      categoryDetail: "Market Research × Needs Analysis × Product Strategy",
      description: "AuriHand integrates grip assistance, everyday rehabilitation, health feedback, and emotional support into an assistive system designed to remain understandable and approachable for older adults.",
      thesis: "An assistive product for older adults must address physical capability, interaction effort, and emotional connection together rather than isolating each function in a separate device.",
      context: "Public market information and interviews with three users were synthesized into four need categories: grip support, health monitoring, emotional companionship, and low-effort operation.",
      analysisConclusion: "Hand-movement support, wrist-based information, and companion interactions need to form one continuous experience before the product can fit naturally into everyday routines.",
      methods: ["Synthesis of publicly available market information", "Three user interviews and journey mapping", "Gap analysis and prioritization of product functions"],
      findings: ["Grip difficulty affects medication routines, household tasks, and personal activities throughout the day.", "Complex interaction can cancel out the practical value of an assistive function.", "Physical support and emotional companionship need to work together through the same everyday touchpoint."],
      decisions: ["A flexible glove and drive structure support gripping and guided hand movement.", "A wrist interface consolidates device status, rehabilitation guidance, and health information.", "Voice and companion functions extend physical assistance into everyday interaction."],
      alt: "Structural concept sketch of the AuriHand assistive-grip glove",
      finalAlt: "AuriHand concept board showing the hand structure, wrist interface, and product functions",
      finalTitle: "Bringing movement support, status feedback, and companionship into one system.",
      finalSummary: "The final concept connects hand-movement assistance, wrist-based information, rehabilitation use, and emotional interaction into a coherent system for everyday ageing support.",
      externalBusinessMeanings: ["The scale of China's older population makes approachable, everyday assistive products a long-term service and design priority.", "Assistive products must begin with real functional difficulty while preserving dignity, independence, and the possibility of sustained daily use."],
      galleryCopy: [
        { id: "auri-complete-poster", alt: "Complete high-resolution AuriHand project poster", caption: "The full original project poster covering market context, user research, system functions, and the final concept." },
        { id: "auri-research-board", alt: "Complete AuriHand research and concept board", caption: "Market information, concept sketches, user personas, and the product brief in one project board." },
        { id: "auri-persona-zhang", alt: "AuriHand user persona for Zhang Hua", caption: "A persona focused on mild joint difficulty, independent living, and the need for low-effort devices." },
        { id: "auri-persona-liu", alt: "AuriHand user persona for Liu Fangfang", caption: "The relationship among hand strength, health monitoring, and everyday activity." },
        { id: "auri-journey", alt: "Complete daily journey map for the AuriHand persona", caption: "Grip, medication, household tasks, and companionship needs mapped across one day." },
        { id: "auri-persona-summary", alt: "Comparison of three older-adult personas for AuriHand", caption: "A comparison of physical capabilities, emotional needs, and health concerns across three users." },
        { id: "auri-sketches", alt: "Structural and drive-system sketches for the AuriHand glove", caption: "A complete exploration of the relationships among glove, drive mechanism, and wrist module." },
        { id: "auri-concept", alt: "AuriHand product-function detail board", caption: "The complete system relationship among hand structure, wrist interface, and companion functions." },
        { id: "auri-final", alt: "Final concept of the AuriHand assistive-grip glove", caption: "The resolved system combining a flexible glove, drive module, and wrist interaction." },
      ],
    },
    description: "把抓握辅助、日常康复、健康反馈与情感陪伴整合为老年人可理解的辅助产品系统。",
    thesis: "老年辅助产品需要同时回应身体能力、操作门槛和情感联结，而不是把功能孤立成单一设备。",
    context: "市场信息与 3 位用户访谈被整合为抓握、健康监测、情感陪伴和低门槛操作四类核心需求。",
    analysisConclusion: "手部动作支持、腕部信息和陪伴交互必须形成连续体验，才能进入老年人的日常生活。",
    methods: ["公开市场资料整理", "3 位用户访谈与旅程梳理", "竞品差距与功能优先级分析"],
    findings: ["抓握困难贯穿用药、家务和个人活动。", "复杂操作会抵消辅助功能本身的价值。", "身体支持与情感陪伴需要在同一日常触点中协同。"],
    decisions: ["柔性手套与驱动结构支持抓握和手部活动。", "腕部界面集中呈现状态、康复与健康信息。", "语音与陪伴功能把物理辅助延展到日常互动。"],
    deliverables: ["Market Research", "User Interviews", "Persona & Journey", "Product System", "Complete Poster"],
    coverImage: "/media/glove-final.webp",
    alt: "AuriHand 辅助抓握手套结构草图",
    finalImage: "/media/project-gallery/glove/concept-detail.jpg",
    finalAlt: "AuriHand 手部结构、腕部界面与功能细节展示",
    finalTitle: "让动作支持、状态反馈与陪伴进入同一系统。",
    finalSummary: "最终概念将手部动作支持、腕部信息、康复使用与情感互动串联为完整的老年日常辅助体验。",
    gallery: [
      { id: "auri-complete-poster", src: "/media/project-gallery/glove/auri-poster.jpg", thumbnailSrc: "/media/project-gallery/glove/auri-poster-thumb.jpg", alt: "AuriHand 完整原始高分辨率项目海报", caption: "完整原始海报：市场背景、用户研究、系统功能与最终概念。", type: "poster", fit: "contain", aspectRatio: "2480 / 3508", background: "#EEECE7", sizeX: 2, sizeY: 3, width: 2480, height: 3508, sourceName: "Original project poster" },
      { id: "auri-research-board", src: "/media/project-gallery/glove/research-board.jpg", alt: "AuriHand 完整研究与概念板", caption: "市场信息、草图、用户画像与产品简报的完整项目板。", type: "project-board", fit: "contain", aspectRatio: "1258 / 900", background: "#EEE8DE", sizeX: 3, sizeY: 2, width: 1258, height: 900, sourceName: PROJECT_SOURCE },
      { id: "auri-persona-zhang", src: "/media/project-gallery/glove/persona-journey-1.jpg", alt: "AuriHand 张华用户画像", caption: "画像聚焦轻度关节问题、独立生活与低门槛设备需求。", type: "project-board", fit: "contain", aspectRatio: "16 / 9", background: "#EEF2F3", sizeX: 3, sizeY: 2, width: 2025, height: 1139, sourceName: PROJECT_SOURCE },
      { id: "auri-persona-liu", src: "/media/project-gallery/glove/persona-journey-3.jpg", alt: "AuriHand 刘芳芳用户画像", caption: "画像呈现手部力量、健康监测和日常活动之间的需求关系。", type: "project-board", fit: "contain", aspectRatio: "16 / 9", background: "#EEF2F3", sizeX: 3, sizeY: 2, width: 2025, height: 1139, sourceName: PROJECT_SOURCE },
      { id: "auri-journey", src: "/media/project-gallery/glove/persona-journey-4.jpg", alt: "AuriHand 张华完整日常旅程图", caption: "一天中的抓握、用药、家务与陪伴需求被放入同一旅程。", type: "diagram", fit: "contain", aspectRatio: "16 / 9", background: "#EEF2F3", sizeX: 4, sizeY: 2, width: 2025, height: 1139, sourceName: PROJECT_SOURCE },
      { id: "auri-persona-summary", src: "/media/project-gallery/glove/personas.jpg", alt: "AuriHand 三位老年用户画像总结", caption: "三位用户的身体能力、情感需求与健康关注点比较。", type: "project-board", fit: "contain", aspectRatio: "1600 / 468", background: "#EEE8DE", sizeX: 4, sizeY: 2, width: 1600, height: 468, sourceName: PROJECT_SOURCE },
      { id: "auri-sketches", src: "/media/project-gallery/glove/sketches.jpg", alt: "AuriHand 手套结构与驱动草图", caption: "手套、驱动与腕部模块关系的完整草图推演。", type: "technical-drawing", fit: "contain", aspectRatio: "1368 / 900", background: "#EEE8DE", sizeX: 3, sizeY: 2, width: 1368, height: 900, sourceName: PROJECT_SOURCE },
      { id: "auri-concept", src: "/media/project-gallery/glove/concept-detail.jpg", alt: "AuriHand 产品功能细节板", caption: "手部结构、腕部界面和陪伴功能的完整系统关系。", type: "project-board", fit: "contain", aspectRatio: "1154 / 900", background: "#EEE8DE", sizeX: 3, sizeY: 2, width: 1154, height: 900, sourceName: PROJECT_SOURCE },
      { id: "auri-final", src: "/media/glove-final.webp", alt: "AuriHand 辅助抓握手套最终概念", caption: "柔性手套、驱动模块与腕部交互的最终系统。", type: "render", fit: "contain", aspectRatio: "7 / 5", background: "#DCE4E7", sizeX: 3, sizeY: 2, width: 1400, height: 1000, sourceName: "Project final rendering" },
    ],
    tags: ["Market Research", "Needs Analysis", "Assistive Product Strategy"],
    metrics: [
      { value: "3", label: "User interviews" },
      { value: "4", label: "Need categories" },
      { value: "3", label: "Integrated system functions" },
    ],
    externalMetrics: [
      { value: "310.31M", label: "People aged 60 and above in China", year: "2024", sourceName: "National Bureau of Statistics", sourceUrl: "https://www.stats.gov.cn/sj/zxfb/202502/t20250228_1958817.html", businessMeaning: "老龄人口规模使低门槛、日常化的辅助产品成为长期服务议题。" },
      { value: "34%", label: "People aged 60+ experiencing significant functional difficulties", year: "2023", sourceName: "World Health Organization", sourceUrl: "https://cdn.who.int/media/docs/default-source/universal-health-coverage/who-uhl-technical-brief-healthyageing.pdf", businessMeaning: "辅助产品必须从真实功能困难出发，同时保持尊严、独立和可持续使用。" },
    ],
    marqueeText: "AURIHAND THERAPEUTIC GLOVE",
    marqueeLabel: "VIEW PROJECT",
  },
  {
    id: "06",
    index: "06",
    slug: "sonovision",
    href: "/projects/sonovision",
    heroWord: "SONO",
    heroTone: "gray",
    titleZh: "SonoVision 无视觉记忆捕捉器",
    titleEn: "SonoVision Non-Visual Memory Capture Device",
    previewLabel: "空间声音记忆",
    categoryZh: "无障碍产品与交互",
    categoryEn: "Accessible Product Design",
    categoryDetail: "无障碍研究 × 触觉交互 × 空间音频概念",
    year: "2026",
    role: "Team Project · Accessibility Research · Interaction System · Product Concept",
    detailEn: {
      categoryDetail: "Accessibility Research × Tactile Interaction × Spatial-Audio Concept",
      description: "SonoVision is a portable non-visual memory-capture concept that uses spatial sound, tactile control, and haptic confirmation to help people with visual impairment record and revisit meaningful moments without framing a camera.",
      thesis: "When a photograph is not a reliable memory entry point, the direction, distance, and environmental layers of sound can preserve cues about place and time.",
      context: "The World Health Organization estimates that at least 2.2 billion people live with near or distance vision impairment. The project translates that broad accessibility context into one specific design question: how can a memory-capture flow remain understandable without visual aiming or screen confirmation?",
      analysisConclusion: "The opportunity was not to add more recording features, but to compress carrying, opening, calibrating, recording, confirming, and replaying into one continuous non-visual flow.",
      methods: ["Accessibility problem framing from the project material and public guidance", "Task-flow mapping across carry, open, record, and revisit", "Benchmarking of tactile controls and portable 360-degree audio capture", "Planned usability evaluation for reach, posture, feedback, and clarity"],
      findings: ["Camera-based memory capture depends on framing and visual confirmation that cannot be assumed in this use case.", "A discernible physical control with haptic and audio status can reduce reliance on a screen.", "Spatial replay only becomes meaningful when capture orientation, stability, and confirmation are clear to the user."],
      decisions: ["A folding dual-tube body and integrated hook support everyday carrying and one-step opening.", "One Braille-marked main control and six mapped haptic states make operation and status physically distinguishable.", "A 360-degree capture concept and Bluetooth playback connect the handheld device to head-tracked spatial-audio listening."],
      alt: "SonoVision folded and unfolded spatial-audio memory device concept",
      finalAlt: "Four-step SonoVision scenario from carrying and opening to recording and revisiting",
      finalTitle: "Turning sound into a tactile, replayable memory path.",
      finalSummary: "The concept connects a portable folding form, one-touch tactile interaction, capture confirmation, and immersive replay into a single non-visual memory journey. The evaluation shown in the source material is a proposed plan, not a reported user-test result.",
      externalBusinessMeanings: ["The scale of global vision impairment makes non-visual access a mainstream product-design consideration rather than a niche exception.", "A current four-capsule Ambisonic recorder demonstrates that portable 360-degree sound capture is technically feasible, while SonoVision explores how that capability could become accessible in everyday use."],
      galleryCopy: [
        { id: "sonovision-full-poster", alt: "Complete SonoVision project poster with research, interaction strategy, technology stack, and evaluation plan", caption: "The complete A1 poster preserves the original project narrative from problem definition and product architecture to technical feasibility and the proposed usability-evaluation plan." },
        { id: "sonovision-product", alt: "SonoVision folded and unfolded spatial-audio memory device concept", caption: "The compact product form combines a folding body, integrated hook, tactile control, and a microphone enclosure." },
        { id: "sonovision-scenario", alt: "Four-step SonoVision scenario from carrying and opening to recording and revisiting", caption: "Carry, open, record, and revisit form one continuous non-visual interaction sequence." },
      ],
    },
    description: "以空间声音替代视觉照片，为视障用户构建可携带、可触知、可回放的记忆捕捉概念。",
    thesis: "当照片无法成为可靠的记忆入口时，声音的方向、距离与环境层次可以承担地点和时刻的线索。",
    context: "世界卫生组织估计，全球至少有 22 亿人存在近视力或远视力损伤。项目把这一广泛的无障碍背景收束为一个具体问题：不依赖视觉取景和屏幕确认，记忆捕捉流程如何仍然清晰可理解？",
    analysisConclusion: "关键不是增加更多录音功能，而是把携带、展开、校准、录制、确认与回放压缩为无需视觉定位的连续流程。",
    methods: ["结合项目材料与公开指南进行无障碍问题定义", "梳理携带、展开、录制与重温的任务流程", "对照触觉控制与便携式 360° 录音技术", "规划触达、姿态、反馈与理解度的可用性评估"],
    findings: ["相机式记忆捕捉依赖取景和视觉确认，不能直接套用于这一场景。", "可辨识的实体控制配合触觉与声音状态，可以降低对屏幕的依赖。", "空间回放只有在捕捉方向、稳定性与确认反馈足够清晰时才有意义。"],
    decisions: ["双管折叠机身与一体式挂钩支持日常携带和一步展开。", "一枚带盲文标识的主按键与 6 种触觉状态，让操作和反馈可被身体区分。", "360° 捕捉概念与蓝牙回放，把手持设备连接到头部追踪的空间音频体验。"],
    deliverables: ["Accessibility Research", "Interaction Architecture", "Product Concept", "Usability Evaluation Plan", "Project Poster"],
    coverImage: "/media/project-gallery/sonovision/product.jpg",
    previewImage: "/media/project-gallery/sonovision/home-cover-v2.png",
    alt: "SonoVision 折叠与展开状态的空间音频记忆设备概念",
    finalImage: "/media/project-gallery/sonovision/scenario.jpg",
    finalAlt: "SonoVision 从携带、展开、录制到重温的四步场景",
    finalTitle: "让声音成为可触知、可回放的记忆路径。",
    finalSummary: "概念把便携折叠形态、单键触觉交互、捕捉确认与沉浸式回放连接为完整的非视觉记忆旅程。原始材料中的可用性评估属于后续计划，不作为已完成的用户测试结果。",
    gallery: [
      { id: "sonovision-full-poster", src: "/media/project-gallery/sonovision/full-poster-cropped.png", alt: "SonoVision 完整项目海报，包含问题定义、交互策略、技术架构与评估计划", caption: "完整 A1 海报保留从问题定义、产品交互架构到技术可行性与后续可用性评估计划的原始项目叙事。", type: "poster", fit: "contain", aspectRatio: "1684 / 2207", background: "#F4F2EE", sizeX: 4, sizeY: 4, width: 1684, height: 2207, sourceName: "SonoVision complete A1 project poster" },
      { id: "sonovision-product", src: "/media/project-gallery/sonovision/product.jpg", alt: "SonoVision 折叠与展开状态的空间音频记忆设备概念", caption: "紧凑产品形态整合折叠机身、挂钩、触觉控制与麦克风区域。", type: "render", fit: "contain", aspectRatio: "842 / 1190", background: "#F4F2EE", sizeX: 3, sizeY: 3, width: 842, height: 1190, sourceName: "SonoVision project rendering" },
      { id: "sonovision-scenario", src: "/media/project-gallery/sonovision/scenario.jpg", alt: "SonoVision 从携带、展开、录制到重温的四步场景", caption: "携带、展开、录制和重温构成连续的非视觉交互流程。", type: "project-board", fit: "contain", aspectRatio: "842 / 1190", background: "#F4F2EE", sizeX: 3, sizeY: 3, width: 842, height: 1190, sourceName: "SonoVision project board" },
    ],
    tags: ["Accessibility Research", "Tactile Interaction", "Spatial Audio"],
    metrics: [
      { value: "220 mm", label: "Concept folded height" },
      { value: "6", label: "Haptic feedback states mapped" },
      { value: "360°", label: "Spatial-audio capture target" },
    ],
    externalMetrics: [
      { value: "2.2B", label: "People with near or distance vision impairment", year: "2026", sourceName: "World Health Organization", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment", businessMeaning: "全球视力损伤规模说明，非视觉访问不是边缘例外，而是产品设计必须面对的普遍议题。" },
      { value: "4", label: "Capsules in a current portable Ambisonic recorder", year: "CURRENT", sourceName: "ZOOM", sourceUrl: "https://zoomcorp.com/en/us/handheld-recorders/handheld-recorders/h3-vr-360-audio-recorder/", businessMeaning: "现有四单元 Ambisonic 录音设备证明便携式 360° 声音捕捉具备技术可行性，SonoVision 进一步探索其日常无障碍使用方式。" },
    ],
    marqueeText: "SONOVISION SPATIAL MEMORY",
    marqueeLabel: "VIEW PROJECT",
  },
  {
    id: "07",
    index: "07",
    slug: "spark-smart-amp",
    href: "/projects/spark-smart-amp",
    heroWord: "SPARK",
    heroTone: "gold",
    titleZh: "Spark Smart Amp 智能音箱系统",
    titleEn: "Spark Smart Amp Connected Guitar System",
    previewLabel: "智能音色生态",
    categoryZh: "物联网与界面原型",
    categoryEn: "Connected Product Prototype",
    categoryDetail: "界面架构 × 物联网原型 × 社区工作流",
    year: "2026",
    role: "Team Project · Product Ecosystem Audit · Interface Architecture · Technical Demonstration",
    detailEn: {
      categoryDetail: "Interface Architecture × IoT Prototype × Community Workflow",
      description: "An academic connected-product prototype built around the public Spark GO ecosystem, reorganizing tone selection, hardware presets, cloud management, backing tracks, and community sharing into a clearer cross-device flow. It is not an official Positive Grid project.",
      thesis: "When a portable amplifier connects to more than 100,000 community tones, the central design challenge shifts from feature volume to maintaining clear relationships among the phone, cloud library, and four hardware presets.",
      context: "Positive Grid currently presents Spark GO with more than 100,000 downloadable ToneCloud presets and four customizable presets available directly on the device. This project did not invent those ecosystem features; it used them as the factual product baseline for an academic interface and IoT prototype focused on selection, synchronization, and continuity.",
      analysisConclusion: "Frequent performance actions should remain on the hardware, while search, classification, backup, and community activity belong in the app. Explicit loading, upload, and channel states connect the two surfaces.",
      methods: ["Audit of the public Spark GO and Spark App ecosystem", "Decomposition of tone, preset, cloud, backing-track, and community tasks", "Mobile-interface flow and visual-system prototyping", "Reference IoT architecture using React Native, Node-RED, JSON, MQTT, and Arduino"],
      findings: ["A large tone library increases choice while making retrieval and selection harder.", "Four physical presets need an obvious mapping to the active mobile selection and upload state.", "Cloud and community actions require explicit ownership, progress, and synchronization feedback."],
      decisions: ["Four channel controls mirror the amplifier's quick-preset model inside the mobile flow.", "A simplified tone engine reduces high-frequency adjustment to a small set of legible controls.", "Cloud access, backup, community discovery, and backing tracks are grouped as distinct but connected tasks."],
      alt: "Spark Smart Amp concept with Spark GO amplifier and three mobile interface screens",
      finalAlt: "Spark Smart Amp prototype architecture and cloud, tone, and four-channel preset demonstrations",
      finalTitle: "Keeping tone discovery, cloud state, and hardware presets in one connected system.",
      finalSummary: "The poster documents a course prototype spanning mobile interface, reference IoT architecture, and a hardware demonstration. It should be read as an academic system proposal based on the existing Spark ecosystem, not as a production deployment or official Positive Grid work.",
      externalBusinessMeanings: ["A catalog of more than 100,000 community tones creates value through variety but also raises the cost of search, organization, and recall.", "Four customizable on-device presets make cross-device mapping and synchronization a concrete interaction constraint rather than a purely visual interface choice."],
      galleryCopy: [
        { id: "spark-full-poster", alt: "Complete Spark Smart Amp project poster with interface concept, IoT architecture, prototype demonstration, and community workflow", caption: "The complete long-form poster preserves the original course-project system story, from pain points and concept architecture to the mobile interface and connected-hardware demonstration." },
        { id: "spark-overview", alt: "Spark Smart Amp concept with Spark GO amplifier and three mobile interface screens", caption: "The project overview connects a compact amplifier, tone library, home hub, and four-channel remote control." },
        { id: "spark-preset-community", alt: "Spark Smart Amp prototype architecture and cloud, tone, and four-channel preset demonstrations", caption: "The documented prototype links app, cloud, tone engine, community functions, and hardware preset control." },
      ],
    },
    description: "基于公开 Spark GO 生态的课程型连接产品原型，把音色调整、硬件预设、云端管理、伴奏和社区分享整理为更清晰的跨设备流程；非 Positive Grid 官方项目。",
    thesis: "当一个便携音箱连接超过 10 万种社区音色时，真正的难点不再是功能数量，而是如何在手机、云端音色库与四个硬件预设之间保持清晰。",
    context: "Positive Grid 当前公开信息显示，Spark GO 可连接超过 10 万种 ToneCloud 音色，并可在设备上直接调用 4 个自定义预设。本项目没有把这些既有生态功能包装为原创，而是把它们作为课程型界面与物联网原型的事实基线，聚焦选择、同步与使用连续性。",
    analysisConclusion: "高频演奏动作应留在硬件，搜索、分类、备份与社区操作应留在 App，并用明确的加载、上传与通道状态连接两端。",
    methods: ["梳理公开的 Spark GO 与 Spark App 产品生态", "拆解音色、预设、云端、伴奏与社区任务", "设计移动界面流程与视觉系统", "以 React Native、Node-RED、JSON、MQTT 与 Arduino 构建参考物联网架构"],
    findings: ["大型音色库带来丰富选择，也增加检索、组织与再次找到音色的成本。", "四个实体预设需要与手机端当前选择和上传状态形成直观映射。", "云端与社区操作必须明确呈现归属、进度和同步结果。"],
    decisions: ["四通道控制在手机流程中对应音箱的快速预设模型。", "简化音色引擎把高频调节收束为少量可读控制。", "云端访问、备份、社区发现与伴奏被拆成清晰但相互连接的任务。"],
    deliverables: ["Product Ecosystem Audit", "Mobile UI Prototype", "IoT Architecture", "Hardware Demonstration", "Project Poster"],
    coverImage: "/media/project-gallery/spark-smart-amp/overview.jpg",
    previewImage: "/media/project-gallery/spark-smart-amp/home-cover-v2.png",
    alt: "Spark Smart Amp、Spark GO 音箱与三组移动界面概念",
    finalImage: "/media/project-gallery/spark-smart-amp/preset-community.jpg",
    finalAlt: "Spark Smart Amp 原型架构与云端、音色、四通道预设演示",
    finalTitle: "把音色发现、云端状态与硬件预设保持在同一连接系统中。",
    finalSummary: "海报记录了由移动界面、参考物联网架构和硬件演示组成的课程原型。它是基于既有 Spark 生态的学术系统提案，不是已上线产品，也不是 Positive Grid 官方项目。",
    gallery: [
      { id: "spark-full-poster", src: "/media/project-gallery/spark-smart-amp/full-poster-cropped.png", alt: "Spark Smart Amp 完整项目海报，包含界面概念、物联网架构、原型演示与社区流程", caption: "完整长海报保留从痛点、系统概念与技术架构到移动界面和连接硬件演示的原始课程项目叙事。", type: "poster", fit: "contain", aspectRatio: "1985 / 3975", background: "#090909", sizeX: 4, sizeY: 4, width: 1985, height: 3975, sourceName: "Spark Smart Amp complete course project poster" },
      { id: "spark-overview", src: "/media/project-gallery/spark-smart-amp/overview.jpg", alt: "Spark Smart Amp、Spark GO 音箱与三组移动界面概念", caption: "项目总览连接便携音箱、音色库、功能入口与四通道远程控制。", type: "project-board", fit: "contain", aspectRatio: "3032 / 2084", background: "#090909", sizeX: 4, sizeY: 3, width: 3032, height: 2084, sourceName: "Spark Smart Amp course project poster" },
      { id: "spark-preset-community", src: "/media/project-gallery/spark-smart-amp/preset-community.jpg", alt: "Spark Smart Amp 原型架构与云端、音色、四通道预设演示", caption: "已记录的原型把 App、云端、音色引擎、社区功能和硬件预设控制连接起来。", type: "project-board", fit: "contain", aspectRatio: "3032 / 2084", background: "#090909", sizeX: 4, sizeY: 3, width: 3032, height: 2084, sourceName: "Spark Smart Amp course project poster" },
    ],
    tags: ["Product Ecosystem", "Mobile UI", "IoT Prototype"],
    metrics: [
      { value: "4", label: "Core interface pillars" },
      { value: "4", label: "Quick preset channels prototyped" },
      { value: "5", label: "Connected system nodes mapped" },
    ],
    externalMetrics: [
      { value: "100K+", label: "Downloadable tones in ToneCloud", year: "CURRENT", sourceName: "Positive Grid", sourceUrl: "https://www.positivegrid.com/products/spark-go", businessMeaning: "超过十万种社区音色带来选择价值，也显著提高搜索、组织和再次找到音色的成本。" },
      { value: "4", label: "Customizable presets available on the device", year: "CURRENT", sourceName: "Positive Grid", sourceUrl: "https://www.positivegrid.com/products/spark-go", businessMeaning: "四个可直接调用的设备预设，使跨设备映射与同步成为真实交互约束，而不只是界面视觉问题。" },
    ],
    marqueeText: "SPARK SMART AMP CONNECTED SYSTEM",
    marqueeLabel: "VIEW PROJECT",
  },
];
