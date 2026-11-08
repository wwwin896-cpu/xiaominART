// 主导航：每个页面只允许出现一次（一页一入口）。
// 2026-09-28 调整说明：
//   · 「小民好礼」/gifts/ 原先是「送礼指南」的第三个二级项 —— 语义上它并非送礼指南的子类，
//     且与移动端底栏第一格重复。现提升为一级项，送礼指南的二级只保留两种找礼路径。
//   · /gifts/ 与 /scenes/ 在桌面导航与移动底栏各出现一次，那是同一套导航的两种响应式形态，
//     不是重复入口；真正的重复（同一内容两个 URL）已通过删除页面 + 301 消除。
// 2026-09-28 下午二次调整（品牌亲民化）：
//   · 「艺术家」不再作为一级导航独立出现，并入「关于我们」二级，改称「小民其人」，
//     弱化「艺术」字眼，与品牌的亲民属性吻合。/artists/ 页面本身保留不变。
// 2026-09-28 傍晚三次调整：
//   · 顶部「与我们聊聊」CTA 移除（联系入口保留在页脚 / 寻墨 / 定制咨询表单）。
//   · 「送礼指南」不再作为一级导航，其内容收进「小民好礼」的二级菜单。
//   · 「生活场景」更名「灵感参考」，二级菜单按序 6 项：书、厅、茶、房、礼、企
//     （书厅茶房对应 /scenes/ 页内卡片锚点；礼 → 送礼指南；企 → 企业定制）。
// 2026-09-28 晚间调整：
//   · 「关于我们」取消二级菜单（小民其人、静气生活），点开一级直达 /about/ 品牌介绍页，
//     页内直接呈现创作者介绍（升斗小民 / 非遗小宁，详情页 /artists/{slug}/ 保留）。
//   · 「静气生活」/journal/ 整体下线，_redirects 301 至 /about/。
// 2026-10-06 调整：
//   · 企业礼赠下拉从五个方向锚点精简为三类：送出去的心意 / 留得住的纪念 / 挂进空间的话（对应内页 #gifts #keep #space）。
// 2026-10-12 调整：
//   · 企业礼赠下拉与内页四张卡片标题对齐，并由三类扩为四类：
//     商务伴手礼(#gifts) / 庆典墨宝礼(#keep) / 空间书法礼(#space) / 校园纪念礼(#campus)。
//     → 此前菜单名与卡片名不一致（菜单旧名 vs 卡片新名），访客点进去会看到不同标题；
//       第 4 张卡片「校园纪念礼」此前在导航里没有任何入口，本次一并补齐。
// 2026-10-05 调整：
//   · 「送礼指南」从「小民好礼」二级菜单移除，该下拉只留 现货好礼 / 定制好礼 两条找礼路径。
//     /gift-guide/ 页面仍保留（页脚、/scenes/ 的「礼」、心愿单等入口可进入），不再出现在主导航。
// 2026-10-19 导航改版（业主《定制服务页面架构方案》+ 三问三答裁决）：
//   · 新增「一字一源」一级菜单，二级为「字游记」（/zodiac/，甲骨十二生肖第一辑）
//     与「创作笔记」（/notes/，取字过程记录）
//   · 「小民好礼」取消二级菜单，点击直接进在线商城（当前站内 /gifts/；
//     若将来商城独立域名，只改这一个 href，其余五处（面包屑/结构化数据/
//     sitemap/移动端/页脚）都跟随本数组）
//   · 「企业礼赠」更名「定制业务」，二级为企业定制 / 个人定制两条线。
//     ⚠️ 企业侧地址**仍是 /business-gifts/**，不改 /custom/corporate ——
//        该页已有收录与内链，改地址等于把 SEO/GEO 积累推倒重来（业主 2026-10-19 同意）
//   · 「机构合作」「关于我们」保持不变
//
// 2026-10-31 v5.0 移动端：抽屉菜单第四项「机构合作」→「非遗合作」（业主指定）。
//   用 navLabel 做移动端覆盖，而不是直接改 zh —— 桌面端九处（导航/面包屑/
//   结构化数据/sitemap 注释/页脚）都读 zh，中文关键词「机构合作」已有半年
//   收录积累，桌面端保持原样更稳。移动端抽屉渲染时优先取 navLabel ?? zh。
// 2026-11-01 v6.0 移动端（业主指定）：
//   · 「一字一源」更名「一字一礼」——沿「机构合作→非遗合作」同一条 navLabel 覆盖
//     方案：移动端抽屉显示新名，桌面端九处（导航/面包屑/结构化数据/sitemap/页脚）
//     继续读 zh「一字一源」，保住已有收录关键词；
//   · 首页移动端的「四时一笺」「生肖纪岁」两个板块整段隐藏（Layout.astro），
//     入口收进本菜单 children：「字游记」承接生肖线，「小民好礼」从一级菜单
//     合并进来（/gifts/ 地址不变，SEO 零影响）。
export const navItems = [
  // 2026-11-07：一级落地页由 /zodiac/ 改为 /gifts/ —— 原先一级与二级「字游记」
  // 指向同一地址，等于同一次点击被拆成两层，用户点两次还在原地。
  // 现在一级 = 作品总览（现货 + 定制），二级各项各有独立落地页：
  //   全部 → 现货小品 / 字游记（生肖） / 甲骨文集 / 创作笔记。
  {
    href: '/gifts/', zh: '一字一源', en: 'One Character', navLabel: '一字一礼', children: [
      { href: '/gifts/ready-made/', zh: '现货小品', en: 'Ready to Ship' },
      { href: '/zodiac/', zh: '字游记', en: 'Character Journal' },
      { href: '/oracle/', zh: '甲骨文集', en: 'Oracle Set' },
      { href: '/notes/', zh: '创作笔记', en: 'Studio Notes' },
    ],
  },
  {
    href: '/custom/', zh: '定制业务', en: 'Custom', children: [
      { href: '/business-gifts/', zh: '企业定制', en: 'For Business' },
      { href: '/custom/personal/', zh: '个人定制', en: 'For Individuals' },
    ],
  },
  {
    href: '/partners/', zh: '机构合作', en: 'Partnerships', navLabel: '非遗合作', children: [
      // 2026-10-16 业主裁决：下拉只保留三条业务方向；「合作案例」不是一栏业务，
      // 其入口保留在 /partners/ 页面内的案例卡片里（不再出现在导航下拉）。
      { href: '/partners/publishing/', zh: '出版社插画', en: 'Publishing' },
      { href: '/partners/museum-tourism/', zh: '博物馆与文旅', en: 'Museum & Tourism' },
      { href: '/partners/heritage/', zh: '非遗面塑活动', en: 'Heritage Workshops' },
    ],
  },
  {
    href: '/about/', zh: '关于我们', en: 'About Us', children: [
      { href: '/about/', zh: '品牌介绍', en: 'Our Story' },
      { href: '/artists/xiaomin/', zh: '升斗小民', en: 'Shengdou Xiaomin' },
      { href: '/artists/xiaoning/', zh: '非遗小宁', en: 'Xiao Ning' },
    ],
  },
];

export const processSteps = [
  { no: '01', zh: '说出愿望', en: 'Share the intention', body: '告诉我们空间、人物与想留下的情绪，不必先懂艺术。' },
  { no: '02', zh: '共同取意', en: 'Shape the direction', body: '从字、色、材质与观看距离中，找到属于你的视觉方向。' },
  { no: '03', zh: '艺术家创作', en: 'Artist at work', body: '由匹配的艺术家完成创作，过程中保留必要的确认节点。' },
  { no: '04', zh: '交付一份作品', en: 'Receive the work', body: '最终方案与交付边界确认后，作品以适合你的方式抵达。' },
];

export type Inspiration = {
  slug: string;
  title: string;
  en: string;
  category: string;
  note: string;
  tag: string;
  spaces: string[];
  style: string[];
  artist: string;
  palette: string[];
  frames: string[];
  image?: string;
  /**
   * 该方向对应的小民好礼 slug。
   * 2026-09-28 去重说明：原先这些方向各自有 /inspiration/{slug}/ 详情页，
   * 但 6 个方向里有 5 个与商品详情页是同一件作品，构成重复页面，已整体下线。
   * 此处保留映射，让「方向建议」等入口直接指向唯一有效的商品页。
   * 未设置 productSlug 的方向（如「门槛的光」）属空间定制，统一指向企业定制。
   */
  productSlug?: string;
};

export const inspirations: Inspiration[] = [
  { slug: 'quiet-entry', productSlug: 'quiet-entry-gift', title: '静入', en: 'A Quiet Entrance', category: '空间气质 / Spatial mood', note: '以留白、低饱和纸色和一笔墨色建立入口的安静秩序。', tag: '纸白 · 墨色', spaces: ['玄关', '客厅'], style: ['留白'], artist: '升斗小民', palette: ['纸白', '墨色'], frames: ['matte-black', 'natural-oak'], image: '/assets/scenes/entry-console-scroll.jpg' },
  { slug: 'red-seal', productSlug: 'cinnabar-note-gift', title: '一点朱砂', en: 'A Cinnabar Note', category: '色彩方向 / Colour direction', note: '不追求热闹，只用一处朱砂把观看的重心轻轻点亮。', tag: '朱砂 · 留白', spaces: ['客厅', '茶室'], style: ['朱砂', '留白'], artist: '升斗小民', palette: ['朱砂', '纸白'], frames: ['champagne', 'matte-black'], image: '/assets/scenes/living-room-round-seal.jpg' },
  { slug: 'desk-mountain', productSlug: 'desk-mountain-keepsake', title: '案上有山', en: 'A Mountain on the Desk', category: '案头意象 / Desk object', note: '将山水的起伏收进器物，让日常工作拥有可停留的边界。', tag: '木色 · 线条', spaces: ['书房', '办公室'], style: ['山水', '器物'], artist: '升斗小民', palette: ['木色', '纸白'], frames: ['natural-oak', 'matte-black'], image: '/assets/scenes/study-round-calligraphy.jpg' },
  { slug: 'ink-breath', productSlug: 'ink-breath-teacher', title: '墨有呼吸', en: 'Ink with Breath', category: '书写气息 / Ink gesture', note: '观察墨色浓淡、速度与停顿，寻找不被复制的手感。', tag: '墨色 · 手感', spaces: ['茶室', '书房'], style: ['墨色'], artist: '升斗小民', palette: ['墨色', '灰'], frames: ['matte-black', 'champagne'], image: '/assets/scenes/tea-wall-scroll.jpg' },
  { slug: 'seasonal-letter', productSlug: 'seasonal-letter-gift', title: '四时一笺', en: 'A Letter for the Season', category: '礼赠方向 / Gift direction', note: '让一份礼物从季节、关系与一句话开始，而不是从货架开始。', tag: '节气 · 心意', spaces: ['玄关', '民宿空间'], style: ['留白', '器物'], artist: '升斗小民', palette: ['纸白', '木色'], frames: ['champagne', 'natural-oak'], image: '/assets/scenes/sideboard-fan-calligraphy.jpg' },
  { slug: 'threshold-light', title: '门槛的光', en: 'Light at the Threshold', category: '空间定制 / Spatial commission', note: '为民宿、会客厅与文化空间寻找一处不喧哗的识别。', tag: '空间 · 光线', spaces: ['企业会客厅', '民宿空间'], style: ['留白', '山水'], artist: '升斗小民', palette: ['灰', '木色'], frames: ['natural-oak', 'champagne'], image: '/assets/scenes/living-room-four-panels.jpg' },
];

export const artists = [
  { slug: 'xiaomin', name: '升斗小民', en: 'Dou Sheng Xiaomin', discipline: '书写与用心好礼 / Calligraphy & heartfelt gifting', bio: '以书写为入口，关注人与人之间那些需要被郑重说出的时刻。字既是礼物，也是日常的注脚——从一句心事出发，落成可以留住的纸本。', philosophy: '让一句话先被听见，再寻找适合它的笔墨、尺度与停顿。', styles: ['留白', '墨色'], media: ['书写', '纸本'], projectTypes: ['小幅礼赠', '居家墙面'], portfolio: ['静入', '一点朱砂', '四时一笺'], experience: '经历与展览信息将随创作笔记持续呈现。', siteNote: '落地实景图与公开案例将随授权故事持续呈现。', quote: '参考报价需结合尺寸、媒介、创作复杂度与交付边界沟通确认。',
    services: [
      { zh: '礼赠定制', en: 'Gift commission', body: '生日、乔迁、谢师、开业与周年：从送谁、为什么送开始，落成一幅可以送出的作品。', href: '/custom-commission/?context=礼赠或纪念' },
      { zh: '居家空间陈设', en: 'Space piece', body: '按墙面、光线与观看距离讨论尺幅与装裱，让作品属于那个房间，而不是属于货架。', href: '/custom-commission/?context=家居空间' },
      { zh: '企业礼赠与空间', en: 'Corporate', body: '批量礼赠、会客空间与品牌活动；可从企业想说的那句话开始。', href: '/business-gifts/' },
    ] },
  { slug: 'xiaoning', name: '非遗小宁', en: 'Xiao Ning', discipline: '非遗面塑与手作体验 / Dough figurine & workshops', bio: '以面塑为手上功夫，关注传统手艺如何走进现代日常。主持校园、社区与机构的面塑体验活动，把材料、故事和一段有来处的时间，一起交到参与者手上。', philosophy: '让每个人亲手捏出属于自己的那一段记忆。', styles: ['面塑', '节气'], media: ['面塑', '手作'], projectTypes: ['非遗体验活动', '机构专场'], portfolio: ['节气面塑', '亲子手作课'], experience: '活动经历与现场记录将随授权整理持续呈现。', siteNote: '活动现场照片与案例将随授权整理持续呈现。', quote: '活动费用按人数、时长与材料配置沟通确认。',
    services: [
      { zh: '学校与亲子手作课', en: 'Schools & families', body: '按人数与时长设计可上手的面塑体验，材料、步骤与成品带走，适合校园与亲子活动。', href: '/partners/heritage/' },
      { zh: '博物馆与机构专场', en: 'Museum & institution', body: '围绕展览主题或节气设计专场体验，配合机构的时间、场地与人流安排。', href: '/partners/museum-tourism/' },
      { zh: '活动合作洽谈', en: 'Event collaboration', body: '说明人数、时间与场地条件，我们回复可行性与材料配置方案。', href: '/partners/' },
    ] },

];

export const enterpriseCases = [
  { title: '会客厅的一处留白', en: 'A Quiet Mark for a Reception Room', scene: '企业会客厅 / Reception space', summary: '以空间气质、观看距离与企业希望传达的关系感为讨论起点。', testimonial: '案例概念方向，客户评价与图像授权更多资料即将呈现。' },
  { title: '一群人的礼', en: 'A Gift for a Collective', scene: '企业礼赠 / Corporate gifting', summary: '围绕共同意图讨论书写、礼盒与交付方式，不预设现成组合。', testimonial: '案例概念方向，客户评价与图像授权更多资料即将呈现。' },
  { title: '品牌活动的东方线索', en: 'An Eastern Cue for a Brand Event', scene: '品牌活动 / Cultural event', summary: '为活动主题寻找可被记住但不喧哗的艺术表达。', testimonial: '案例概念方向，客户评价与图像授权更多资料即将呈现。' },
];

export const customerStories = [
  {
    slug: 'study-commission',
    caseSlug: 'quiet-entry',
    client: '案例资料整理中',
    initials: '·',
    type: '书房定制 / Study commission',
    quote: '更多案例即将呈现。公开内容会在获得客户同意后，以尊重隐私的方式记录。',
    en: 'More stories will be shared as they are prepared. Public details will only appear with the client’s consent.',
    status: '公开内容持续整理 / Stories being prepared',
  },
  {
    slug: 'corporate-gifting',
    caseSlug: 'seasonal-letter',
    client: '案例资料整理中',
    initials: '·',
    type: '企业礼赠 / Corporate gifting',
    quote: '这里保留企业礼赠案例的阅读入口，具体合作信息会在获得授权后呈现。',
    en: 'This is a reading entry for a corporate-gifting story; specific collaboration details will be shared with consent.',
    status: '更多案例即将呈现 / More stories soon',
  },
  {
    slug: 'spatial-commission',
    caseSlug: 'threshold-light',
    client: '案例资料整理中',
    initials: '·',
    type: '空间定制 / Spatial commission',
    quote: '空间定制故事将从真实的场景、创作过程与交付边界开始记录。',
    en: 'Spatial commission stories will be recorded from real settings, creative processes and delivery boundaries.',
    status: '公开内容持续整理 / Stories being prepared',
  },
];

export const directionQuiz = [
  { id: 'space', question: '你要定制什么空间的作品？', en: 'What space are you creating for?', options: ['玄关', '客厅', '书房', '茶室', '企业会客厅', '其他'] },
  { id: 'style', question: '你偏好的风格方向？', en: 'Which visual direction feels closest?', options: ['留白', '朱砂', '山水', '墨色', '器物', '其他'] },
  { id: 'medium', question: '你更想触摸哪一种载体？', en: 'Which medium feels right?', options: ['纸本', '木作', '器物', '综合材料', '尚未确定'] },
  { id: 'budget', question: '你的大致预算范围？', en: 'What is your working budget?', options: ['¥100–¥300', '¥300–¥800', '¥800–¥2,000', '需单独评估', '尚未确定'] },
  { id: 'timeline', question: '你希望什么时候开始或收到作品？', en: 'When would you like to begin?', options: ['1个月内', '2–3个月', '3个月以上', '不急'] },
];

export const giftDirections = [
  { title: '一人一语', en: 'One person, one line', body: '为重要的人留下一句只属于你们的文字方向。' },
  { title: '一室一意', en: 'One room, one intention', body: '为居所、工作室或文化空间建立一处沉静的视觉锚点。' },
  { title: '一群人的礼', en: 'A gift for a collective', body: '适用于企业、团队与活动场景的心意定制。' },
];

export type GiftProduct = {
  slug: string;
  name: string;
  en: string;
  scene: string;
  sceneLabel: string;
  /** 篇幅标签（业主 2026-11-09 文案表新增列）：联语吉言 / 尺幅华章 / 字数由君 */
  lengthTag?: string;
  tier: 'entry' | 'thoughtful' | 'keepsake';
  price: string;
  meaning: string;
  recipient: string;
  dispatch: string;
  packaging: string;
  visual: string;
  image?: string;
  /** 详情页画廊：装裱形式与使用空间实拍 */
  gallery?: { src: string; alt: string; caption: string }[];
  /** 产品深度详解（试点：四时一笺） */
  deepDive?: {
    eyebrow: string;
    heading: string;
    intro?: string;
    paragraphs?: string[];
    specs?: { label: string; value: string }[];
    specsNote?: string;
    cards?: { name: string; text: string }[];
    cardColumns?: number;
    image?: string;
    imageAlt?: string;
  }[];
  miniProgramUrl?: string;
  miniProgramStatus?: 'unconfigured' | 'ready' | 'unavailable';
  published?: boolean;
};

// ── 定价规则（业主 2026-10-17 定档）─────────────────────────────────────
// 按「装裱外框尺寸」定价，不按系列定价：
//   外尺寸 40.5 × 17.5 cm（横幅）→ ¥300–500
//   生肖系列 A4 竖幅（21 × 29.7 cm，画芯 16×8）→ 业主 2026-11-07 裁决：统一 ¥199
// 甲骨文系列（生肖 / 甲骨文集）新作品价格一律取 ¥199，无需再确认；
// 其他尺寸（42×22、45×45、160×55 等）价格另定，不套用本条。
export const giftProducts: GiftProduct[] = [
  { slug: 'quiet-entry-gift', name: '静入 · 书房小礼', en: 'A Quiet Entrance · Study Gift', scene: 'housewarming', sceneLabel: '乔迁之喜', tier: 'entry', price: '¥100–300', meaning: '以一处留白，为新居留住第一份安静。', recipient: '适合送给刚搬入新家的朋友、同事或长辈。', dispatch: '预计确认后 7–10 个工作日发出', packaging: '含基础礼盒与手写贺卡选项', visual: '静入', image: '/assets/scenes/study-desk-scroll.jpg' },
  { slug: 'cinnabar-note-gift', name: '一点朱砂 · 丹心可鉴', en: 'A Cinnabar Note · Birthday Gift', scene: 'birthday', sceneLabel: '生日心意、节日问候、婚庆纪念', lengthTag: '字数由君', tier: 'thoughtful', price: '¥199', meaning: '朱砂作底，古字为凭——像那幅「欢喜」，把值得庆贺的事，郑重地讲出来。', recipient: '适合送给朋友、伴侣或希望认真表达感谢的人。', dispatch: '预计确认后 7–10 个工作日发出', packaging: '含礼盒包装、祝福卡和贺卡文字预览', visual: '朱', image: '/assets/scenes/theme-cinnabar.jpg',
    gallery: [
      { src: '/assets/scenes/cinnabar-bedroom.jpg', alt: '古文字「欢喜」书法小品，赭色卡纸装裱，陈设于卧室边柜，旁有暖光台灯与郁金香', caption: '装裱形式一 · 卧室边柜｜赭卡暖调，夜灯下的「欢喜」' },
      { src: '/assets/scenes/cinnabar-tea.jpg', alt: '古文字「欢喜」书法小品，白底黑框装裱，陈设于茶席边柜，旁有兰花与白瓷茶壶', caption: '装裱形式二 · 茶席一角｜白卡黑框，与茶器为伴' },
      { src: '/assets/scenes/cinnabar-study.jpg', alt: '古文字「欢喜」书法小品，白底黑框装裱，陈设于书房案头，旁有砚台与菖蒲盆栽', caption: '装裱形式三 · 书房案头｜与砚台、笔洗同框' },
    ],
    deepDive: [
      {
        eyebrow: 'Chapter 01 / 释读', heading: '「欢喜」', intro: '把「生日快乐」写小众一点，也写得更有出处。', paragraphs: [
  '朱砂自古是郑重之物——古人盟誓用朱、批信用朱、帝王改定也用朱，一点红，是把话说到算数的分量。把「生日快乐」写小众一点、也写得更见出处：与其说「快」，不如写「欢喜」——佛门讲「随喜」，替别人高兴也是功德；祝一个人年年有今日、岁岁有今朝，本就是最郑重的愿。朱砂作底，古字为凭，把值得庆祝的事，郑重地写出来。',
] },
      {
        eyebrow: 'Chapter 02 / 理念', heading: '设计理念与品牌定位', intro: '把庆祝感，收敛进一处朱色。', paragraphs: [
          '市面上的生日礼物大多热闹：气球、蜡烛、包装上的大字祝福。「一点朱砂」走的是另一条路——只留一处朱砂红，把「值得庆祝」讲得克制而郑重。红色是中式语境里的正色，喜庆不必喧哗。',
          '朱砂红卡与留白之间的比例经过反复调校：红色占画面约三分之一，像印章落在纸上的分寸——足够点亮，不至于淹没墨色。挂进卧室、书房都不抢戏，但每次目光扫过，总会先落在那一处红上。',
          '作为小民艺术生日礼赠线的主力产品，「一点朱砂」想传递的态度是：欢喜值得被写下来，而不是被印出来。'] },
      {
        eyebrow: 'Chapter 03 / 规格', heading: '产品规格说明书', intro: '以下是本件作品的参考规格，最终以随附作品档案为准。', specs: [
          { label: '装裱外框', value: '约 42 × 22 cm（横幅），对角线误差 ≤ 1 mm' },
          { label: '画芯尺寸', value: '约 30 × 12 cm，四边留白各约 4 cm' },
          { label: '框体厚度', value: '约 3 cm，内置桌面支架，亦可挂墙两用' },
          { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，手工书写装裱，以实物为准' },
          { label: '选材标准', value: '黑胡桃实木框条（含水率 8%–12%）、朱砂红/赭色卡纸（可选）、光学级玻璃面板' },
          { label: '装配结构', value: '45° 精拼角框体 + 硬质背板，S 形金属挂钩与桌面支架一体' },
          { label: '耐候性指标', value: '适用温度 -10 ℃ 至 40 ℃、湿度 40%–70% RH；朱砂色卡应避免长时间阳光直射以防褪色' } ] },
      {
        eyebrow: 'Chapter 04 / 工艺', heading: '装裱与材质工艺解析', intro: '三处细节，决定了它经不经得起细看。', cards: [
          { name: '朱砂红与赭色卡纸', text: '卡纸颜色以传统矿物色为参照：朱砂取其正，赭石取其温。高克重棉麻基底保证不透墨、不起拱，四边 45° 立体斜切，留白处有真实纵深。' },
          { name: '极窄圆角黑胡桃木', text: '约 8mm 极窄框边，四角 R 形圆角处理，把存在感让给字与色；表面哑光木蜡油收面，深色木框同时压得住朱红与赭石两种底色。' },
          { name: '光学玻璃防眩', text: '高透光、低反射的光学级玻璃，卧室夜灯与窗景并存也不易映出倒影，同时隔绝大部分紫外线，保护墨色与卡纸不老化。' } ], cardColumns: 3 },
      {
        eyebrow: 'Chapter 05 / 陈设', heading: '全场景陈设搭配指南', intro: '五个位置，五种与「欢喜」相处的方式。', cards: [
          { name: '卧室边柜', text: '生日礼最常见的去处。置于床头柜或斗柜，与台灯同高，睡前一眼赭色暖光里的「欢喜」，一天的情绪被轻轻收尾。' },
          { name: '书房案头', text: '与砚台、笔洗、菖蒲成组，坐姿平视刚好。写字的人抬头见「欢喜」，算是给自己留的一句提醒。' },
          { name: '茶席一角', text: '白卡黑框的版本与茶器天然同框。客人问起，主人讲一遍「欢喜」的出处，便是最好的茶席引子。' },
          { name: '客厅展示柜', text: '与纪念物件同柜陈列：旅行带回的陶器、合影、孩子的第一支笔——「欢喜」在这里是一组记忆的题签。' },
          { name: '玄关端景', text: '进门第一眼的小欢喜。配一盏低位灯，归家开灯即见，好日子从进门那一刻开始计数。' } ], cardColumns: 2 },
      {
        eyebrow: 'Chapter 06 / 包装', heading: '高端礼品包装与开箱系统', intro: '从盒子打开的那一刻起，礼物就已经开始了。', paragraphs: [
          '外盒为硬质天地盖礼盒，深黑特种纸裱糊，盒面烫印 xiaominART 标识与朱红印鉴；盒内定制卡位固定框体，运输途中不晃动、不磕碰。',
          '随附风琴折页藏品证书：一面为藏品登记页（作品编号、品名、艺术签名，钤朱红印鉴），一面为使用与养护说明；另配黑色信封一枚，以朱砂火漆封缄——生日祝辞写在信笺上，拆封前谁也没有读过。',
          '棉绳手提袋、米白便签卡与棉质白手套一并提供。开箱次序我们在证书上写好了：先核证书，再戴手套取框，摆位之后，包装纸留着——那也是设计的一部分。'], image: '/assets/scenes/packaging-set.jpg', imageAlt: 'xiaominART 包装系统：黑色天地盖礼盒与烫印标识、棉绳手提袋、风琴折页藏品证书与使用说明、朱砂火漆封缄信封与便签卡' },
    ] },
  { slug: 'seasonal-letter-gift', name: '四季流转 · 岁时寄言', en: 'A Letter for the Season · Festival Gift', scene: 'festival', sceneLabel: '节日问候、生日心意、婚庆纪念', lengthTag: '字数由君', tier: 'thoughtful', price: '¥199', meaning: '岁有寒暑，月有圆缺——从一个节气、一句问候起笔，把四季的流转写成一幅。', recipient: '适合节日送长辈、朋友或重要合作伙伴。', dispatch: '预计确认后 10–14 个工作日发出', packaging: '含节日主题包装与手写贺卡选项', visual: '笺', image: '/assets/scenes/theme-four-seasons.jpg',
    gallery: [
      { src: '/assets/scenes/four-seasons-study.jpg', alt: '古文字「春夏秋冬」书法小品，极窄黑胡桃细框，摆在书房案头，旁有青苔盆景与砚台', caption: '装裱形式一 · 书房案头｜黑胡桃细框，与砚台笔山为伴' },
      { src: '/assets/scenes/four-seasons-tea.jpg', alt: '古文字「春夏秋冬」书法小品，朱红卡纸装裱，陈设于茶室长案，旁有铁壶与炭炉', caption: '装裱形式二 · 茶室长案｜朱红卡裱，茶席视觉重心' },
      { src: '/assets/scenes/four-seasons-cabinet.jpg', alt: '古文字「春夏秋冬」书法小品，朱砂红底装裱，陈设于玄关边柜，旁有干枝红果与灯', caption: '装裱形式三 · 玄关边柜｜朱砂红底，进门第一眼' },
    ],
    deepDive: [
      {
        eyebrow: 'Chapter 01 / 释读', heading: '「春夏秋冬」', intro: '每一幅作品出发前，先过文字这一关。', paragraphs: [
  '中国人过节，从来先应天时：春写「长乐未央」，夏说「清凉」，秋题「月照」，冬祝「岁寒」——节气的轮转本身就是一篇长文。「岁有寒暑，月有圆缺」，古人把这流转写进文字里，一季一句问候，是把天地四时都请进家里。从一个节气、一句问候开始，把四季的流转写成一幅——送给重要的人，就是告诉他：这一年，我都惦记着。',
] },
      {
        eyebrow: 'Chapter 02 / 理念', heading: '设计理念与品牌定位', intro: '让书画从墙上走下来，回到手边的日常。', paragraphs: [
          '我们的「器物哲学」很简单：书画不该只在展厅里被仰视。把它装进可以随手挪动、轻易擦拭、日日相对的尺寸，它就从「作品」变成「器物」——像一只常用的茶杯，因为天天见面而愈看愈亲。',
          '「横幅案头」是我们为这类作品确立的美学定位：横向构图、低重心、与人坐姿视线齐平。它不要求一整面墙，一个书案、一组边柜、一方茶席就是它的展厅，与台灯、砚台、茶器天然同框。',
          '作为小民艺术的书画礼品线，「四时一笺」承担的任务是：让没有书画收藏经验的人，也能轻松地把一件手写作品放进生活，并且经得起每天看。'] },
      {
        eyebrow: 'Chapter 03 / 规格', heading: '产品规格说明书', intro: '以下是本件作品的参考规格，最终以随附作品档案为准。', specs: [
          { label: '装裱外框', value: '约 42 × 22 cm（横幅），对角线误差 ≤ 1 mm' },
          { label: '画芯尺寸', value: '约 30 × 12 cm，四边留白各约 4 cm' },
          { label: '框体厚度', value: '约 3 cm，内置桌面支架，亦可挂墙两用' },
          { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，手工书写装裱，以实物为准' },
          { label: '选材标准', value: '黑胡桃实木框条（含水率 8%–12%）、450g/m² 棉麻卡纸、光学级玻璃面板' },
          { label: '装配结构', value: '45° 精拼角框体 + 硬质背板，S 形金属挂钩与桌面支架一体' },
          { label: '耐候性指标', value: '适用温度 -10 ℃ 至 40 ℃、湿度 40%–70% RH；应避免长时间阳光直射与潮墙贴挂' } ] },
      {
        eyebrow: 'Chapter 04 / 工艺', heading: '装裱与材质工艺解析', intro: '三处细节，决定了它经不经得起细看。', cards: [
          { name: '极窄圆角黑胡桃木', text: '约 8mm 极窄框边，把存在感让给字。四角做 R 形圆角处理，搬运不磕手，视觉上收掉木框的笨重；表面以哑光木蜡油收面，保留木材纹理与触感。' },
          { name: '450g 棉麻卡纸立体斜切', text: '高克重棉麻卡纸提供足够的挺括度，四边 45° 立体斜切，让留白有真实的空间纵深——墨迹浮于纸面之上，灯光下层次分明。' },
          { name: '光学玻璃防眩', text: '高透光、低反射的光学级玻璃，在台灯与窗景并存的环境里不易映出倒影；同时隔绝大部分紫外线，延缓纸张与墨色老化。' } ], cardColumns: 3 },
      {
        eyebrow: 'Chapter 05 / 陈设', heading: '全场景陈设搭配指南', intro: '五个位置，五种与它相处的方式。', cards: [
          { name: '书房', text: '它的原生位置。置于案头正位或书架视线层，与砚台、笔山、镇纸成组，坐姿平视刚好。' },
          { name: '茶室', text: '长案横陈，与主泡器、茶则同轴摆放。朱红卡裱在深色茶席里是天然的重心，宾客落座第一眼即见。' },
          { name: '餐厅', text: '置于餐边柜台面，与陶罐干枝、烛台同高错落；字色呼应桌布与器物，饭桌边的四季从此有出处。' },
          { name: '玄关', text: '进门视线的落点。配一盏低亮度台灯，归家开灯即见「春夏秋冬」，一天的疲惫先被接住。' },
          { name: '休息室', text: '沙发边几或矮柜之上，与落地灯、常读的书、香器成组。它是那个房间里最安静的一件。' } ], cardColumns: 2 },
      {
        eyebrow: 'Chapter 06 / 包装', heading: '高端礼品包装与开箱系统', intro: '从盒子打开的那一刻起，礼物就已经开始了。', paragraphs: [
          '外盒为硬质天地盖礼盒，深黑特种纸裱糊，盒面烫印 xiaominART 标识与朱红印鉴；盒内定制卡位固定框体，运输途中不晃动、不磕碰。',
          '随附风琴折页藏品证书：一面为藏品登记页（作品编号、品名、艺术签名，钤朱红印鉴），一面为使用与养护说明；另配黑色信封一枚，以朱砂火漆封缄——写给收礼人的话，拆封前谁也没有读过。',
          '棉绳手提袋、米白便签卡与棉质白手套一并提供。开箱次序我们在证书上写好了：先核证书，再戴手套取框，摆位之后，包装纸留着——那也是设计的一部分。'], image: '/assets/scenes/packaging-set.jpg', imageAlt: 'xiaominART 包装系统：黑色天地盖礼盒与烫印标识、棉绳手提袋、风琴折页藏品证书与使用说明、朱砂火漆封缄信封与便签卡' },
    ] },
  { slug: 'qin-se-he-ming-gift', name: '琴瑟和鸣 · 静好如初', en: 'In Harmony · Wedding Gift', scene: 'anniversary', sceneLabel: '婚庆纪念、结婚纪念、纪念日', lengthTag: '字数由君', tier: 'thoughtful', price: '¥199', meaning: '「琴瑟在御，莫不静好」——把两个人的名字与祝愿写成一幅，愿此后岁岁年年，仍旧琴瑟相和。', recipient: '适合送给订婚、新婚的伴侣，或作为结婚周年纪念。', dispatch: '预计确认后 7–10 个工作日发出', packaging: '含礼盒包装、祝福卡和贺卡文字预览', visual: '瑟', image: '/assets/scenes/theme-wedding-qin-se-he-ming.jpg',
    gallery: [
      { src: '/assets/scenes/theme-wedding-qin-se-he-ming.jpg', alt: '朱砂红底「琴瑟和鸣」古文字书法横幅，黑胡桃木框装裱，陈设于卧室边柜，旁有白瓷瓶红果与中式卧房', caption: '装裱形式一 · 卧室边柜｜朱砂红底，与喜色卧房同调' },
      { src: '/assets/scenes/theme-wedding-calligraphy-lantern.jpg', alt: '白底古文字书法横幅，陈设于柚木边柜，旁有暖光纸灯笼与蕨类绿植', caption: '装裱形式二 · 玄关边柜｜白底墨字，与灯笼暖光相伴' },
    ],
    deepDive: [
      {
        eyebrow: 'Chapter 01 / 释读', heading: '「琴瑟和鸣」', intro: '先讲清楚这四个字：为什么是「琴瑟和鸣」。', paragraphs: [
  '古人把琴与瑟合奏，声音相和、高低相济，所以拿它比夫妻，《诗经》里就有「妻子好合，如鼓瑟琴」「琴瑟在御，莫不静好」。琴是低音瑟是高音，两样声音不同而相和——好的婚姻不是两个人变成一个，是各守其声、彼此成全。把两个人的名字与祝愿写成一幅，愿此后岁岁年年，和而不齐，敬而不疏。',
] },
      {
        eyebrow: 'Chapter 02 / 理念', heading: '设计理念与品牌定位', intro: '把喜庆感，收进一处朱色与留白。', paragraphs: [
          '市面上的婚庆礼物大多热闹：大红抱枕、烫金摆件、印着「百年好合」的毛巾。「琴瑟和鸣」走的是另一条路——以朱砂红为底、古文字为文，把「郑重的祝愿」讲得克制而有出处。红色是中式语境里的正色，喜庆不必喧哗。',
          '横幅案头是我们的美学定位：横向构图、低重心、与人坐姿视线齐平。它不要求一整面墙，一个边柜、一方玄关、一间卧房就是它的展厅——新居的日常里，它是一件天天见面的器物。',
          '作为小民艺术婚庆纪念线的作品，「琴瑟和鸣」想传递的态度是：祝愿值得被写下来，而不是被印出来。'] },
      {
        eyebrow: 'Chapter 03 / 规格', heading: '产品规格说明书', intro: '以下是本件作品的参考规格，最终以随附作品档案为准。', specs: [
          { label: '装裱外框', value: '外尺寸约 40.5 × 17.5 cm（横幅），对角线误差 ≤ 1 mm' },
          { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
          { label: '框体厚度', value: '约 3 cm，内置桌面支架，亦可挂墙两用' },
          { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，手工书写装裱，以实物为准' },
          { label: '选材标准', value: '黑胡桃实木框条（含水率 8%–12%）、朱砂红/白底卡纸（可选）、光学级玻璃面板' },
          { label: '装配结构', value: '45° 精拼角框体 + 硬质背板，S 形金属挂钩与桌面支架一体' },
          { label: '耐候性指标', value: '适用温度 -10 ℃ 至 40 ℃、湿度 40%–70% RH；朱砂红底应避免长时间阳光直射以防褪色' } ] },
      {
        eyebrow: 'Chapter 04 / 工艺', heading: '装裱与材质工艺解析', intro: '三处细节，决定了它经不经得起细看。', cards: [
          { name: '朱砂红洒金卡纸', text: '朱砂红为中式正色，取其郑重；洒金分布疏密有致，灯光下有细碎的暖光，与喜房的暖色调天然相合。高克重棉麻基底保证不透墨、不起拱。' },
          { name: '极窄圆角黑胡桃木', text: '窄框边把存在感让给字与色；四角 R 形圆角处理，视觉上收掉木框的笨重；表面哑光木蜡油收面，深色木框压得住朱红底色。' },
          { name: '光学玻璃防眩', text: '高透光、低反射的光学级玻璃，床头灯与窗景并存也不易映出倒影，同时隔绝大部分紫外线，保护墨色与卡纸不老化。' } ], cardColumns: 3 },
      {
        eyebrow: 'Chapter 05 / 陈设', heading: '全场景陈设搭配指南', intro: '四个位置，四种与「和鸣」相处的方式。', cards: [
          { name: '卧室边柜', text: '婚庆纪念最常见的去处。置于床头柜或斗柜，与台灯同高，睡前一眼朱色里的祝愿，一天被轻轻收尾。' },
          { name: '玄关端景', text: '进门第一眼的小圆满。配一盏低位灯，归家开灯即见，家的日子从这里开始计数。' },
          { name: '书房案头', text: '与砚台、笔洗成组，坐姿平视刚好。两个人里的读书人抬头见字，算是给共同生活留的一句提醒。' },
          { name: '客厅展示柜', text: '与婚礼请柬、合影、纪念物件同柜陈列——「琴瑟和鸣」在这里是一组记忆的题签。' } ], cardColumns: 2 },
      {
        eyebrow: 'Chapter 06 / 包装', heading: '高端礼品包装与开箱系统', intro: '从盒子打开的那一刻起，礼物就已经开始了。', paragraphs: [
          '外盒为硬质天地盖礼盒，深黑特种纸裱糊，盒面烫印 xiaominART 标识与朱红印鉴；盒内定制卡位固定框体，运输途中不晃动、不磕碰。',
          '随附风琴折页藏品证书：一面为藏品登记页（作品编号、品名、艺术签名，钤朱红印鉴），一面为使用与养护说明；另配黑色信封一枚，以朱砂火漆封缄——写给这对伴侣的祝辞装在信封里，拆封前谁也没有读过。',
          '棉绳手提袋、米白便签卡与棉质白手套一并提供。开箱次序我们在证书上写好了：先核证书，再戴手套取框，摆位之后，包装纸留着——那也是设计的一部分。'], image: '/assets/scenes/packaging-set.jpg', imageAlt: 'xiaominART 包装系统：黑色天地盖礼盒与烫印标识、棉绳手提袋、风琴折页藏品证书与使用说明、朱砂火漆封缄信封与便签卡' },
    ] },
  { slug: 'desk-mountain-keepsake', name: '案上有山 · 几席生岚', en: 'A Mountain on the Desk · Keepsake', scene: 'opening', sceneLabel: '开业贺礼、书房自持、商务馈赠', lengthTag: '字数由君', tier: 'keepsake', price: '¥800 以上', meaning: '案上置山，几席之间自有冈峦。把稳重、开阔与不断生长的祝愿，安放进最日常的一方寸地。', recipient: '适合开业、晋升、周年等需要郑重表达的时刻。', dispatch: '预计确认后 14–21 个工作日发出', packaging: '含珍藏礼盒、包装升级与贺卡文字预览', visual: '山', image: '/assets/scenes/theme-desk-mountain.jpg',
    gallery: [
      { src: '/assets/scenes/desk-mountain-dining.jpg', alt: '古文字通景长卷挂于餐厅上方，下方为原木长餐桌与陶器干花', caption: '横幅长卷 · 餐厅上墙｜贺辞与一日三餐相对，日子越过越实' },
      { src: '/assets/scenes/desk-mountain-panels.jpg', alt: '四条屏书法通景挂于客厅主墙，下方为矮柜与松树盆景，沙发茶几成组', caption: '四条屏通景 · 客厅主墙｜一整面墙的开阔气象' },
      { src: '/assets/scenes/desk-mountain-living.jpg', alt: '古文字横幅挂于客厅沙发上方，落地窗竹影与蒲团坐榻成组', caption: '横幅 · 客厅主墙｜与落地窗竹影同框，静而不喧' },
    ],
    deepDive: [
      {
        eyebrow: 'Chapter 01 / 释读', heading: '「百鱼悠游」', intro: '贺辞先行：开业、晋升、周年，各有各的说法。', paragraphs: [
  '融古老鸟虫篆意趣，字如游鱼，昂首摆尾，穿梭自如。在生活的洪流里，愿你也能找到自己的节奏，游刃有余。案上有山，是心里有一块压得住的地方，也是眼里有一片长不完的高。「大境」往往也「大静」，把这份稳重、开阔与持续生长的祝愿，安放进最日常的空间——案头一隅，自有山河。',
] },
      {
        eyebrow: 'Chapter 02 / 理念', heading: '设计理念与品牌定位', intro: '书房之内，自有山河。', paragraphs: [
          '南朝宗炳晚年不便远游，把山水画在墙上，「卧以游之」——中国人很早就懂得：山不必在远方，也可以在案头。一卷古文字长卷横陈墙上，字势如山势绵延起伏，读它的时候，人在书桌前，神在山水间。「案上有山」的「山」，就是这个意思：书房之内，自有山河。',
          '大境之气，是说格局——通景长卷可达一米六以上，四条屏铺满整面主墙，字与字之间的开阔气象，是给空间定调的；大静之气，是说心性——满幅文字静默悬挂，不喧哗、不催促，坐在它面前批阅、谈事、喝茶，人自然慢下来。大境与大静，一件作品同时给你。',
          '作为小民艺术珍藏档礼赠产品，「案上有山」面向开业、晋升、周年等需要郑重表达的时刻：把「稳重、开阔、持续生长」写进空间——开业花篮三天就撤，而这一墙山河，可以挂很多年。'] },
      {
        eyebrow: 'Chapter 03 / 规格', heading: '产品规格说明书', intro: '以下是本类作品的参考规格，最终以随附作品档案为准。', specs: [
          { label: '通景长卷', value: '外框约 160 × 55 cm（横幅），画芯约 140 × 36 cm' },
          { label: '四条屏', value: '每联外框约 34 × 120 cm，通景总宽约 150 cm，联间间距建议 4–6 cm' },
          { label: '框体厚度', value: '约 3.5 cm，两点挂装，附水平仪定位贴' },
          { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，手工书写装裱，以实物为准' },
          { label: '选材标准', value: '黑胡桃实木框条（含水率 8%–12%）、450g/m² 棉麻卡纸、光学级玻璃/亚克力面板（大尺幅推荐亚克力）' },
          { label: '装配结构', value: '45° 精拼角框体 + 加厚背板，大尺幅配两点式承重挂件，承重经 1.5 倍静载测试' },
          { label: '耐候性指标', value: '适用温度 -10 ℃ 至 40 ℃、湿度 40%–70% RH；大尺幅作品应避免贴挂于潮墙与阳光直射面' } ] },
      {
        eyebrow: 'Chapter 04 / 工艺', heading: '装裱与材质工艺解析', intro: '大尺幅作品，三处细节见真章。', cards: [
          { name: '通景气口控制', text: '长卷与四条屏最难的不是单字，而是整体气口：书写前统稿定位，行与行的呼吸贯通全卷；四条屏各自成幅，又需通景相连，联间字势不断。' },
          { name: '加厚背板与防变形', text: '大尺幅框体配加厚背板与十字加固筋，防止运输与四季湿度变化引起的弓弯；卡纸预留伸缩余量，装裱后静置定性再出厂。' },
          { name: '两点式承重挂装', text: '一米六以上的长卷采用两点式承重挂件，受力均匀不倾斜，附水平仪定位贴与安装说明；上墙后框体与墙面留出呼吸缝，避免贴墙返潮。' } ], cardColumns: 3 },
      {
        eyebrow: 'Chapter 05 / 陈设', heading: '全场景陈设搭配指南', intro: '五个位置，五种打开一整面墙的方式。', cards: [
          { name: '企业前台 / 会客厅', text: '开业贺礼的首选位置。长卷横贯主墙，宾客洽谈的第一眼即是企业的气度；释读页立于一旁，作品自己会说话。' },
          { name: '茶室主墙', text: '通景长卷与原木长案上下呼应，茶席在字下铺开——这是「案上有山」最完整的展陈方式。' },
          { name: '餐厅上墙', text: '长卷挂在餐桌上方，祝辞与一日三餐相对。最好的祝愿不是挂在会客室给客人看的，而是挂进日常里给日子看的。' },
          { name: '客厅主墙', text: '四条屏通景铺满沙发上方，配矮柜与盆景，空间瞬间有了主心骨。' },
          { name: '办公室班台后方', text: '晋升、周年场合的去处。坐于班台，来客视线恰好落在身后的字上——地位与趣味，一次讲清。' } ], cardColumns: 2 },
      {
        eyebrow: 'Chapter 06 / 包装', heading: '高端礼品包装与开箱系统', intro: '大件作品的抵达，同样被认真对待。', paragraphs: [
          '大尺幅作品以定制木架与加厚护角包装，四角受力、整体防潮，长途运输不弓不裂；外箱贴易碎与向上标识，签收后静置半日再开箱，让作品适应新环境的温湿度。',
          '随附风琴折页藏品证书与释读说明：证书一面为藏品登记页（作品编号、品名、艺术签名，钤朱红印鉴），一面为使用与养护说明；另配黑色信封一枚，以朱砂火漆封缄——写给收礼企业或个人的祝辞装在信封里，拆封前谁也没有读过。',
          '开箱与上墙我们替你想好了：证书先核，护角逐层取下，两人抬框对位，水平仪定位贴校准——上墙那一刻，贺礼才算真正送出。'] },
    ] },
  { slug: 'ink-breath-teacher', name: '墨有呼吸 · 落纸见心', en: 'Ink with Breath · Teacher Gift', scene: 'thanks', sceneLabel: '感谢恩师、朋友、生日心意', lengthTag: '字数由君', tier: 'keepsake', price: '¥800 以上', meaning: '自古文人雅趣，皆值得郑重记录——一笔一画的浓淡与停顿都看得见，书香之气，就此落在案头。', recipient: '适合送给老师、爱书之人，或在人生阶段给予帮助的人。', dispatch: '预计确认后 14–21 个工作日发出', packaging: '含珍藏礼盒、说明卡与手写贺卡选项', visual: '墨', image: '/assets/scenes/theme-ink-breath.jpg',
    gallery: [
      { src: '/assets/scenes/ink-breath-writing.jpg', alt: '书写近景：手执毛笔在毛边纸上写下浓墨大字，笔锋转折与飞白清晰可见，旁有砚台', caption: '从落笔开始｜笔锋起落之间的浓淡枯润，就是墨的呼吸' },
      { src: '/assets/scenes/ink-breath-mounting.jpg', alt: '装裱过程：双手以棕刷在棉麻卡纸上匀浆托裱一幅小字书法，旁有竹起子与浆碗', caption: '托裱工序｜棕刷匀浆、竹起子起边，纸与卡贴合的每一下都靠手感' },
      { src: '/assets/scenes/ink-breath-framing.jpg', alt: '装帧完成：双手扶住黑胡桃木框边缘，框内书法作品已装妥，钤有朱红印章', caption: '装帧完成｜入框、验平、钤印归档，作品从此可以立在案头' },
    ],
    deepDive: [
      {
        eyebrow: 'Chapter 01 / 释读', heading: '「魏碑房契」', intro: '先讲清楚这四个字：为什么是「墨有呼吸」。', paragraphs: ['一方魏晋碑刻，记下一纸寻常地契，文字若记得，时光便记得。记录，让我们看见过去，也被未来看见。'] },
      {
        eyebrow: 'Chapter 02 / 理念', heading: '设计理念与品牌定位', intro: '书房雅趣，自古值得被记录。', paragraphs: [
          '中国的文人传统里，书房从来不只是读书的地方——它是主人志趣的全部注脚。一方砚、一枝梅、一帧手书，都是「雅趣」的载体：文震亨写《长物志》，把书斋清供一件件记下来，记的不是物件，是人对自己的期许。「墨有呼吸」接着这个传统往下写：把今天读书人、教书人的书香气，写成一帧可以立在案头的作品。',
          '我们选择密字古文字作为这条产品线的性格：满幅文字需要连续数小时的专注，起笔、行笔、收笔之间的气息全部留在纸上。所谓「呼吸」，就是这些浓淡与停顿——机器打印的字没有生命，一笔一笔写出来的字是活的。挂在书房里，日日相对，像与一位安静的先生同室。',
          '作为小民艺术珍藏档礼赠产品，「墨有呼吸」最合身的位置是书房与书桌：送给老师，是谢师礼；送给爱书的人，是把他的书香气写成一件作品。雅趣不问场合，书香自有归处。'] },
      {
        eyebrow: 'Chapter 03 / 规格', heading: '产品规格说明书', intro: '以下是本件作品的参考规格，最终以随附作品档案为准。', specs: [
          { label: '装裱外框', value: '约 45 × 45 cm（方幅），对角线误差 ≤ 1 mm' },
          { label: '画芯尺寸', value: '约 32 × 32 cm，毛边纸保留原生毛边，四边留白各约 5 cm' },
          { label: '框体厚度', value: '约 3.5 cm，内置桌面支架，亦可挂墙两用' },
          { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，手工书写装裱，以实物为准' },
          { label: '选材标准', value: '黑胡桃实木框条（含水率 8%–12%）、450g/m² 棉麻卡纸、手工毛边宣纸、光学级玻璃面板' },
          { label: '装配结构', value: '45° 精拼角框体 + 硬质背板，S 形金属挂钩与桌面支架一体' },
          { label: '耐候性指标', value: '适用温度 -10 ℃ 至 40 ℃、湿度 40%–70% RH；应避免长时间阳光直射与潮墙贴挂' } ] },
      {
        eyebrow: 'Chapter 04 / 工艺', heading: '装裱与材质工艺解析', intro: '三处细节，决定了它经不经得起细看。', cards: [
          { name: '手工毛边宣纸原边', text: '画芯保留手工毛边纸的原生毛茬，不裁切、不做旧——纸的边缘本身就是手工的证明。墨色在粗纤维上洇出的层次，是机制纸给不了的。' },
          { name: '界格与金文取字', text: '密排文字先以淡墨界格定位，再逐字书写，字距行距全凭手稳；取字皆从青铜铭文与古文字典籍中来，随附释读可查。' },
          { name: '黑胡桃哑光装帧', text: '方幅配中窄边黑胡桃框，哑光木蜡油收面；光学级玻璃低反射、阻紫外线，书房台灯下细读跋文也不会眩光。' } ], cardColumns: 3 },
      {
        eyebrow: 'Chapter 05 / 陈设', heading: '全场景陈设搭配指南', intro: '五个位置，五种与书香相处的方式。', cards: [
          { name: '书房', text: '它的原产地。方幅立于案侧或书架视线层，与文房器物成组——砚台、镇纸、常读的书都在身边，坐姿平视刚好。' },
          { name: '书桌一角', text: '写字读书的人把它立在桌面上，像给自己请了一位安静的先生：批注到深夜抬头见字，浮躁自然收住。' },
          { name: '茶室案头', text: '茶桌一隅，与陶瓶、铁壶同框。密字作品在茶席上耐读，一泡茶的工夫刚好读一段，书香与茶香彼此作注。' },
          { name: '玄关端景', text: '进门见字如见人。配低位灯光，密字在暖光下层次分明，归家的第一眼有了着落。' },
          { name: '客厅矮柜', text: '学生成家后把谢师礼挂进自家客厅——它从一个房间走进另一个房间，情分与书香一起流转。' } ], cardColumns: 2 },
      {
        eyebrow: 'Chapter 06 / 包装', heading: '高端礼品包装与开箱系统', intro: '从盒子打开的那一刻起，礼物就已经开始了。', paragraphs: [
          '外盒为硬质天地盖礼盒，深黑特种纸裱糊，盒面烫印 xiaominART 标识与朱红印鉴；盒内定制卡位固定框体，运输途中不晃动、不磕碰。',
          '随附风琴折页藏品证书与释读说明：证书一面为藏品登记页（作品编号、品名、艺术签名，钤朱红印鉴），一面为使用与养护说明；另配黑色信封一枚，以朱砂火漆封缄——写给老师的那段话装在信封里，拆封前谁也没有读过。',
          '棉绳手提袋、米白便签卡与棉质白手套一并提供。开箱次序我们在证书上写好了：先核证书，再戴手套取框，摆位之后，包装纸留着——那也是设计的一部分。'], image: '/assets/scenes/ink-breath-packaging.jpg', imageAlt: '墨有呼吸珍藏礼盒：黑胡桃框作品与黑色天地盖礼盒、棉绳手提袋一同陈列于案头，旁有茶壶与砚台' },
    ] },

  // ── 2026-10-31 业主上新：案头横幅小品 14 件（现货，实景图入库）───────────
  // 定价（业主指定，覆盖此前的「40.5×17.5 → ¥300–500」默认档）：
  //   心静则泰（45×45 方幅 · 画芯 40×40）→ ¥299；
  //   其余 13 件横幅（外框 40.5×17.5 · 画芯 38×15）→ ¥199。
  // 均为已装裱现货：dispatch 含「现货」字样，GiftProductDetail 会自动识别为
  // 「现货顺丰直发」交付模式（WO-P0-02 的正则判定，无需新增字段）。
  // 归类：scene 取 giftScenes 既有键（housewarming/opening/birthday/festival），
  // 保证场合页与移动端分类筛选（applyGroup）自动接住，不出现空类。
  // SEO：详情页 title/description/Product JSON-LD/面包屑由 gifts/[slug].astro
  // 按 meaning/recipient/packaging 自动拼装——各字段务必写成完整可读的句子，
  // 不要写成关键词堆砌（写法要求已录入 xiaominart-visual-layout skill）。
  { slug: 'xin-jing-ze-tai', name: '心静则泰 · 一茎定气', en: 'A Still Heart · Square Framed Work', scene: 'housewarming', sceneLabel: '乔迁之喜、书房自持、禅意修心', lengthTag: '联语吉言', tier: 'entry', price: '¥299', meaning: '心一静，事便顺了。竖排题字配一茎兰草，方幅居中，如替房间安下一枚安静的锚——茶室、玄关、书案之侧都放得住。', recipient: '适合送给常喝茶、爱读书的人，或为新居、新办公室添一份静气。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '心', image: '/assets/works/xin-jing-ze-tai.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「心静则泰」', paragraphs: [
  '「泰」字从「水」下加双手——本指通泰、安适，《易经》泰卦「天地交而万物通」，是诸事通达的好卦。古人信一个因果：心一乱，事就堵；心一静，气就顺，路就通——静是因，泰是果。竖排题字配一茎兰草、方幅居中，像给房间安了一个安静的锚点。送给常喝茶、爱读书的人，是替他说一句：别慌，静下来，就顺了。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 45 × 45 cm（方幅），对角线误差 ≤ 1 mm' },
        { label: '画芯尺寸', value: '约 40 × 40 cm，四边留白装裱' },
        { label: '框体', value: '原木色实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '实木框条、棉麻卡纸留白、光学级玻璃面板' } ] },
    ] },
  { slug: 'an-ning', name: '安寧 · 室雅人安', en: 'Peace at Home', scene: 'housewarming', sceneLabel: '乔迁之喜、新居陈设、长辈心意', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '一曰安，一曰宁——家之所求，不过二字：身安，心宁。行草舒展宽厚，悬于边柜之上，灯下一眼，便是终岁的安稳。', recipient: '适合乔迁、婚房布置，或送给牵挂家宅平安的长辈。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '安', image: '/assets/works/an-ning.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「安寧」', paragraphs: [
  '「安」从宀从女——屋檐之下有安放的人，家便有了着落；「寧」的繁体从宀、从心、从皿、从丁，四样俱备、心有所主，才是真宁。这两个字说的不是外面安静，是心里有人、有底。行草写得舒展宽厚，一笔下去，是把「愿你安好」这件事说得很轻，却很实。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'bao-pu-shou-zheng', name: '抱樸守正 · 素处以默', en: 'Hold to Simplicity, Keep Upright', scene: 'opening', sceneLabel: '开业贺礼、书房自持、励志自勉', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '抱朴守正，出《道德经》「见素抱朴」。在世间滚过一圈仍守得住本分的人，才当得起这四个字——悬于办公室，是自省，也是底气。', recipient: '适合送给创业者、合伙人或新办公室落成的团队。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '樸', image: '/assets/works/bao-pu-shou-zheng.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「抱樸守正」', paragraphs: [
  '「见素抱朴」是老子给纷乱世道开的一剂药：素是没染的丝，朴是没剖的木——越干净、越本来的东西越接近道。「正」字在甲骨文是一只脚（止）朝着一个方（一）走——不偏不斜，就是正。滚过一圈还守得住本分的人，最懂这四个字的分量：抱朴是守住来时的自己，守正是走稳脚下的每一步。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'shou-zheng-chu-qi', name: '守正出奇 · 以正合奇', en: 'Upright in Principle, Bold in Play', scene: 'opening', sceneLabel: '开业贺礼、商务馈赠、励志自勉', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '以正合，以奇胜——守得住正道，才出得了奇兵。横幅挂在案头上方，谈判时余光可及，是做事的分寸，也是胆识。', recipient: '适合送给做经营、带团队的人，或乔迁新办公室的同仁。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '奇', image: '/assets/works/shou-zheng-chu-qi.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「守正出奇」', paragraphs: [
  '语出《孙子兵法》「凡战者，以正合，以奇胜」——「正」是正面摆开的阵，「奇」是暗地里备着的那一手（读 jī，指待动的奇兵）。可没有「正」顶在前头，「奇」就无处可出：先把正道站稳，才有资格出奇。挂在办公桌上方，谈判时余光能扫到——它提醒的是分寸：守正是底线，出奇是胆识；先守得住，才赢得漂亮。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'shou-zheng', name: '守正 · 立身之本', en: 'Hold Upright', scene: 'opening', sceneLabel: '开业贺礼、书房自持、商务馈赠', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '二字的分量，在于日日看得见。守正——守住做人的底、做事的线，书房与办公室皆宜，赠男子尤稳。', recipient: '适合送给重视原则的师长、同事或合作伙伴。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '正', image: '/assets/works/shou-zheng.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「守正」', paragraphs: [
  '「守」从宀从寸——屋檐之下有一只手（寸，掌寸为法度）在把持；「正」在甲骨文是一只脚朝着一条直线走——不偏、不斜。合起来就是：把该守的那条线，天天用手护着、用脚走着。两个字的分量不在难，在「天天看得见」——办公室、书房挂得住，送男生尤其稳：它不催你发达，只提醒你别越过自己画的那条线。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'wan-shi-heng-tong', name: '萬事亨通 · 开门见顺', en: 'All Things Prosper', scene: 'opening', sceneLabel: '开业贺礼、节日问候、乔迁之喜', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '萬事亨通——四字写在开业那日最宜：进门的人顺，出门的事顺。以古文字写吉语，庄重里带着人气，挂在店铺、会客区皆不违和。', recipient: '适合送给开店做生意、做服务的朋友，也适合挂在会客区。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '萬', image: '/assets/works/wan-shi-heng-tong.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「萬事亨通」', paragraphs: [
  '「亨」与「享」古本一字，甲骨文像高台献祭——把牲玉献上、神灵纳受，凡事就顺了；《易经》里「亨」是「元亨利贞」四德之一，本义就是通达无阻。所以「亨通」不是空喊吉利，是「路都走得通」。古文字写吉语，庄重里带着人气——四个字写在开业那天最合适：进门的人顺，出门的事顺，挂店里、会客区都不违和。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'ban-cang', name: '半藏 · 留白自处', en: 'Half Hidden', scene: 'housewarming', sceneLabel: '乔迁之喜、茶室小品、书房雅趣', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '好东西，藏一半。半藏——茶席上留三分不说破，日子里留一半不摆出。隶书墨色极淡，是全系列最安静的一件。', recipient: '适合送给懂茶、习茶的人，或挂在茶室、榻榻米一隅。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '藏', image: '/assets/works/ban-cang.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「半藏」', paragraphs: [
  '「藏」字笔画极繁，古人偏要在一堆笔画里藏出意思：部首「艸」下面是「臧」，既是收藏，也是善与好——好东西本就该收着。曾国藩把自己的书房命名为「求缺斋」，说花未全开、月未圆时最好。「半藏」正是这个「半」字哲学：十分的好处留三分不说破。隶书墨色极淡，蚕头雁尾都收敛着——它教人懂得，藏一半，东西才还是自己的。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'he-shou', name: '鶴壽 · 南山并寿', en: 'Crane Longevity', scene: 'birthday', sceneLabel: '生日心意、长辈孝敬、节日问候', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '鹤为长寿之征。「鶴壽」二字以古文字写就，旁题「福如東海，壽比南山」——祝寿的老话都收进一幅。为长辈上寿，比红包郑重得多。', recipient: '适合送给过寿的长辈、敬重的师长，或作为家族纪念。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '壽', image: '/assets/works/he-shou.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「鶴壽」', paragraphs: [
  '「鹤」从鸟从隺——为什么祝寿偏挑鹤？《相鹤经》说它「食于水，饮水生，羽虫之大者」，古人观察鹤长寿、白首、姿态清贵，便把长寿、高洁两样都寄在它身上。「鹤寿」二字以古文字写就，旁题「福如东海，寿比南山」——一句写天地之广，一句写山岳之久，祝寿的老话都收进一幅。给长辈过寿，这一幅比红包郑重得多。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'na-mo-a-mi-tuo-fo', name: '南無阿彌陀佛 · 六字洪名', en: 'Homage to Amitabha', scene: 'festival', sceneLabel: '节日问候、禅意修心、长辈孝敬', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '六字洪名，以汉简笔意写就，淡茶色底配朱印。供于佛龛之侧、玄关条案，出入皆得看见——是家中的定盘星。', recipient: '适合送给礼佛的长辈，或作为佛堂、禅室的空间供养。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '佛', image: '/assets/works/na-mo-a-mi-tuo-fo.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「南無阿彌陀佛」', paragraphs: [
  '六字洪名以汉简笔意写就，淡茶色底配朱印。「南无」读 nāmó，是梵语 namas，合掌归依、致敬之意；「阿弥陀」是「无量」——无量光、无量寿。净土宗把这六字当往生净土的凭据，称念即是修行。它不挑人、不挑时，进门见一次、出门见一次，像家里一枚定盘的星——不是要你信什么，是先让心有个可以落脚的地方。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'hu-zhong-ri-yue-chang', name: '壺中日月長 · 缓煮光阴', en: 'Long Days in the Teapot', scene: 'housewarming', sceneLabel: '乔迁之喜、茶室清供、禅意修心', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '壶里自有日月长——一泡茶的工夫，天大的事也先搁一搁。五字专赠爱茶的人，挂在茶室、茶台之侧最宜。', recipient: '适合送给泡茶的人、开茶馆的朋友，或为自家茶室、茶台边添一件压得住的小品。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '壺', image: '/assets/works/hu-zhong-ri-yue-chang.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「壺中日月長」', paragraphs: [
  '「壶中日月」有个典故：《后汉书》记费长房见卖药老翁跳入悬壶，壶里竟别有仙山楼阁、洞天福地——从此「壶中天地」成了「小小一物里藏着大乾坤」的说法。茶壶虽小，一泡茶的工夫能把天大的事先放一放，日头慢下来、人静下来，就真有点「壶中日月长」的意思。写给爱茶的人，挂在茶台边正合适。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'jian-ding', name: '堅定 · 心如磐石', en: 'Steadfast', scene: 'birthday', sceneLabel: '生日心意、励志自勉、开业贺礼', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '考学、创业、转行、渡关——二字不多说，只站在他这一边。行楷写得笃定，摆在书桌右上，抬头便借到一口气。', recipient: '适合送给备考的孩子、起步的朋友，或需要一点笃定的自己。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '堅', image: '/assets/works/jian-ding.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「堅定」', paragraphs: [
  '「坚」从臤从土——本义是土夯得实、不可动摇；「定」从宀从正——屋下安住不动，心有所主就定了。两个字都不是「相信自己」那种虚劲，而是把地基砸实了、把脚站稳了。行楷写得一笔一顿、笃定不飘，摆在他书桌右上角——考学、创业、渡难关的时候，不用你多劝，抬头借一口气，就够他再撑一阵。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'jin-lan', name: '盡覽 · 万象在案', en: 'All Within Sight', scene: 'housewarming', sceneLabel: '乔迁之喜、书房自持、商务馈赠', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '汉简写「盡覽」——尽收眼底。案头立着这两个字，手里的事再杂，抬头一望，便算把自己重新摆正。', recipient: '适合送给做研究、做管理的人，或挂在书房与办公桌前。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '覽', image: '/assets/works/jin-lan.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「盡覽」', paragraphs: [
  '「盡」的繁体从「皿」——像手持器物倾尽其中，本义是全部倒出、毫无保留；「覽」从「監」——像俯身对着水盆照看自己，本义是居高临下、尽收眼底。「尽览」就是把所有事都看进眼里、摆在明面上，不藏不漏。汉简写得率意飞动，立在案头正合它的意思：手里的事再杂，抬头看一眼这两个字，就当把自己重新摆正了一遍。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'jin-lan-zhong', name: '盡覽中 · 一窗收尽', en: 'All Within Sight · Three Characters', scene: 'housewarming', sceneLabel: '乔迁之喜、书房自持、家居陈设', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '盡覽中——风景尽在眼里，格局亦尽在眼里。三字比二字版多一处顿挫，横挂矮柜上方，留白与居室一同松下来。', recipient: '适合送新居入伙的朋友，或为斗柜、边柜上方的横向墙面选一件小品。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '覽', image: '/assets/works/jin-lan-zhong.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「盡覽中」', paragraphs: [
  '「尽览中」比「尽览」多一个「中」字，妙处全在这个字。「中」在甲骨文是一支箭穿过一面旗、一个圈——不偏不倚，恰在当间。风景尽在眼里、格局也尽在眼里，而人站在「中」处，看得最广也最稳。三字横挂矮柜上方，留白随居室一起松下来——它不说你要看什么，只让你站到一个看得开的位置上。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'tui-chuang-jiang-wu-ji', name: '推窗四面江無際 · 满壁江声', en: 'Open the Window to the Boundless River', scene: 'housewarming', sceneLabel: '乔迁之喜、书房自持、商务馈赠', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '窗甫推开，江面无边——全系列字数最多的一件。七字一行写开，行气如江水横流，宜于有进深的横墙：客厅长柜、书案上方。', recipient: '适合送给事业 opening 一周年、搬进大办公室的人，或自家用作客厅主墙。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '江', image: '/assets/works/tui-chuang-jiang-wu-ji.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「推窗四面江無際」', paragraphs: [
  '「無」的甲骨文字形像一个人挥着牛尾起舞——是祭天地时「通于无极」的意思，本义正是「没有边际」。这四个字写的是推窗那一刻：四面江水铺开，望不到边。人是会把自己活窄的，挂在墙上这一句，是替你把视野推开一次——行气如江水横流，七字一行写开，正适合一堵有进深的横墙：屋里的事再挤，抬头有这一片江。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'dao-chang-zong-ma-xing', name: '道長縱馬行 · 长路纵缰', en: 'Ride On, the Road Is Long', scene: 'opening', sceneLabel: '开业贺礼、励志自勉、生日心意', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '道长，正好纵马。五字赠赶路的人：路还长，放开缰绳跑。隶书横幅纪年题款，挂在办公室或玄关，出门进门都提气。', recipient: '适合送给创业途中、转换赛道的朋友，或作为开业、升职的贺礼。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '馬', image: '/assets/works/dao-chang-zong-ma-xing.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「道長縱馬行」', paragraphs: [
  '「道长」常被读成一句愁——路太远、力不济；这里偏偏翻过来读：正因为路长，才更该纵马。隶书横幅带着纪年题款，像一封写给赶路人的短信。古人说「任重而道远」，重点不在「远」，在「任」——担子沉，马蹄才踏实。路还长，正好放开缰绳，把日子跑成一匹不肯停的马。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'wo-shi-guan-yun', name: '卧石觀雲 · 闲中最乐', en: 'Lying on Stone, Watching Clouds', scene: 'housewarming', sceneLabel: '乔迁之喜、书房自持、禅意修心', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '卧在石头上看云——四字是一种本事：忙里偷闲，把日子过松。挂在客厅或书房，抬头一望，提醒自己偶尔也躺一躺，看看天。', recipient: '适合送给把日子过得紧的朋友，或为新居的客厅、书房添一件松快的字。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '雲', image: '/assets/works/wo-shi-guan-yun.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「卧石觀雲」', paragraphs: [
  '「卧」字从「臣」从「人」（或从「卜」）——本指俯身低头、歇下来的样子；「观云」是古人的闲课：陶弘景笑谢征「岭上白云，不堪持赠」，王维「行到水穷处，坐看云起时」。这四个字是一种本事——忙里偷闲，把日子过松。石头硬、云最软，卧在硬的上面看软的飘——它不说你要放下，只是提醒你：偶尔躺平看看天，天也在等你。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'zhuo-jiu-yu-wei', name: '酌酒餘味 · 微醺见真', en: 'Sip Slow, Savor Long', scene: 'festival', sceneLabel: '节日问候、乔迁之喜、家居陈设', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '小酌有馀味，微醺见真趣。挂在餐边柜、酒柜上方，一顿饭、一杯酒便有了讲究——人生有馀味，值得慢慢品。', recipient: '适合送给懂酒、爱张罗饭局的朋友，或作为节日聚会的心意。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '酌', image: '/assets/works/zhuo-jiu-yu-wei.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「酌酒餘味」', paragraphs: [
  '「酌」从「酉」（酒坛）从「勺」——用勺从坛中取酒，本义是斟酌、有节制地饮，不是灌醉，是慢慢品。所谓「余味」，是酒过之后口里还在的那一点回甘——最好的滋味都「有余」：话不说满、酒不倒满、兴不留尽。挂在餐边柜、酒柜上方，一顿饭一杯酒就有了讲究：人生有味，全在那个「余」字，慢慢品，别急着喝完。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'yi-ru-luan-feng', name: '儀如鸞鳳 · 容止可思', en: 'Grace of Phoenix', scene: 'festival', sceneLabel: '节日问候、生日心意、婚庆纪念', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '仪态如鸾凤——赞一个人把日子过得端然有格。赠敬重的女性长辈、挚友，或挂在女主人的空间，是一句郑重的漂亮话。', recipient: '适合送给仪度端然的长辈与女友，或作为节日、寿诞的致意。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '鳳', image: '/assets/works/yi-ru-luan-feng.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「儀如鸞鳳」', paragraphs: [
  '「仪」的繁体从「人」从「義」——仪态是「义」写在身上的样子：举止得体，是心里有分寸的人才做得到的。「鸾凤」是传说中的瑞鸟，雌雄和鸣、羽仪华美，古人用来赞人的风度与品性。「仪如鸾凤」是把一个人把日子过得端然有格的样子说尽了——送给敬重的女性长辈、挚友，或挂在女主人的空间，是一句郑重的漂亮话。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'pin-ming-ting-qin', name: '品茗聽琴 · 人间清事', en: 'Tea in Hand, Qin in Ear', scene: 'housewarming', sceneLabel: '乔迁之喜、茶室清供、书房自持', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '一盏茶、一张琴，是中式生活里最省的奢侈。挂在茶室、琴房或客厅，四字一挂，空间的调性便定住了。', recipient: '适合送给习茶、抚琴的朋友，或为茶室、琴房的墙面选一件定调的小品。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '茗', image: '/assets/works/pin-ming-ting-qin.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「品茗聽琴」', paragraphs: [
  '「品」是三个「口」——茶不叫喝，叫品，一口分三口，慢下来才算数；「茗」本是晚采的茶，古人特意用这个字，取那份不赶时候的从容。「琴」字像两张琴并排、弦丝在木上——士无故不撤琴瑟，琴是养心的东西。一盏茶、一张琴，是中式生活里最省钱的奢侈。四个字挂上去，一盏茶一张琴，空间的调子一下就定住了。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'he-qi-zai-tang', name: '和氣在堂 · 春风一座', en: 'Harmony Fills the Hall', scene: 'housewarming', sceneLabel: '乔迁之喜、家居陈设、长辈心意', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '「家和万事兴」的上半句。「和氣在堂」挂在堂屋正墙，一进门便看得见——一个家的气象，先由这四字定下。', recipient: '适合乔迁、婚房布置，或送给新婚小家庭、希望大家和和气气的长辈。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '和', image: '/assets/works/he-qi-zai-tang.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「和氣在堂」', paragraphs: [
  '「家和万事兴」人人会说，它的上半句其实更古——「和气在堂」。「堂」是正屋、是会客行礼的正位，一家人的气场从这里立起来。古人挂「和气在堂」于堂屋正墙，是相信这四个字有种镇屋的分量：一屋人肯让一步、各留三分余地，屋里的火气就低下去，运气就升上来。挂在客厅正墙，一进门先看见的就是这份让。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'da-qiao-ruo-zhuo', name: '大巧若拙 · 以拙胜巧', en: 'Great Skill Looks Plain', scene: 'opening', sceneLabel: '开业贺礼、书房自持、商务馈赠', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '语出《老子》「大直若屈，大巧若拙」——真正的巧，看上去反而朴素。悬于办公室、书房，是做事人自定的分寸与野心。', recipient: '适合送给做手艺、做产品、做学问的人，或挂在工作室与书房。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '巧', image: '/assets/works/da-qiao-ruo-zhuo.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「大巧若拙」', paragraphs: [
  '语出《老子》「大直若屈，大巧若拙」——真正的巧，看上去反而笨。这不是让人装笨：匠人练到极处，知道哪里该省、哪里藏锋，就不炫技了，看上去平平，落手才见真功夫。「拙」字从手从出——本是不灵巧、慢半拍的意思，老子偏把它捧成最高的巧。这四个字是给做事的人立的分寸：耐得住「慢」，才配得上「巧」。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'bao-pu-han-zhang', name: '抱樸含章 · 韫椟藏辉', en: 'Hold Simplicity, Harbor Excellence', scene: 'opening', sceneLabel: '开业贺礼、书房雅趣、商务馈赠', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '「抱朴」守其本真，出《老子》；「含章」敛其光华，出《易经》「含章可贞」。四字是做事人的修养：外面收敛，里面扎实——悬于书房案头，是一种不张扬的底气。', recipient: '适合送给踏实做事的伙伴、管理者，或挂在书房自勉。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '樸', image: '/assets/works/bao-pu-han-zhang.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「抱樸含章」', paragraphs: [
  '「抱朴」出《老子》「见素抱朴」——「朴」是未剖的原木，「抱」是用手护住它，护住那点没被雕过的本真。「含章」出《易经》坤卦「含章可贞」——「章」是文采光华，「含」是把光含在口里不吐出来。四个字合在一起是做事人的修养：内有文采而不急着露，外守本真而不肯丢。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'bai-hua-qi-fang', name: '百花齊放 · 一堂春色', en: 'A Hundred Flowers in Bloom', scene: 'festival', sceneLabel: '节日问候、乔迁之喜、开业贺礼', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '百花齐放，春满厅堂。四字挂进客厅，一堂生机——好日子原该如此：各开各的花，共成一个春天。', recipient: '适合乔迁、春节，或送给刚布置好客厅的朋友。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '花', image: '/assets/works/bai-hua-qi-fang.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「百花齊放」', paragraphs: [
  '「齊」的甲骨文字形像一株禾麦吐穗、穗头齐平——本义是「同高、同好」，先民在田里看庄稼长得一样精神，就造了这个字。「百花齐放」妙在「齐」字：不是让所有花开成一朵，是让每朵花都开成自己。四个字挂进厅堂，是把一屋子的热闹各归其位——你开你的红，我开我的白，凑在一起，就是春天。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'nian-hua-yi-xiao', name: '拈花一笑 · 不立文字', en: 'A Flower Held, A Smile Shared', scene: 'housewarming', sceneLabel: '乔迁之喜、禅意修心、茶室清供', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '佛家公案：拈花不语，一笑心知。四字挂在玄关、曲廊，是给懂的人看的——最好的默契，从不说破。', recipient: '适合送给心照不宣的老友，或挂在玄关端景。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '笑', image: '/assets/works/nian-hua-yi-xiao.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「拈花一笑」', paragraphs: [
  '这是佛门最出名的一桩「无字」公案：灵山会上，释迦拈起一枝花，默然不语，唯有摩诃迦叶破颜微笑——佛当即说：「吾有正法眼藏……付嘱摩诃迦叶。」最高的那件事说不出口，一说就错，只能以心传心。这四个字是给「懂的人」留的：一句不说，全在了。挂在玄关端景，是给推门进来那位老友看的——最好的默契，不必说破。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'nan-de-hu-tu', name: '難得糊塗 · 由聪入晦', en: 'Good to Be Foolish', scene: 'housewarming', sceneLabel: '乔迁之喜、书房自持、家居陈设', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '郑板桥的老话：聪明难，糊涂难，由聪明而转入糊涂更难。四字挂在书房、餐桌，是过来人的豁达——较真的事放下些，日子便松些。', recipient: '适合送给事事认真的朋友，或挂在书房自警。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '糊', image: '/assets/works/nan-de-hu-tu.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「難得糊塗」', paragraphs: [
  '郑板桥这四个字有原话：「聪明难，糊涂难，由聪明而转入糊涂更难。」——不是真糊涂，是什么都看明白了，偏不点破、不较劲，是聪明之后的选择。所以这四个字专送给事事认真、眼里揉不得沙子的人。挂在书房、餐桌，是过来人递的一杯温水：较真的事放下一件，日子就松一寸；能装一回糊涂，是本事，也是慈悲。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'wu-kong', name: '悟空 · 空处容物', en: 'Awakened to Emptiness', scene: 'festival', sceneLabel: '节日问候、禅意修心、茶室清供', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '「悟空」二字是佛家的功课，也是每个人的功课——悟得空处，才装得下万物。大字旁以行书小字题长款，挂在茶室禅室，气象很大。', recipient: '适合送给礼佛、习禅的友人，或作为茶室禅房的空间供养。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '悟', image: '/assets/works/wu-kong.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「悟空」', paragraphs: [
  '「悟」从心从吾——吾心自明，不必外求，是「我心里想通了」；「空」从穴从工——本义是孔穴、虚空，佛家借它说万物没有固定不变的自性。悟空不是「什么都没有」，是看破了那些执念，心里腾出地方来。大字旁以行书小字题长款，一静一动的对照气象很大——悟得空处，才装得下万物。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'guan-gu-zhi-jin', name: '觀古知今 · 鉴往知来', en: 'Study the Past, Know the Present', scene: 'opening', sceneLabel: '开业贺礼、书房自持、商务馈赠', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '观古知今——史册里的事，今日仍在发生。四字挂在办公室、书房，是做决断者的案头功夫：看得懂来路，才看得清前路。', recipient: '适合送给管理者、研究者，或挂在书房与会客区。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '古', image: '/assets/works/guan-gu-zhi-jin.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「觀古知今」', paragraphs: [
  '「觀」的繁体从「雚」从「见」——睁大眼睛细察，不是随便一看。司马迁说「网罗天下放失旧闻，略考其行事……稽其成败兴坏之纪」，读史读的就是这个「稽」——把古事的因果捋直了，照见眼前。这四个字是做决策人的案头功夫：历史从不重复，却总在押同样的韵——看得懂过去，才看得清前路。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'chi-kui-shi-fu', name: '喫虧是福 · 传家长物', en: 'A Loss Is a Blessing', scene: 'housewarming', sceneLabel: '乔迁之喜、长辈心意、家居陈设', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '「喫虧是福」是流传已久的持家老话——肯吃亏的人，福泽在后头。隶书横幅摆在餐边，举箸抬头见一次，计较的事便淡一分。', recipient: '适合乔迁、新店开张，或送给事事要强、需要松一口气的朋友。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '虧', image: '/assets/works/chi-kui-shi-fu.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「喫虧是福」', paragraphs: [
  '「虧」的繁体从「虧」省，右边是「虧」——本义是气缺损、有缺口；「喫虧」就是肯让自己吃点「缺」。郑板桥一生写「吃亏是福」，还留了一句注解：「满者，损之机；亏者，盈之渐。」——太满反而是损耗的开头，吃点亏，反倒是圆满将到的先声。隶书横幅端端正正摆在餐桌边，一家人抬头见一次，计较的事就淡一分。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'chun-feng-de-yi', name: '春風得意 · 走马长安', en: 'Riding the Spring Breeze', scene: 'opening', sceneLabel: '开业贺礼、生日心意、励志自勉', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '「春风得意马蹄疾，一日看尽长安花」——孟郊登科后写下的快意。金文横幅四字，赠正在上升期的人：风既来，便扬鞭。', recipient: '适合送给升职、中标、开业的朋友，或挂在办公室自我激励。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '春', image: '/assets/works/chun-feng-de-yi.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「春風得意」', paragraphs: [
  '「春风得意马蹄疾，一日看尽长安花」——孟郊四十六岁才中进士，一生失意，就痛快在这一回。这四个字的好，在「得意」二字：不是春风好，是心里有事成了、有劲使上了，连风都替你顺。「春」字金文像草木在日下破土、屯然初生——本就是万物向上的时候。送给正在上升期的人：风来了，正是跑起来的日子。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'du-xing-zhi-yuan', name: '篤行致遠 · 跬步千里', en: 'Walk Far, Walk Steady', scene: 'opening', sceneLabel: '开业贺礼、励志自勉、商务馈赠', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '「篤行」出《中庸》「博学之……笃行之」，「致遠」化自《诫子书》「非宁静无以致远」。认准的路一步一步走，自然行得远。', recipient: '适合送给做实业、做研究、备考上岸的人，或挂在书房与办公桌侧。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '行', image: '/assets/works/du-xing-zhi-yuan.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「篤行致遠」', paragraphs: [
  '「笃」从竹从马——原指马行沉稳、一步不滑，引申为踏实用力。《中庸》列学问五步——博学、审问、慎思、明辨，最后落在「笃行」：前面四样都想明白了，剩下全在一个「做」字。「致远」化自《诫子书》「非宁静无以致远」。认准的路一步一步走，走得慢，反而走得远。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'lan-qu-guan-shi', name: '覽趣觀世 · 人间可玩', en: 'See the World with Delight', scene: 'housewarming', sceneLabel: '乔迁之喜、书房自持、茶室清供', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '自右向左读「覽趣觀世」——带一分趣味去看人世，日子便有滋味。隶书横幅挂在客厅、会客区，来客抬头便是一乐。', recipient: '适合乔迁新居、送给有趣味的友人，或挂在会客厅待客。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '趣', image: '/assets/works/lan-qu-guan-shi.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「覽趣觀世」', paragraphs: [
  '从右往左读：「覽趣觀世」。先看这个「趣」字——从「走」从「取」，本义是奔向想去的地方，后来才生出「意味、好玩」的意思：有意思的人，都是先肯为点什么奔一程的人。带一点趣味去看人世，苦的日子也肯咂出滋味来。隶书横幅横着挂在会客区，进门的人抬头一乐——这四个字先替你把待客的姿态摆松弛了。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'mao-de-yan-nian', name: '懋德延年 · 令德高寿', en: 'Virtue and Long Years', scene: 'birthday', sceneLabel: '生日心意、长辈孝敬、节日问候', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '「懋」读 mào，勤勉而盛大。懋德延年——勤以修德的人，岁月也肯多与他几年。隶书横幅庄重大气，压得住厅堂。', recipient: '适合送给过寿的长辈、敬重的师长，或作为家族纪念。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '德', image: '/assets/works/mao-de-yan-nian.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「懋德延年」', paragraphs: [
  '「懋」读 mào，从「草」下加「冒」「心」，本义是勤勉、盛大，《尚书》里常用「懋哉」勉励人努力修德。「延年」是老话——愿岁月多留几年。四个字连读有古人朴素的因果观：肯修德、肯精进的人，命数也肯厚待他。隶书横幅笔画端严、结体宽博，庄重大气，压得住一整面客厅——祝寿送这幅，是把「德」和「寿」一起说了。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'ru-yu-de-shui', name: '如魚得水 · 相得甚欢', en: 'Like Fish in Water', scene: 'opening', sceneLabel: '开业贺礼、商务馈赠、生日心意', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '刘备曰「孤之有孔明，犹鱼之有水也」。如鱼得水，是人对境遇最高的夸奖。金文横幅赠去了新地方、新岗位的人：愿你如鱼得水。', recipient: '适合送新入职、新合作、乔迁开业的朋友。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '水', image: '/assets/works/ru-yu-de-shui.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「如魚得水」', paragraphs: [
  '刘备得诸葛亮，说「孤之有孔明，犹鱼之有水也」。这四个字是人对处境的最高夸奖——不是努力，是契合，终于到了那个让你舒展的地方。鱼在水中不觉得在水，水也从不跟鱼要名分，好的关系都是这样：彼此需要得那么自然，反而不必说。金文横幅送给去了新地方、新岗位的人，是最妥帖的一句：愿你如鱼得水。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'ting-ji-liang', name: '挺脊梁 · 不折方立', en: 'Stand Tall', scene: 'opening', sceneLabel: '励志自勉、生日心意、乔迁之喜', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '三个字，一句话：把脊梁挺起来。隶书横幅挂在玄关，出门进门各挺一次——日子再难，也不弯腰。', recipient: '适合送给扛起担子的人——创业、转岗、顶门立户的朋友。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '挺', image: '/assets/works/ting-ji-liang.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「挺脊梁」', paragraphs: [
  '「脊」字上半像骨节层叠、下面是「肉」——脊柱是人身一节一节撑起来的承重柱；「脊梁」既是这根骨，也指一个人最硬的那口气。三个字，一句话：把脊梁挺起来。隶书横幅起笔收笔都带着撑开的力道，挂在玄关——出门挺一次，进门挺一次；日子再沉，先别塌下去。这三个字是给扛起担子的人写的。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'xiong-huai-xu-ruo-shui', name: '胸懷虛若水 · 虚舟不怒', en: 'A Heart Open as Water', scene: 'housewarming', sceneLabel: '乔迁之喜、书房自持、商务馈赠', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '自右向左读：胸懷虛若水。虚而能容——水不争、能受、随物赋形，是「上善若水」的另一解。古文字横幅挂在客厅，静气十足。', recipient: '适合送给格局大、性子静的师长朋友，或挂在客厅沙发侧墙。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '水', image: '/assets/works/xiong-huai-xu-ruo-shui.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「胸懷虛若水」', paragraphs: [
  '从右往左读。「虚」的繁体从「虍」（虎头）从「业」从「丘」——本义是大山之上空旷无人，引申为空、谦。「上善若水」水有三德：不争、能容、随物赋形——倒进方杯是方、倒进圆器是圆，从不较劲却总能到位。古文字横幅挂在客厅静气十足——它说的是格局：把自己放空一点，反而什么都装得下。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'xuan-hu-ji-shi', name: '懸壺濟世 · 仁术长春', en: 'Healing the World', scene: 'opening', sceneLabel: '开业贺礼、感谢恩师、生日心意', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '《后汉书》载壶公悬壶行医，「悬壶济世」遂为医者仁心的代称。隶书横幅赠医生、中医师，或挂在诊所药堂，都是分量最重的一份敬意。', recipient: '适合送给医师、药师，或作为诊所、中医馆的开业挂牌。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '壺', image: '/assets/works/xuan-hu-ji-shi.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「懸壺濟世」', paragraphs: [
  '《后汉书·方术传》记：市中有卖药老翁，悬一壶于肆头，医术通神、分文不取——「悬壶」从此成了行医的代称。这个「济」字从「水」从「齐」——本义是让所有人都齐齐渡过水去，不是锦上添花，是把人从难的这一边渡到那一边。隶书横幅送给医生、中医师，挂在诊所、药堂，分量最重：它敬的不是一门手艺，是一颗渡人的心。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'yang-tian-di-zheng-qi', name: '養天地正氣 · 法古完人', en: 'Nourish the Righteous Qi', scene: 'opening', sceneLabel: '开业贺礼、书房自持、商务馈赠', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '于右任先生书「養天地正氣，法古今完人」，百年校训由此而来。五字隶书横幅挂在书房，是读书人的案头底气。', recipient: '适合送给教师、学子、做学问的人，或挂在书房与办公室。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '養', image: '/assets/works/yang-tian-di-zheng-qi.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「養天地正氣」', paragraphs: [
  '于右任先生书「养天地正气，法古今完人」，这副联后来成了许多学校的校训。「正气」是孟子说的「浩然之气」——「其为气也，至大至刚……配义与道」，是平日一点点做对的事积出来的。「养」字用得好：正气不是喊出来的，是一日一日养大的。五字隶书横幅挂在书房，是读书人的案头底气——不必天天讲，心里有数。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'yu-you-yuan-ren-lun-dao', name: '與有緣人論道 · 座上皆友', en: 'Talk of the Way with Kindred Spirits', scene: 'housewarming', sceneLabel: '乔迁之喜、茶室清供、书房自持', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '自右向左读：與有緣人論道。一桌茶，两三位知己，说的都是心里的事。隶书横幅挂在茶室——来的，都是对的人。', recipient: '适合送给茶友、开茶馆的朋友，或挂在自家茶席上方。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '道', image: '/assets/works/yu-you-yuan-ren-lun-dao.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「與有緣人論道」', paragraphs: [
  '「缘」的繁体从「糸」从「彖」——本义是衣服的边缘、丝线的头，佛家借它说人与人之间那根看不见却牵着你的线。一桌茶，两三知己，谈的都是心里的事——所谓「有缘」，不过是频率相近的人刚好坐到了一起。隶书横幅挂在茶室，是替主人立的一条规矩：来者未必多，但来的，都得是对的人。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'yue-zhao-song-jian', name: '月照松間 · 松月入厅', en: 'Moonlight Among the Pines', scene: 'housewarming', sceneLabel: '乔迁之喜、书房自持、家居陈设', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '王维《山居秋暝》「明月松間照，清泉石上流」。四字隶书横幅，把山居的清凉气请进客厅——屋里再闹，墙上总有一片松间月色。', recipient: '适合乔迁、送给心里住着山水的朋友。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '月', image: '/assets/works/yue-zhao-song-jian.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「月照松間」', paragraphs: [
  '「間」的繁体从「门」从「月」（或从日）——门缝里透进一缕光，本义是缝隙、是光进来的地方。王维原句「明月松间照，清泉石上流」——月光穿过松针，是一格一格洒下来的。「月照松间」把这股山居的清凉请进客厅：屋里再闹、再闷，墙上有一片松间的月色在慢慢照着。四字隶书横幅，送给心里还住着山水的人。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'zong-heng-bi-mo', name: '縱橫筆墨 · 落笔如风', en: 'Brush and Ink Unbound', scene: 'opening', sceneLabel: '开业贺礼、书房自持、商务馈赠', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '縱橫筆墨——写字的人最痛快的状态。隶书横幅压在书案上方的墙上，笔一提起来，就有一股放开的手感。', recipient: '适合送给写字、画画、做设计的朋友，或挂在书房。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '墨', image: '/assets/works/zong-heng-bi-mo.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「縱橫筆墨」', paragraphs: [
  '「从」的甲骨文字形像一人跟随一人——是「纵」的本字，「纵」加「糸」后有了放任、放开的意思；「纵横」就是往哪走都不设防。「纵横笔墨」是写字的人最痛快的状态：胸有成竹，手不再犹豫，一笔下去就敢收都敢放。隶书横幅压在书桌上方的墙上，笔一提起来，就有一股放开的手感——送给写字、画画、做设计的人，懂的人一看就手痒。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 40.5 × 17.5 cm（横幅）' },
        { label: '画芯尺寸', value: '约 38 × 15 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'bo-re', name: '般若 · 照见五蕴', en: 'Prajna · Wisdom', scene: 'festival', sceneLabel: '节日问候、禅意修心、茶室小品', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '「般若」读 bōrě，佛家谓照见之智，《心经》全名即「般若波罗蜜多」。古文字竖幅两字，静置于案头禅室——是懂的人才接得住的一份心意。', recipient: '适合送给礼佛、习禅的长辈与友人，或挂在茶室、禅室一隅。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '若', image: '/assets/works/bo-re.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「般若」', paragraphs: [
  '「般若」读 bōrě，是梵语 prajñā 的音译，指的不是聪明，是看穿 things 本相的那种大智慧——《心经》全称「般若波罗蜜多心经」，「波罗蜜多」是「到彼岸」。这两个字形古奥奇崛，本身就像一道需要静下来才解得开的公案。懂的人看见的不是字，是一个提醒：聪明用来做事，智慧用来安心。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 17.5 × 40.5 cm（竖幅）' },
        { label: '画芯尺寸', value: '约 15 × 38 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'fu-shou-kang-ning', name: '福壽康寧 · 堂上三多', en: 'Blessing, Longevity, Health, Peace', scene: 'birthday', sceneLabel: '生日心意、长辈孝敬、节日问候', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '福、壽、康、寧——《尚书》五福得其四，一幅写全。竖幅四字自上而下一气贯下，赠长辈，是压得住席面的一份祝寿礼。', recipient: '适合送给过寿的长辈、家宴寿庆，或作为送给全家人的祝愿。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '福', image: '/assets/works/fu-shou-kang-ning.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「福壽康寧」', paragraphs: [
  '《尚书·洪范》列五福：「一曰寿，二曰富，三曰康宁，四曰攸好德，五曰考终命。」这幅字取其中四样：福（顺遂）、寿（绵长）、康（无病）、宁（心安）。「康宁」二字连用本就是古文原话——古人早替你把最朴素的祝寿话说尽了。竖幅四字自上而下一气贯下，送长辈时不用多解释：中国人看了四千年的好话，压得住场面，也压得住情分。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 17.5 × 40.5 cm（竖幅）' },
        { label: '画芯尺寸', value: '约 15 × 38 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'da-dao-zhi-jian', name: '大道至簡 · 删繁就简', en: 'The Great Way Is Simple', scene: 'opening', sceneLabel: '开业贺礼、书房自持、商务馈赠', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '最深的道理，往往最简。竖幅四字立在玄关、案侧，抬头见一次，便把心里多余的东西删去一分。', recipient: '适合送给做管理、做产品、做学问的人，或挂在书房与办公桌侧。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '道', image: '/assets/works/da-dao-zhi-jian.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「大道至簡」', paragraphs: [
  '「道」字从辵（辶）从首——一条路，一个人（首）走在上面；道理本是走出来的，不是想出来的。「簡」从竹从间——古人把话写在竹简上，竹片一片接一片、间隙分明，所以「简」是去掉缠绕、留下筋骨。「大道至简」不是简单，是绕了千山万水之后，敢说那一句最短的。抬头见一次，就把自己心里多余的东西删掉一点。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 17.5 × 40.5 cm（竖幅）' },
        { label: '画芯尺寸', value: '约 15 × 38 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'cha-li-qian-kun-da', name: '茶裏乾坤大 · 一盏山河', en: 'A Universe in the Cup', scene: 'housewarming', sceneLabel: '乔迁之喜、茶室清供、开业贺礼', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '一盏茶里装得下山川岁月。竖幅五字自上而下一气贯下，如提壶注水的一线——杯盏虽微，天地自宽，饮茶的人两头都占。', recipient: '适合送给泡茶的人、开茶馆的朋友，或为自家茶室添一件竖幅。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '茶', image: '/assets/works/cha-li-qian-kun-da.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「茶裏乾坤大」', paragraphs: [
  '「壶里乾坤大，杯中日月长」本是一副老联，写茶写酒都可。「乾」从十日十早（倝）从乙，本义是日上中天、阳气上行——所以「乾坤」是天地，是撑开的一大一小两个世界。一句「茶里乾坤大」，是把整座山川收进一盏茶：竖幅五字自上而下一线贯下，像提壶注水的姿态——杯子小，天地大，肯在一杯茶里坐下来的人，两头都占。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 17.5 × 40.5 cm（竖幅）' },
        { label: '画芯尺寸', value: '约 15 × 38 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'da-yin-xi-sheng', name: '大音希聲 · 听之以气', en: 'The Greatest Sound Is Silence', scene: 'housewarming', sceneLabel: '乔迁之喜、禅意修心、书房自持', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '语出《老子》「大音希声」——最宏大的声响反而听不见。竖幅挂在客厅玄关，白卡黑字，两三笔入眼，是懂的人才接得住的一句话。', recipient: '适合送给寡言而有力量的师长、朋友，或挂在需要一点静气的墙面。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '音', image: '/assets/works/da-yin-xi-sheng.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「大音希聲」', paragraphs: [
  '《老子》「大音希声，大象无形」——最大的声音，耳朵反而听不见，因为它无所不在。「希」是稀少、近乎没有。雷雨收尽之后的那一片静，母亲在门外迟迟不响的那一声唤，都比响在耳边的更震人。白卡黑字两三笔入眼，正是「希声」的样子：说得越少，留下的回响越长。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 17.5 × 40.5 cm（竖幅）' },
        { label: '画芯尺寸', value: '约 15 × 38 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'he-qi', name: '和氣 · 一门春暖', en: 'Harmony in the Air', scene: 'housewarming', sceneLabel: '乔迁之喜、家居陈设、开业贺礼', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '「和氣」二字以古文字写就，竖幅立于玄关——进门是和气，出门也和气。家和万事兴，商和气生财，都从这二字起。', recipient: '适合乔迁、开店的朋友，或送给希望家中和气的长辈。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '和', image: '/assets/works/he-qi.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「和氣」', paragraphs: [
  '「和」字初形从龠（一种编排众管的乐器）从禾——众音相谐、各有高低而合于一曲，才叫和；不是所有人唱一个调，是那口气顺了、平了。《汉书》有言「和气致祥，乖气致戾」——一团和气，是祥瑞的开头。古文字竖幅立在玄关，进门见一次、出门见一次：家和、事顺、人安，都从这口气开始。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 17.5 × 40.5 cm（竖幅）' },
        { label: '画芯尺寸', value: '约 15 × 38 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'huang-jin-tai-shang-bao', name: '黃金臺上報 · 遇主酬知', en: 'Repaid on the Golden Terrace', scene: 'opening', sceneLabel: '开业贺礼、励志自勉、商务馈赠', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '李贺《雁门太守行》「報君黃金臺上意」——黄金台是燕昭王筑台招贤处。竖幅五字，写的是知遇与报效的彼此成全。', recipient: '适合送给提携过自己的师长、恩人，或挂在办公室提醒自己不负所托。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '報', image: '/assets/works/huang-jin-tai-shang-bao.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「黃金臺上報」', paragraphs: [
  '「报君黄金台上意，提携玉龙为君死」——李贺《雁门太守行》。黄金台是战国燕昭王所筑，置千金于台上招揽天下贤士，从此成了「知遇」的象征。这个「报」字是关键：不是单向的给予，是你真把我当人看，我愿为你拼命——知遇与报效，是彼此的成全。竖幅隶书五字，送给提携过自己的人，分量最重的一句是：我没辜负这份看重。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 17.5 × 40.5 cm（竖幅）' },
        { label: '画芯尺寸', value: '约 15 × 38 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'shang-hua-pin-ming-zhu-feng', name: '賞花品茗 · 餘韻逐風', en: 'Sipping Tea, Chasing the Breeze', scene: 'housewarming', sceneLabel: '乔迁之喜、茶室清供、家居陈设', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '竖幅十字隶书：賞花品茗，遣興餘韻逐風。赏花、喝茶，兴尽了而韵不尽，随东风走去——茶席上最松弛的一刻，被写成了字。', recipient: '适合送给爱茶的人、开茶馆的朋友，或挂在自家茶室。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '茗', image: '/assets/works/shang-hua-pin-ming-zhu-feng.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「賞花品茗遣兴餘韻逐風」', paragraphs: [
  '竖幅十字隶书。「韵」字本作「音」加旁——本来听不见、说尽之后还在心里回响的那一缕，就叫「余韵」。赏花是眼前的事，喝茶是当下的事，而「余韵逐风」是曲终人散之后，那口气还在风里飘。把茶席上最松弛的那一刻写成了字：事情过了，兴头散了，好滋味却追着风走，好久不散。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 17.5 × 40.5 cm（竖幅）' },
        { label: '画芯尺寸', value: '约 15 × 38 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'xi-jing-si-wei-cha', name: '習靜四圍茶 · 静中一盏', en: 'Stillness, and Tea on All Sides', scene: 'housewarming', sceneLabel: '乔迁之喜、茶室清供、书房自持', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '与「養心一澗水」恰成一对：養心一澗水，習靜四圍茶。心付与涧水，静付与四围茶——化用古人联语的茶室好句。', recipient: '适合挂在茶室、送茶友；与「養心一澗水」配成一对更完整。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '茶', image: '/assets/works/xi-jing-si-wei-cha.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「習靜四圍茶」', paragraphs: [
  '与「養心一澗水」恰成一对：「養心一涧水，习静四围茶。」「习」的繁体从「羽」从「白」——像小鸟反复振翅学飞，本义是一遍遍地练；静不是天生，是练出来的，茶一盏盏围上来，人就一点点静下去。心交给涧水，静交给四围的茶——化用古人联语的茶室好句，与「养心」一联配齐，茶室墙上便有了呼吸的一起一伏。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 17.5 × 40.5 cm（竖幅）' },
        { label: '画芯尺寸', value: '约 15 × 38 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'xuan-lan', name: '玄覽 · 涤除玄鉴', en: 'The Mystic Mirror', scene: 'housewarming', sceneLabel: '乔迁之喜、书房自持、禅意修心', lengthTag: '联语吉言', tier: 'entry', price: '¥199', meaning: '《老子》第十章「滌除玄覽，能無疵乎」——把心里的镜子洗净，还染不染尘埃？古文字竖幅二字，名中带「玄」，挂在玄关再合适不过。', recipient: '适合送给爱读老庄的朋友，或挂在玄关、书桌侧。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '覽', image: '/assets/works/xuan-lan.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「玄覽」', paragraphs: [
  '《老子》第十章：「涤除玄览，能无疵乎？」——把心里那面幽深的镜子擦拭干净，还能没有瑕疵吗？「玄」是幽远、微妙、看不透却真实存在；「览」是俯身照看。老子说的镜子就是心，要时时擦洗。「玄览」二字名字里带着「玄」，挂在玄关最妙——推门先照见自己：外面世界太吵，先问问心里那面镜子擦干净了没有。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 17.5 × 40.5 cm（竖幅）' },
        { label: '画芯尺寸', value: '约 15 × 38 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
  { slug: 'yang-xin-yi-jian-shui', name: '養心一澗水 · 涧底洗心', en: 'A Stream to Nurture the Heart', scene: 'housewarming', sceneLabel: '乔迁之喜、茶室清供、书房自持', lengthTag: '尺幅华章', tier: 'entry', price: '¥199', meaning: '竖幅五字：養心一澗水。养心不必远山大海，一涧水便够。与「習靜四圍茶」恰成一对，配齐即是一副完整的茶室联。', recipient: '适合乔迁、送长辈静养之居，或挂在客厅过道与茶室。', dispatch: '现货 · 48 小时内顺丰直发', packaging: '黑胡桃实木装裱 · 含藏品证书与释读卡 · 礼盒包装', visual: '澗', image: '/assets/works/yang-xin-yi-jian-shui.jpg',
    deepDive: [
      { eyebrow: 'Chapter 01 / 释读', heading: '「養心一澗水」', paragraphs: [
  '「养」的繁体上「羊」下「食」——奉养、涵养，是慢慢喂大一个东西。「心」要养，不必远山大海：一涧活水就够——水在石上淌，人看着看着，心里的火就凉了一半。古人讲「仁者乐山，智者乐水」，涧水正是那一点「智」的清凉。竖幅五字与「习静四围茶」恰成一对，配齐了就是茶室墙上一幅完整的呼吸。',
] },
      { eyebrow: 'Chapter 02 / 规格', heading: '产品规格', specs: [
        { label: '装裱外框', value: '约 17.5 × 40.5 cm（竖幅）' },
        { label: '画芯尺寸', value: '约 15 × 38 cm，四周留白装裱' },
        { label: '框体', value: '黑胡桃实木框 · 厚约 3 cm，桌面支架与挂墙两用' },
        { label: '尺寸公差', value: '木框 ±0.5 cm，画芯 ±0.3 cm，以实物为准' },
        { label: '选材', value: '黑胡桃实木框条、光学级玻璃面板' } ] },
    ] },
];

export const giftScenes = [
  { slug: 'housewarming', name: '乔迁之喜', en: 'Housewarming', body: '为新居添一处书香静气。' },
  { slug: 'opening', name: '开业贺礼', en: 'Opening gift', body: '用一份有文化温度的心意，祝愿事业开张。' },
  { slug: 'birthday', name: '生日心意', en: 'Birthday', body: '不追逐热闹，认真表达对一个人的在意。' },
  { slug: 'festival', name: '节日问候', en: 'Festival greeting', body: '让节日礼物拥有一段可以被记住的故事。' },
  { slug: 'thanks', name: '感谢恩师 / 朋友', en: 'Thank you', body: '把感谢写下来，送给曾经照亮你的人。' },
];

/**
 * 送礼场合。
 *
 * `desc` 是 meta description 兜底文案（2026-10-28 审计后补）。
 * 优先级：YAML 的 `seoDescription` > 这里的 `desc` > `intro` 拼接。
 * 此前模板只用 `intro`（20 字上下）拼一句尾巴，导致 6 个场合页描述全部偏短。
 */
export const giftOccasions = [
  { slug: 'birthday', title: '生日心意', en: 'Birthday gifts', intro: '不追逐热闹，认真表达对一个人的在意。', scenes: ['birthday', 'thanks'],
    desc: '生日礼物怎么选：不追逐热闹，认真表达对一个人的在意。手写书法小品、案头摆件与礼盒，含实木装裱与手写贺卡，¥300 起，可按下单对象定制题字。' },
  { slug: 'housewarming', title: '乔迁之喜', en: 'Housewarming gifts', intro: '为新居添一处书香静气，也为新的生活留一份祝愿。', scenes: ['housewarming'],
    desc: '乔迁礼物怎么选：为新居添一处书香静气。手写书法挂字与案头小品，按玄关、客厅、书房给题字建议，含装裱与礼盒，可直接送到对方手上，¥300 起。' },
  { slug: 'festival', title: '节日问候', en: 'Festival gifts', intro: '让节日礼物从一句问候开始，慢慢抵达日常。', scenes: ['festival', 'thanks'],
    desc: '节日礼物怎么选：让心意从一句问候开始，慢慢抵达日常。按春节、中秋、教师节等节令推荐手写书法小品与礼盒，含手写贺卡，¥300 起，支持定制。' },
  { slug: 'teacher-thanks', title: '感谢恩师 / 朋友', en: 'Thank-you gifts', intro: '把感谢写下来，送给曾经照亮你的人。', scenes: ['thanks'],
    desc: '谢师礼怎么选：把感谢写下来，送给曾经照亮你的人。手写书法小品配释读一页，说明字义的来处，比礼品卡更郑重，¥300 起，可定制题字与贺卡。' },
  { slug: 'opening', title: '开业贺礼', en: 'Opening gifts', intro: '用一份有文化温度的心意，祝愿事业开张。', scenes: ['opening', 'keepsake'],
    desc: '开业贺礼怎么选：用一份有文化温度的心意祝愿事业开张。书法墨宝、匾额式挂字与空间陈设小品，可按行业与店名题字，含上门交付评估，¥300 起。' },
  { slug: 'anniversary', title: '周年与纪念', en: 'Anniversary gifts', intro: '为共同走过的时间，留下一件可以被反复看见的礼物。', scenes: ['opening', 'thanks', 'anniversary'],
    desc: '周年纪念礼物怎么选：为共同走过的时间留一件可以被反复看见的礼物。手写书法小品可题两个人的名字、一句话或一个日期，含装裱，¥300 起。' },
];

/**
 * 送礼对象。
 * `desc` 用途同上：YAML `seoDescription` > 本字段 > `intro` 拼接。
 */
export const giftRecipients = [
  { slug: 'parents', title: '送长辈', en: 'For parents and elders', intro: '选择一份稳重、温和、可以进入日常的心意。', scenes: ['thanks', 'festival'],
    desc: '送长辈礼物怎么选：一份稳重、温和、可以进入日常的心意。手写「寿」「福」「安」字小品，实木装裱，字义可查，比保健品更耐看，¥300 起。' },
  { slug: 'partner', title: '送伴侣', en: 'For a partner', intro: '从你们共同拥有的一句话、一段时间或一个空间开始。', scenes: ['birthday', 'festival'],
    desc: '送伴侣礼物怎么选：从你们共同拥有的一句话、一段时间开始。手写书法小品可题你们的纪念日或昵称，一物一件，含装裱与手写贺卡，¥300 起。' },
  { slug: 'friends', title: '送朋友', en: 'For friends', intro: '为朋友的小聚、生日或新的生活阶段准备一份不喧哗的礼。', scenes: ['birthday', 'housewarming'],
    desc: '送朋友礼物怎么选：为小聚、生日或新的生活阶段准备一份不喧哗的礼。手写书法小品与案头摆件，含礼盒包装，百元级价位，可加手写贺卡。' },
  { slug: 'teachers', title: '送老师', en: 'For teachers', intro: '用书写、纸本和墨色表达长久的感谢与敬意。', scenes: ['thanks'],
    desc: '送老师礼物怎么选：用书写、纸本和墨色表达长久的感谢与敬意。手写书法小品配释读一页，说明字义出处，谢师礼不落俗，¥300 起，可定制。' },
  { slug: 'clients', title: '送客户 / 合作伙伴', en: 'For clients and partners', intro: '让一份礼物替关系留下清晰、克制而有温度的表达。', scenes: ['opening', 'festival'],
    desc: '送客户礼物怎么选：让一份礼物替关系留下清晰、克制而有温度的表达。企业礼赠不设固定起订量、按项目评估，可定制企业标识与贺卡，对公结算开专票。' },
  { slug: 'team', title: '送员工 / 团队', en: 'For teams', intro: '适合团队纪念、节日慰问和需要共同分享的时刻。', scenes: ['festival', 'opening'],
    desc: '团队礼物怎么选：适合团队纪念、节日慰问与需要共同分享的时刻。手写书法小品可统一题字、逐人落款，不设固定起订量，含企业名义贺卡，对公结算。' },
];

export const giftTierLabels = {
  entry: { name: '入门款', en: 'Everyday gift', range: '¥100–300', body: '适合用心好礼、朋友小聚与轻量心意。' },
  thoughtful: { name: '心意款', en: 'Thoughtful gift', range: '¥300–500', body: '适合生日、节日与需要认真准备的关系。' },
  keepsake: { name: '珍藏款', en: 'Keepsake gift', range: '¥800 以上', body: '适合开业、周年、谢师等重要时刻。' },
};

// ── 字游记 · 第一辑：甲骨文十二生肖（2026-10-17 业主定档）──────────────────
// 系列规格（全系列统一，业主 2026-10-17 文档）：外框 A4 竖幅、画芯 16×8 cm、胡桃木框。
// 价格（业主 2026-11-07 裁决）：甲骨文系列全价统一 ¥199（此前 2026-10-17 定的 ¥300–500 已废除）。
//    吉语亦经业主确认，十二件全采用现版本，无需再核。
// 扩容方式：业主填 docs/作品批量素材/C-字游记扩容素材表.csv，助手按表批量追加。
// 吉语已定版（业主 2026-10-17 确认「采用你这套语言」），后续扩容仍按「实物题字」为准。
export type ZodiacWork = {
  slug: string;
  char: string;
  name: string;
  en: string;
  blessing: string;
  price: string;
  story: string;
  image: string;
  alt: string;
};

export const zodiacWorks: ZodiacWork[] = [
  { slug: 'shu', char: '鼠', name: '甲骨文 · 鼠', en: 'Rat', price: '¥199', blessing: '子鼠开天', story: '甲骨文的「鼠」张着尖嘴，垂着碎屑般的长尾，像刚从粮囤边溜过。传说天地混沌未开，是鼠咬破混沌漏下第一道光——「鼠咬天开」，一天时辰从子时开始。', image: '/assets/zodiac/zodiac-shu.jpg', alt: '甲骨文「鼠」字书法摆件，珊瑚橘暗纹笺，黑胡桃木框装裱，陈设于客厅木质边柜，旁有陶瓶花枝与碗' },
  { slug: 'niu', char: '牛', name: '甲骨文 · 牛', en: 'Ox', price: '¥199', blessing: '俯首甘为孺子牛', story: '一对弯角是甲骨文「牛」字最醒目的笔画。牛拉动农耕文明三千年，古文字里的「物」字就从牛而来——万物之「物」，本义是一头毛色纯正的牛。', image: '/assets/zodiac/zodiac-niu.jpg', alt: '甲骨文「牛」字书法摆件，藕粉云纹笺，黑胡桃木框装裱，陈设于展厅木案，旁有陶瓶花枝与深色陶碗' },
  { slug: 'hu', char: '虎', name: '甲骨文 · 虎', en: 'Tiger', price: '¥199', blessing: '虎啸风生', story: '甲骨文的「虎」张着巨口、遍体斑纹，威势扑面而来。先民画虎于门以驱邪祟——虎是山林之长，也是大人放在孩子枕边的勇气。', image: '/assets/zodiac/zodiac-hu.jpg', alt: '甲骨文「虎」字书法摆件，橘黄洒金笺，黑胡桃木框装裱，陈设于茶室木案，旁有黑陶茶壶与青瓷杯' },
  { slug: 'tu', char: '兔', name: '甲骨文 · 兔', en: 'Rabbit', price: '¥199', blessing: '赤兔呈瑞', story: '长耳、短尾、腾跃的身姿，甲骨文的「兔」一眼可辨。月宫捣药的玉兔是温柔的仙兽——「兔」与「瑞」相伴，愿你所求皆有回响。', image: '/assets/zodiac/zodiac-tu.jpg', alt: '甲骨文「兔」字书法摆件，豆绿暗纹笺，黑胡桃木框装裱，陈设于茶室原木长桌，旁有青瓷茶杯' },
  { slug: 'long', char: '龙', name: '甲骨文 · 龙', en: 'Dragon', price: '¥199', blessing: '飞龙在天', story: '顶着角冠、曲身昂首，甲骨文的「龙」是先民想象力的集大成：沟通天地、司掌风雨。十二生肖里唯一不存在于现实的神物，却活在每一个中国人的名字里。', image: '/assets/zodiac/zodiac-long.jpg', alt: '甲骨文「龙」字书法摆件，黄笺墨字，黑胡桃木框装裱，陈设于玄关端景木案，旁有铜鹤摆件与陶瓶' },
  { slug: 'she', char: '蛇', name: '甲骨文 · 蛇', en: 'Snake', price: '¥199', blessing: '金蛇献瑞', story: '蜿蜒的线条是「蛇」的本形——古文字里「它」字本义就是蛇，古人见面互问「无它乎」，便是「最近没遇上蛇吧」。蛇蜕皮新生，被称作小龙，是智慧与蜕变。', image: '/assets/zodiac/zodiac-she.jpg', alt: '甲骨文「蛇」字书法摆件，朱红暗纹笺，黑胡桃木框装裱，陈设于书房木案，旁有陶壶书册与青瓷杯' },
  { slug: 'ma', char: '马', name: '甲骨文 · 马', en: 'Horse', price: '¥199', blessing: '马到功成', story: '鬃毛飞扬、长尾奋蹄，甲骨文的「马」天生带着速度。《易》以乾卦配马，「天行健」的意象里始终有一匹奔跑的马——愿你不倦，一往无前。', image: '/assets/zodiac/zodiac-ma.jpg', alt: '甲骨文「马」字书法摆件，明黄笺墨字，黑胡桃木框装裱，陈设于茶室木案，旁有茶壶与青瓷茶杯' },
  { slug: 'yang', char: '羊', name: '甲骨文 · 羊', en: 'Goat', price: '¥199', blessing: '三羊开泰', story: '一对温顺的弯角，是甲骨文「羊」的全部温柔。古文字里「美」从羊、「善」从羊、「祥」从羊——先民把世间一切美好，都托付给了这个字。', image: '/assets/zodiac/zodiac-yang.jpg', alt: '甲骨文「羊」字书法摆件，金黄洒金笺，黑胡桃木框装裱，陈设于书房木案，旁有白瓷茶杯与石镇纸' },
  { slug: 'hou', char: '猴', name: '甲骨文 · 猴', en: 'Monkey', price: '¥199', blessing: '金猴献瑞', story: '灵长的手与目，在甲骨文里刻画得活灵活现。「猴」与「侯」相通，封侯进禄的期许都落在它身上——机敏、聪慧，自有主张。', image: '/assets/zodiac/zodiac-hou.jpg', alt: '甲骨文「猴」字书法摆件，朱红暗纹笺，黑胡桃木框装裱，陈设于书房书堆旁，旁有太湖石与毛笔' },
  { slug: 'ji', char: '鸡', name: '甲骨文 · 鸡', en: 'Rooster', price: '¥199', blessing: '雄鸡一唱天下白', story: '高冠长尾，甲骨文的「鸡」昂首如鸣。雄鸡司晨，风雨无改——「守信」二字，先民最早是从一只鸡身上读懂的。', image: '/assets/zodiac/zodiac-ji.jpg', alt: '甲骨文「鸡」字书法摆件，素白宣笺，黑胡桃木框装裱，陈设于书房木案，旁有书堆、笔洗与文房清供' },
  { slug: 'gou', char: '狗', name: '甲骨文 · 狗', en: 'Dog', price: '¥199', blessing: '犬守平安', story: '甲骨文的「狗（犬）」翘着尾巴、竖着耳朵，一副警觉的模样。犬是人类最古老的伙伴，守夜护院、不离不弃——它守的是家门，也是人心的安稳。', image: '/assets/zodiac/zodiac-gou.jpg', alt: '甲骨文「狗」字书法摆件，朱红暗纹笺，黑胡桃木框装裱，陈设于玄关木质边柜，旁有陶瓶花枝与石雕摆件' },
  { slug: 'zhu', char: '猪', name: '甲骨文 · 猪', en: 'Pig', price: '¥199', blessing: '诸事如意', story: '圆润丰腴的甲骨文「猪（豕）」。屋下有豕方为「家」——「家」字的宝盖头下，住的就是这头猪。富足、安定、烟火气，都从它开始。', image: '/assets/zodiac/zodiac-zhu.jpg', alt: '甲骨文「猪」字书法摆件，橘黄云纹笺，黑胡桃木框装裱，陈设于玄关木柜，旁有铜环摆件与方形铜盒' },
];

export type ReadyMadeWork = {
  slug: string;
  title: string;
  en: string;
  note: string;
  /** 心境与美意（2026-11-07 业主：释读之外，还要写出这件字落在人身上的意思） */
  mood?: string;
  image: string;
  alt: string;
  /**
   * 作品编码（七段式，2026-10-14 定版 v2.1）。
   *
   *   XMA - CL - WA - 26 - 0001 - T2 - 0
   *    ①    ②    ③    ④     ⑤     ⑥   ⑦
   *
   * ① 品牌固定 XMA ② 品类码 ③ 形态码 ④ 年份码（创作完成年份）
   * ⑤ 流水号（按「品类-形态-年份」独立编号）⑥ 档位码 ⑦ 校验位
   *
   * ⚠️ 三条铁律：
   *   1. 编码一旦发出**永不修改**——证书已印、台账已记、客户已知。
   *      改版就新发编码；同题材重写一幅也是新编码（新实物 = 新唯一件）。
   *   2. **校验位一律用 scripts/code-registry.mjs 实算**（`npm run code -- check`），
   *      不要手算，也不要凭印象填。
   *   3. 校验位是**防抄错**，不是防伪——防伪靠 /verify/ 档案页 + 实物证书。
   *
   * 详见 docs/作品编码与防伪查询方案.md
   */
  code: string;
  /** 创作完成年份。客户问「几几年的作品」的答案来源；与 code 第 ④ 段必须一致。 */
  year: number;
  /** 呈现形式：摆件（案头/柜上）或 挂墙（悬挂/嵌壁）。决定价格档位。 */
  form: '摆件' | '挂墙';
  /** 人民币价格（元），含装裱。摆件统一 199（禅 299），挂墙 399。 */
  price: number;
  /** 框体与木种，如「手写书法原作 · 榫卯结构柚木框」。
   *  框体统一为榫卯结构实木框（不用钉、不用胶），木种有柚木与胡桃木两种，胡桃木颜色更深。 */
  material?: string;
  /** 成品外框尺寸（宽 × 高，cm）。2026-10-06 由业主确认为按档位统一：
   *  摆件 21 × 29.7（A4）／圆光摆件《禅》50 × 50／挂墙 60 × 33。 */
  size?: { w: number; h: number };
  /** 装饰场景图：作品挂进真实空间的样子。优先于实拍图展示。 */
  sceneImage?: string;
  sceneAlt?: string;
  /** 已售出标记。现货每幅世间唯一，售出后不再上架；
   *  置 true 后列表页降级为「已售出」并弱化入口，详情页关闭购买引导。
   *
   *  ⚠️ 2026-10-08 起，售出状态改由后台维护：
   *  Keystatic「现货上下架」→ `content/ready-made-status/<slug>.yaml`，
   *  读取层见 `src/lib/ready-made.ts`（页面请用 getReadyMadeWorks()）。
   *  这里的字段只在**没有对应状态文件**时作为兜底，正常不要再手改。 */
  sold?: boolean;
  /**
   * 字源释读（2026-10-16 新增，配合首页「作品展示 · 一字一源」）。
   *
   * 文档要求作品页三层递进：① 这是什么 → ② 它可以为你做什么 → ③ 如果你想拥有它。
   * 本字段承载第 ① 层。**可选**：只写得起考据的作品才填，未填时详情页
   * 不会出现空白段落（渲染层做 `work.source && ...` 判断）。
   *
   * ⚠️ 考据必须可核验，不得为了页面好看而编造字形流变。业主已明确
   * 「先上线再核，我根据你上线后的内容提供专业的内容」——当前是简释版，
   * 页面会对外标注「待校订」，业主内容到位后覆盖本字段即可。
   */
  source?: {
    /** 主打字（一个汉字），详情页用作字形主视觉 */
    char: string;
    /** 字形出处：朝代 + 载体，如「汉瓦当」「商甲骨文」 */
    origin: string;
    /** 考据正文：这个字怎么来的、为什么写出来是这个样子 */
    note: string;
  };
  /**
   * 场景联想（2026-10-16 新增）。承载三层递进的第 ② 层：
   * 不描述规格，只描述「它可以为你做什么」——送给谁、放在哪、替你说了什么。
   * 可选，未填时详情页不渲染该块。
   */
  sceneFit?: string;
};

/**
 * 现货好礼 · 书法小品（2026-10-04 十二幅定版）
 * 已写完、装裱完成、可直接发货的在册作品，每幅世间唯一。
 * image 为作品场景图（public/assets/works/work-*.jpg，与桌面素材夹原图逐一对应）。
 * 同图换版必须换文件名（如 work-qing-huan-2.jpg）：Cloudflare 边缘会按 URL 缓存旧图。
 * 题字为从图辨认并经素材夹归属核对；note 一句释出处、一句说适合空间，与画面场景对应，上线前请主人复核一遍。
 * 尺寸与纸墨细节不写在页面上，随作品档案在咨询时提供；价格已公开（form/price 字段）。
 */
// ── 字游记 · 第二辑：甲骨文集（2026-11-07 业主定档）──────────────────
// 与「第一辑 · 甲骨文十二生肖」同级别的系列合集：A4 框、¥199（业主指定）。
// 版式：樂藝 / 集福 / 玄鸟 为 A4 竖幅；天干地支 / 酌酒 为 A4 横幅（横竖以实拍为准）。
// 题字均从图逐件辨认核对（skill §12 流程）；故事文案按「实物题字」撰写。
export type OracleWork = {
  slug: string;
  name: string;
  en: string;
  glyphs: string;
  tagline: string;
  orientation: '竖幅' | '横幅';
  price: string;
  story: string;
  image: string;
  alt: string;
};

export const oracleWorks: OracleWork[] = [
  { slug: 'le-yi', name: '甲骨文 · 乐艺', en: 'Joy of Craft', glyphs: '樂 · 藝', tagline: '六艺之乐，先从手上开始', orientation: '竖幅', price: '¥199',
    story: '甲骨文的「樂」上为两束丝、下为木——弦张于木，是琴瑟的雏形；「藝（埶）」像人跪坐种苗——技能的本义是亲手栽种。跋文题「君子六藝」，古人把礼乐射御书数叫六艺，每一艺都要从手上练起。挂在书房或工作室，提醒自己：一切热爱，皆从笨功夫开始。',
    image: '/assets/oracle/le-yi.jpg', alt: '甲骨文「樂藝」二字书法摆件，黑胡桃木框 A4 竖幅，陈设于客厅边柜，旁有盆景与书籍' },
  { slug: 'ji-fu', name: '甲骨文 · 集福', en: 'Gathering Blessings', glyphs: '集 · 福', tagline: '鸟落于木，福聚于家', orientation: '竖幅', price: '¥199',
    story: '甲骨文的「集」是短尾鸟落在树上——本义就是群鸟栖木；「福」像双手捧酒尊灌祭于神主之前——以最郑重的方式祈求庇佑。二字连读：福气如鸟，聚于一木。跋文题「甲骨文字 集福」，是乔迁、开业都拿得出手的老吉语。',
    image: '/assets/oracle/ji-fu.jpg', alt: '甲骨文「集福」二字书法摆件，黑胡桃木框 A4 竖幅，陈设于书房桌面，旁有笔架与线装书' },
  { slug: 'tian-gan-di-zhi', name: '甲骨文 · 天干地支', en: 'Heavenly Stems & Earthly Branches', glyphs: '天干 · 地支', tagline: '岁月有历，起居有常', orientation: '横幅', price: '¥199',
    story: '商人最了不起的发明之一，是把日子编成了序号：十个天干配十二地支，六十甲子循环不息——甲骨文里大量卜辞正是干支记日。跋文题「龜甲獸骨 天干地支」，画面撷取干支古字，人形负日、草木萌土，是三千年前的日历，也是今天的生活秩序。适合挂在玄关或茶室，见字如见岁月。',
    image: '/assets/oracle/tian-gan-di-zhi.jpg', alt: '甲骨文干支古字书法摆件，黑胡桃木框 A4 横幅，陈设于文创空间展柜，旁有汉字之美书籍' },
  { slug: 'xuan-niao', name: '甲骨文 · 玄鸟', en: 'Black Bird of Shang', glyphs: '玄 · 鳥', tagline: '天命玄鸟，降而生商', orientation: '竖幅', price: '¥199',
    story: '《诗经·商颂》唱道：「天命玄鸟，降而生商。」商人相信自己的祖先诞生于一只黑色的燕鸟。画中甲骨文的「玄」是两束相对的丝，鸟形大字昂首挺胸、羽冠如旌——跋文题「殷墟契文 玄鳥作商」，把一段创世神话收进一只木框。适合送给属蛇、属鸡的朋友（鸟为羽族之长），或作为新生命降临的纪念。',
    image: '/assets/oracle/xuan-niao.jpg', alt: '甲骨文「玄鸟」书法摆件，黑胡桃木框 A4 竖幅，陈设于文创展台，旁有「殷墟契文 鸟」标示牌' },
  { slug: 'zhuo-jiu', name: '甲骨文 · 酌酒', en: 'Pouring Wine', glyphs: '酌', tagline: '且酌且歌，人间有味', orientation: '横幅', price: '¥199',
    story: '甲骨文的「酉」是一只尖底酒尊，坛口网纹历历；旁有人俯身探臂，正往坛中取酒，点点酒滴欲坠。隶书题「酌酒」二字，画的是三千年前的一场小酌。李白说「举杯邀明月」，苏东坡说「一尊还酹江月」——中国人的一切诗意，都少不了一酌。挂在餐边柜或茶室，待客时正好讲个典故。',
    image: '/assets/oracle/zhuo-jiu.jpg', alt: '甲骨文「酌酒」人形执器书法摆件，黑胡桃木框 A4 横幅，陈设于茶室柜面，旁有紫砂壶与茶杯' },
];

export const readyMadeWorks: ReadyMadeWork[] = [
  { slug: 'qing-huan', title: '清欢', en: 'Quiet Joy', code: 'XMA-CL-WA-26-0001-T2-0', year: 2026, note: '「人间有味是清欢」，苏轼写给寻常日子的七个字。不浓烈，却留得住——适合茶席、餐桌旁，或任何一个想慢下来的墙角。', material: '赭底宣纸 · 白色卡衬 · 榫卯结构柚木框', form: '挂墙', price: 399, size: { w: 60, h: 33 }, image: '/assets/works/work-qing-huan-2.jpg', alt: '赭底白卡柚木框书法小品《清欢》挂在墙上的空间实景，旁有青瓷瓶、座钟与书册',
    source: { char: '歡', origin: '商周金文', note: '「欢」的繁体作「歡」，从雚从欠：左旁「雚」是一种水鸟，右旁「欠」象人张口出气。古人以鸟鸣开口之形，记下欢愉这件事——原来「开心」这个意思，一开始是从声音里来的。' },
    mood: '不浓烈，也不冷清——是忙完之后，愿意替自己泡一壶水的那种松。',
    sceneFit: '茶席旁、餐桌边，或任何一个想慢下来的墙角。它不劝你热闹，只提醒你——寻常日子本身就值得被写下来。' },
  { slug: 'de-xin-ya-ju', title: '德馨雅居', en: 'Virtue Graces the Home', code: 'XMA-CL-WA-26-0002-T2-3', year: 2026, note: '「斯是陋室，惟吾德馨」——屋子不在大小，住的人自有雅气。适合客厅大墙，也适合乔迁与开业。', material: '手写书法原作 · 榫卯结构胡桃木框', form: '挂墙', price: 399, size: { w: 60, h: 33 }, image: '/assets/works/work-de-xin-ya-ju.jpg', alt: '书法横批《德馨雅居》挂在客厅大墙上，下方是茶台、皮沙发与圆几',
    source: { char: '馨', origin: '秦篆（《说文》）', note: '「馨」从香从殸省，本义是香气传得远。《说文》释为「香之远闻者」——古人用一个字记下「好东西会自己飘出去」这件事，所以「德馨」说的是：住的人对了，屋子自然有味道。' },
    mood: '屋子不必大，住的人对了，四壁自会有香气。',
    sceneFit: '客厅大墙、进门正对的那面墙。乔迁、开业、或者只是你终于把家安顿好了——这四个字替主人说话，不必开口。' },
  { slug: 'shang-hua-pin-ming', title: '赏花品茗', en: 'Flowers & Tea', code: 'XMA-CL-SG-26-0001-T1-8', year: 2026, note: '赏花品茗，四时清课。瓶花与茶席之间，把日子过成自己的样子。适合茶室与餐边柜，也适合爱花爱茶的人。', material: '手写书法原作 · 榫卯结构柚木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-shang-hua-pin-ming.jpg', alt: '书法横批《赏花品茗》立在木质边柜上，旁有瓶花与盖碗茶席',
    source: { char: '茗', origin: '汉魏字书', note: '「茗」从艸从名，指晚采的茶。郭璞注《尔雅》：「今呼早采者为荼，晚取者为茗。」《说文》未收此字，较早见于汉魏文献。后来「茗」成了茶的雅称——一个字从采茶的时节，慢慢长成了整杯茶的体面。' },
    mood: '把日子过成四时清课：有花可赏，有茶可待，有人可等。',
    sceneFit: '茶室、餐边柜、阳台一角的茶席。送给爱花爱茶的人，或者送给那个终于愿意给自己泡一壶茶的人。' },
  { slug: 'nan-xi-xin-ji', title: '南谿新霁', en: 'Clearing Over the South Stream', code: 'XMA-CL-FA-26-0001-T1-4', year: 2026, note: '「南谿新霁」——雨过天晴，山清水净。四个字落在洒金扇面上，把雨停之后那一刻的清朗留在案头，适合茶席与书房。', material: '洒金扇面 · 榫卯结构胡桃木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/nan-xi-xin-ji-wide.jpg', alt: '胡桃木框洒金扇面书法小品《南谿新霁》陈设于条案上，旁有太湖石与青瓷瓶梅枝，暖光斜入',
    source: { char: '霁', origin: '秦篆', note: '「霁」从雨从齐，本义是雨停。《说文》释为「雨止也」，从「齐」得声兼取意——雨脚齐了，便是天要放晴。这个字只属于那一小段时间：雨刚停、水汽还悬着、光刚刚透进来。' },
    mood: '雨刚停、水汽还悬着的那一刻——心里那件事，也刚刚过去。',
    sceneFit: '茶席、书房案头。它写的是雨后那一刻，也可以是你心里那件事刚刚过去的那一刻。' },
  { slug: 'chan', title: '福', en: 'Blessing', code: 'XMA-CL-SC-26-0001-T1-4', year: 2026, note: '一笔落下，满室生春——「福」字是中国人最朴素的祝祷，也是最能压住场面的单字堂幅。', material: '圆光小品 · 榫卯结构胡桃木框', form: '摆件', price: 299, size: { w: 50, h: 50 }, image: '/assets/works/work-chan.jpg', alt: '圆光书法小品《福》立在玄关石面上，旁有玉兰花枝与暖灯',
    source: { char: '福', origin: '秦篆', note: '「福」从示从畐，「示」为神主，「畐」像酒器满溢之形，本义是以酒醴祭神、祈神降佑。甲骨文中已多见，是祭祀文化里最早的祝福字之一。' },
    mood: '不求繁复，但求安稳。福不是远方的宏愿，是眼下有饭吃、有灯亮、有人等——把这份踏实写进字里，挂起来，日子就有了方向。',
    sceneFit: '新春门楣、乔迁玄关、厅堂正中、茶室主墙；也适合作为开业贺礼、长辈寿礼、新居入伙礼。' },
  { slug: 'mo-jian-hu-yin', title: '莫见乎隐', en: 'Seen Even When Alone', code: 'XMA-CL-WA-26-0003-T2-6', year: 2026, note: '「莫见乎隐，莫显乎微」——《中庸》讲慎独：越是没人看见的地方，越看得见一个人。适合书房，也适合留给自己的角落。', material: '手写书法立轴 · 榫卯结构胡桃木框', form: '挂墙', price: 399, size: { w: 60, h: 33 }, image: '/assets/works/work-mo-jian-hu-yin.jpg', alt: '书法立轴《莫见乎隐·莫显乎微》嵌在拱形壁龛里，下方石台上有陶瓶与蒲苇',
    source: { char: '隱', origin: '秦篆', note: '「隐」的繁体作「隱」，从阜从㥯：左旁「阜」是土山，右旁取其声兼意。本义是「藏在山后」——先秦的人用山的遮挡来理解「看不见」这件事，所以「隐」从来不是消失，只是被挡住了。' },
    mood: '没人看见的时候，才见一个人的分寸。',
    sceneFit: '书房、留给自己的那个角落。它不写给客人看，写给深夜还醒着的你。' },
  { slug: 'guan-zi-zai', title: '观自在', en: 'At Ease, As You Are', code: 'XMA-CL-SG-26-0002-T1-1', year: 2026, note: '「观自在菩萨」，心经开篇三字。自在不在远处，就在抬眼可见的地方——适合书房与玄关。', material: '手写书法原作 · 榫卯结构胡桃木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-guan-zi-zai.jpg', alt: '书法横批《观自在》摆在中式木案上，旁有石盆、瘦枝与笔架',
    source: { char: '心', origin: '秦篆', note: '「心」在秦篆里还是一个能看出心脏形状的象形字，《说文》释为「人心，土藏，在身之中」。到隶书时它才被压成今天的样子——字变了，「心」这个意思却一直没变。观自在的「自」，指的就是这颗心。' },
    mood: '抬眼看见自己，比被别人看见要紧。',
    sceneFit: '书房案头、玄关。它不劝你放下什么，只提醒你——先看见自己，再谈其他。' },
  { slug: 'yi-hu-yi-xi', title: '一呼一吸', en: 'One Breath, Then Another', code: 'XMA-CL-SG-26-0003-T1-4', year: 2026, note: '一呼一吸之间，日子有了自己的节奏。适合卧室床头、书桌旁，也适合送给总在赶时间的人。', material: '手写书法原作 · 榫卯结构柚木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-yi-hu-yi-xi.jpg', alt: '书法小品《一呼一吸》立在卧室边柜上，旁有台灯与柿子果盘',
    source: { char: '息', origin: '商甲骨文', note: '「息」从自从心：「自」在甲骨文里就是鼻子的形状，古人以为气从鼻出，所以「息」的本义是呼吸。《说文》释「喘也」。一个由「鼻子」和「心」组成的字——呼吸这件事，从一开始就被当作心的事。' },
    mood: '一呼一吸之间，心就回来了。',
    sceneFit: '卧室床头、书桌一角。送给总在赶时间的人，或者送给你自己——一呼一吸，你还在。' },
  { slug: 'chang-le', title: '长乐', en: 'Everlasting Joy', code: 'XMA-CL-WA-26-0004-T2-9', year: 2026, note: '取意汉瓦「长乐未央」，两个字，是古人最绵长的祝愿。适合书房与日常抬眼可见的地方。', material: '手写书法立轴 · 榫卯结构胡桃木框', form: '挂墙', price: 399, size: { w: 60, h: 33 }, image: '/assets/works/work-chang-le.jpg', alt: '书法立轴《长乐》挂在深木色书房书架间，案上有绿植、笔砚与台灯',
    source: { char: '樂', origin: '汉瓦当', note: '「长乐未央」是汉代瓦当上最常见的吉语之一，汉长乐宫的瓦头至今还留着这四个字。「乐」的初形是木上系丝弦——古人先有乐器，才从乐音里说出「快乐」。所以「长乐」的意思不只是长久高兴，是长久地、像音乐一样地过着。' },
    mood: '长久的快乐不喧哗，像一段一直在响的琴音。',
    sceneFit: '书房、抬眼可见的地方。不要热烈，只要绵长——这是两个字能给出的最长承诺。' },
  { slug: 'duan-she-li', title: '断舍离', en: 'Less, Then Light', code: 'XMA-CL-SG-26-0004-T1-7', year: 2026, note: '三个字，写给正在做减法的人与家。适合卧室、玄关，也适合送给刚刚搬完家的朋友。', material: '手写书法原作 · 榫卯结构柚木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-duan-she-li-2.jpg', alt: '书法小品《断舍离》立在卧室柜上，旁有台灯、书册与瓶枝',
    source: { char: '捨', origin: '秦篆', note: '「舍」的繁体作「捨」，从手从舍：提手旁是「放手」这个动作，右旁「舍」是房舍。本义是「放下手里的东西」。有意思的是，「舍」本身也指住所——同一个字，既是「放掉」，也是「安顿」。' },
    mood: '放下的手，也是收回来的手；舍掉一些，屋子才装得下自己。',
    sceneFit: '卧室、玄关、刚整理完的那个柜子前。送给刚搬完家的朋友，或者送给正打算重新开始的自己。' },
  { slug: 'mao-fei-jia-run', title: '猫肥家润', en: 'Fat Cat, Flourishing Home', code: 'XMA-CL-SG-26-0005-T1-0', year: 2026, note: '猫肥家润，花繁人安。把最有烟火气的幸福写进家里——适合客厅，也适合养猫的人家。', material: '手写书法原作 · 榫卯结构柚木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-mao-fei-jia-run.jpg', alt: '书法横批《猫肥家润》摆在客厅木几上，背景是沙发、抱枕与绿植',
    source: { char: '猫', origin: '秦篆（《说文》）', note: '「猫」从豸从苗：左旁「豸」在古文字里是长脊兽的象形，右旁「苗」是它的声音。从「苗」得声不是巧合——鼠害吃苗，所以猫因护苗而得名。这个字把「猫的用处」写进了它的样子里。' },
    mood: '猫肥、粮足、灯亮着——好日子不过如此。',
    sceneFit: '客厅、猫窝旁边、家里的木几上。最没架子的一幅字——它记的不是理想生活，是有人在家。' },
  { slug: 'xiang-jian-yi-wu-shi', title: '相见亦无事', en: 'Nothing Much, Just to See You', code: 'XMA-CL-SG-26-0006-T1-3', year: 2026, note: '「相见亦无事，不来忽忆君」，写给不必寒暄的老朋友。适合客厅与茶席，也适合做乔迁与重逢的礼。', material: '白底红卡 · 榫卯结构胡桃木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-xiang-jian-yi-wu-shi.jpg', alt: '白底红卡黑框书法小品《相见亦无事》立在暖光卧室的木柜上，旁有台灯与书册',
    source: { char: '見', origin: '商甲骨文', note: '「见」的初形是一个人跪坐着、头上顶着一只放大的眼睛——甲骨文里「目」被刻意画得很大。古人用「突出眼睛」表示「看见」，因为看这件事，本来就不只是眼睛的事。' },
    mood: '最好的关系，是不必有事才相见。',
    sceneFit: '客厅、茶席、老友常坐的那个位置。送给不必寒暄的人——不用说什么，来就好。' },
];

export const channelPages = [
  { slug: 'xiaohongshu-housewarming', title: '小红书｜乔迁礼物选礼指南', campaign: 'housewarming-gift', intro: '为新居准备一份不喧哗的礼。', ctaLabel: '查看乔迁小民好礼', ctaUrl: '/occasions/housewarming/' },
  { slug: 'xiaohongshu-teacher-gift', title: '小红书｜谢师礼怎么选', campaign: 'teacher-thanks-gift', intro: '把感谢写下来，送给曾经照亮你的人。', ctaLabel: '查看谢师礼方向', ctaUrl: '/occasions/teacher-thanks/' },
];

export const blogPosts = [
  { slug: 'why-commission', title: '为什么从定制开始，而不是从现货开始？', en: 'Why begin with commission, not inventory?', pillar: '方法 / Method', date: '阅读时间 4 min', excerpt: '艺术的价值不只在于被看见，也在于它如何回应一个具体的人、一个空间和一段关系。' },
  { slug: 'meaning-before-form', title: '在形式之前，先问这件作品要留下什么', en: 'Before form, ask what should remain', pillar: '通感笔记 / Notes', date: '阅读时间 5 min', excerpt: '定制不是把名字印上去，而是从意义出发，选择合适的尺度、气息与材料。' },
  { slug: 'quiet-art-gifts', title: '一份不急着被拆开的艺术礼物', en: 'An art gift that does not rush to be opened', pillar: '礼赠 / Gifts', date: '阅读时间 3 min', excerpt: '礼物可以拥有更长的时间：从共同取意开始，直到它在对方的日常里找到位置。' },
];

export const work = { slug: 'seasonal-blessing', title: '四季福愿 · 心事成字', en: 'Seasonal Blessing · Your Story in Original Calligraphy', summary: '这是一个可继续讨论的定制方向，不是现货商品。我们从你的场景、关系与一句话开始，共同确认创作方向，再谈形式、尺寸与交付时间。', status: 'concept', delivery: 'commission', isConceptVisual: true };

export const blessings = [
  { slug: 'fu', title: '福', pinyin: 'Fú', en: 'A sense of wholeness', meaning: '关于安稳、圆满与被好好接住。', scene: '适合家庭、乔迁与想为日常留一笔的时刻。' },
  { slug: 'lu', title: '禄', pinyin: 'Lù', en: 'Purpose & practice', meaning: '关于所做之事、学业与职业方向。', scene: '适合为长期努力、事业与学习寻找一份视觉表达。' },
  { slug: 'shou', title: '寿', pinyin: 'Shòu', en: 'A long horizon', meaning: '对时间、陪伴与日常安康的温和祝愿。', scene: '适合长辈、生日与值得慢慢过的日子。' },
  { slug: 'xi', title: '喜', pinyin: 'Xǐ', en: 'A shared joy', meaning: '把值得庆祝的相逢、好消息写下来。', scene: '适合新居、纪念时刻与重要相逢。' },
  { slug: 'cai', title: '财', pinyin: 'Cái', en: 'A life in abundance', meaning: '关于丰足、流动与把日子经营好的心愿。', scene: '适合开业、乔迁与为生活添一份笃定。' },
];

/**
 * 四季节气。
 *
 * `desc` 是 meta description 专用字段（2026-10-28 全站审计后补）。
 * 此前页面模板里写死了 `${name}季内容与祝愿入口。` —— 固定 10 个字，
 * 是站内最短的描述，搜索结果里等于没有摘要。现改为内容侧给文案、模板只读。
 * 长度目标 65–80 字（中文摘要显示上限约 75–80 字）。
 */
export const seasons = [
  {
    slug: 'spring', name: '春', line: '春生福', note: '万物开始有了方向。',
    desc: '春生福：写给新一年的开端，也写给正在起步的事。手写书法小品，取甲骨、青铜或碑刻里的「福」字，装裱完成即可挂起，¥300 起，可定制题字。',
  },
  {
    slug: 'summer', name: '夏', line: '夏纳喜', note: '把好消息留在手边。',
    desc: '夏纳喜：把这个季节的好消息留在手边。手写书法小品，一字一意，黑胡桃实木装裱，随附释读一页，现货直发或按你的故事重写，¥300 起。',
  },
  {
    slug: 'autumn', name: '秋', line: '秋守财', note: '收拢一年的丰足。',
    desc: '秋守财：收拢一年的丰足，也为来年留个念想。手写书法小品与书房挂字，取古文字本义，装裱后可直接悬挂，¥300 起，支持按场景定制。',
  },
  {
    slug: 'winter', name: '冬', line: '冬安寿', note: '在安静里照看日常。',
    desc: '冬安寿：在安静里照看日常，送给长辈最贴切。手写书法小品，一字一祝愿，含实木装裱与释读页，¥300 起，可按对象与场合定制题字。',
  },
];

export const faqs = [
  ['手写现货和艺术共创定制有什么区别？ / What is the difference between ready-made works and commissions?', '手写现货是已经写好的作品，一物一件，可以直接选购、看中即发；艺术共创定制则从你的故事、空间与想法出发重新讨论，每件作品都为这一次的委托而写。灵感画廊中的案例仅作方向参考，不作为标准款式售卖；企业批量礼赠另有单独的方案与起订量，可在企业礼赠方向沟通。 / Ready-made works are already written and one of a kind, available directly; commissions are shaped around your story, space and intention, written for that request alone. Gallery cases are references only and are not sold as standard models; corporate gifting follows a separate scheme with its own minimum order, discussed under corporate gifts.'],
  ['哪些需求可以定制，哪些暂不承接？ / What can you commission?', '可承接纸本水墨、综合材料作品、小型艺术器物、居家墙面定制、企业空间艺术与艺术礼赠；暂不承接纯照片临摹复刻、侵权 IP 主题、极低预算大型装置等。 / We can discuss ink on paper, mixed-media works, small art objects, home-wall commissions, corporate spaces and art gifts; we do not take direct photo replicas, infringing IP themes or large installations with extremely limited budgets.'],
  ['价格范围是多少？ / What budget range should I expect?', '预算参考为：小幅礼赠 ¥100–¥300；居家中型墙面作品 ¥300–¥800；器物类定制 ¥800–¥2,000；商业空间大型装置需单独评估。价格会受尺寸、媒介、复杂度、装裱与物流影响。 / Reference ranges are ¥100–¥300 for small gifts, ¥300–¥800 for medium home-wall works, and ¥800–¥2,000 for object commissions; large commercial installations require a separate assessment. Size, medium, complexity, framing and logistics affect the final scope.'],
  ['从咨询到交付需要多久？ / How long does a commission take?', '时间取决于主题、媒介、艺术家档期、确认节点与交付方式。提交简报后，我们会在适合进入下一次沟通时说明可讨论的时间范围。 / Timing depends on subject, medium, artist availability, approval points and delivery. After receiving a brief, we will explain the workable range for the next conversation.'],
  ['定制可以加急吗？ / Can a commission be expedited?', '部分小幅礼赠项目支持加急，可能产生额外创作费用；大型空间项目通常无法加急，建议提前沟通时间可行性。 / Some small gift commissions may be expedited with an additional creative fee; large spatial projects generally cannot be expedited. Please discuss timing early.'],
  ['可以修改几次？ / How many revisions are included?', '修改节点与范围会在项目方案中提前说明。初步咨询不承诺固定次数，具体安排会根据创作方式与项目边界共同确认。 / Revision points and scope are explained in the project brief. The initial consultation does not promise a fixed number; arrangements are agreed according to the creative method and project scope.'],
  ['定金与退款政策如何约定？ / How are deposits and refunds handled?', '是否需要定金、付款节点与取消约定，会在双方确认项目范围后书面说明；初步咨询阶段无需付款。 / Any deposit, payment milestones and cancellation terms are documented after the project scope is agreed. No payment is required for the initial consultation.'],
  ['作品如何运输、包装？海外是否可交付？ / How are works packed and delivered?', '作品本体为基础交付内容；装裱、特殊包装与物流为可选增值项，报价时单独列明。国内采用专业艺术品包装运输，海外交付可评估物流方案。 / The work itself is the base delivery. Framing, special packing and logistics are optional additions listed separately; overseas delivery can be assessed case by case.'],
  ['作品版权归谁？ / Who owns the copyright?', '艺术家保留作品著作权；客户拥有作品实物所有权。如需商用版权授权，需要单独约定。 / The artist retains copyright while the client owns the physical work. Commercial copyright licensing requires a separate agreement.'],
  ['不懂艺术也可以定制吗？ / Can I commission without an art background?', '可以。你只需带来一个人、一处空间、一句话或想留下的情绪，我们会协助梳理方向。 / Yes. Bring a person, a space, a sentence or a feeling you want to preserve, and we will help shape the direction.'],
];
