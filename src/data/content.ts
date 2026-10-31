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
export const navItems = [
  {
    href: '/zodiac/', zh: '一字一源', en: 'One Character', children: [
      { href: '/zodiac/', zh: '字游记', en: 'Character Journal' },
      { href: '/notes/', zh: '创作笔记', en: 'Studio Notes' },
    ],
  },
  { href: '/gifts/', zh: '小民好礼', en: 'Xiaomin Gifts' },
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
//   生肖系列 A4 竖幅（21 × 29.7 cm，画芯 16×8）→ 业主 2026-10-17 裁决：同样 ¥300–500
// 新作品若为以上两种尺寸之一，价格默认取 ¥300–500，无需再确认；
// 其他尺寸（42×22、45×45、160×55 等）价格另定，不套用本条。
export const giftProducts: GiftProduct[] = [
  { slug: 'quiet-entry-gift', name: '静入 · 书房小礼', en: 'A Quiet Entrance · Study Gift', scene: 'housewarming', sceneLabel: '乔迁之喜', tier: 'entry', price: '¥100–300', meaning: '以一处留白，为新居留住第一份安静。', recipient: '适合送给刚搬入新家的朋友、同事或长辈。', dispatch: '预计确认后 7–10 个工作日发出', packaging: '含基础礼盒与手写贺卡选项', visual: '静入', image: '/assets/scenes/study-desk-scroll.jpg' },
  { slug: 'cinnabar-note-gift', name: '一点朱砂 · 生日心意', en: 'A Cinnabar Note · Birthday Gift', scene: 'birthday', sceneLabel: '生日心意', tier: 'thoughtful', price: '¥300–500', meaning: '朱砂作底，古字为凭——像那幅「欢喜」，把值得庆祝的事郑重地讲出来。', recipient: '适合送给朋友、伴侣或希望认真表达感谢的人。', dispatch: '预计确认后 7–10 个工作日发出', packaging: '含礼盒包装、祝福卡和贺卡文字预览', visual: '朱', image: '/assets/scenes/theme-cinnabar.jpg',
    gallery: [
      { src: '/assets/scenes/cinnabar-bedroom.jpg', alt: '古文字「欢喜」书法小品，赭色卡纸装裱，陈设于卧室边柜，旁有暖光台灯与郁金香', caption: '装裱形式一 · 卧室边柜｜赭卡暖调，夜灯下的「欢喜」' },
      { src: '/assets/scenes/cinnabar-tea.jpg', alt: '古文字「欢喜」书法小品，白底黑框装裱，陈设于茶席边柜，旁有兰花与白瓷茶壶', caption: '装裱形式二 · 茶席一角｜白卡黑框，与茶器为伴' },
      { src: '/assets/scenes/cinnabar-study.jpg', alt: '古文字「欢喜」书法小品，白底黑框装裱，陈设于书房案头，旁有砚台与菖蒲盆栽', caption: '装裱形式三 · 书房案头｜与砚台、笔洗同框' },
    ],
    deepDive: [
      {
        eyebrow: 'Chapter 01 / 释读', heading: '书法文字提取与释读', intro: '把「生日快乐」写小众一点，也写得更有出处。', paragraphs: [
          '主文以古文字书写「欢喜」二字：「欢」从欠，取人因喜而气自舒展之形；「喜」从壴从口，象鼓乐置于口旁——古人闻乐而笑，喜意自见。二字皆有金文、古文字出处，不做美术化拼贴。',
          '跋文以行书小字题写祝辞，落款纪年，钤名章与闲章各一。给谁过生日、因为什么欢喜，这几句话写在跋文里，作品就只属于这一个人。',
          '每件作品随附释读说明一页，逐字注明字形来源与跋文全文——收礼的人即使不认识古文字，也能读明白这幅字为什么是「欢喜」。'] },
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
  { slug: 'seasonal-letter-gift', name: '四季流转 · 节日问候', en: 'A Letter for the Season · Festival Gift', scene: 'festival', sceneLabel: '节日问候', tier: 'thoughtful', price: '¥300–500', meaning: '岁有寒暑，月有圆缺——从一个节气、一句问候开始，把四季的流转写成一幅字。', recipient: '适合节日送长辈、朋友或重要合作伙伴。', dispatch: '预计确认后 10–14 个工作日发出', packaging: '含节日主题包装与手写贺卡选项', visual: '笺', image: '/assets/scenes/theme-four-seasons.jpg',
    gallery: [
      { src: '/assets/scenes/four-seasons-study.jpg', alt: '古文字「春夏秋冬」书法小品，极窄黑胡桃细框，摆在书房案头，旁有青苔盆景与砚台', caption: '装裱形式一 · 书房案头｜黑胡桃细框，与砚台笔山为伴' },
      { src: '/assets/scenes/four-seasons-tea.jpg', alt: '古文字「春夏秋冬」书法小品，朱红卡纸装裱，陈设于茶室长案，旁有铁壶与炭炉', caption: '装裱形式二 · 茶室长案｜朱红卡裱，茶席视觉重心' },
      { src: '/assets/scenes/four-seasons-cabinet.jpg', alt: '古文字「春夏秋冬」书法小品，朱砂红底装裱，陈设于玄关边柜，旁有干枝红果与灯', caption: '装裱形式三 · 玄关边柜｜朱砂红底，进门第一眼' },
    ],
    deepDive: [
      {
        eyebrow: 'Chapter 01 / 释读', heading: '书法文字提取与释读', intro: '每一幅作品出发前，先过文字这一关。', paragraphs: [
          '主文以古文字书写「春夏秋冬」四字：春如草木初生、枝蔓低垂；夏取草木繁盛之形；秋从禾谷与时机中来；冬似丝缕收束、垂以记寒。四字依季节次序排开，字形皆有古文字出处，不做美术化的拼贴与变形。',
          '跋文以行书小字录宋代无门慧开禅师诗偈：「春有百花秋有月，夏有凉风冬有雪；若无闲事挂心头，便是人间好时节。」主文写四季之形，跋文写四季之心，一件作品，两层意思。',
          '落款纪年，钤名章一方。每件作品随附释读说明一页，逐字注明字形来源与跋文出处——收礼的人不需要懂古文字，也能看明白它写了什么、从哪里来。'] },
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
  { slug: 'qin-se-he-ming-gift', name: '琴瑟和鸣 · 婚庆纪念', en: 'In Harmony · Wedding Gift', scene: 'anniversary', sceneLabel: '婚庆纪念', tier: 'thoughtful', price: '¥300–500', meaning: '琴瑟在御，莫不静好——把两个人的名字与祝愿写成一幅，愿此后岁岁年年。', recipient: '适合送给订婚、新婚的伴侣，或作为结婚周年纪念。', dispatch: '预计确认后 7–10 个工作日发出', packaging: '含礼盒包装、祝福卡和贺卡文字预览', visual: '瑟', image: '/assets/scenes/theme-wedding-qin-se-he-ming.jpg',
    gallery: [
      { src: '/assets/scenes/theme-wedding-qin-se-he-ming.jpg', alt: '朱砂红底「琴瑟和鸣」古文字书法横幅，黑胡桃木框装裱，陈设于卧室边柜，旁有白瓷瓶红果与中式卧房', caption: '装裱形式一 · 卧室边柜｜朱砂红底，与喜色卧房同调' },
      { src: '/assets/scenes/theme-wedding-calligraphy-lantern.jpg', alt: '白底古文字书法横幅，陈设于柚木边柜，旁有暖光纸灯笼与蕨类绿植', caption: '装裱形式二 · 玄关边柜｜白底墨字，与灯笼暖光相伴' },
    ],
    deepDive: [
      {
        eyebrow: 'Chapter 01 / 释读', heading: '书法文字提取与释读', intro: '先讲清楚这四个字：为什么是「琴瑟和鸣」。', paragraphs: [
          '主文以古文字书写「琴瑟和鸣」四字：「琴」「瑟」皆为丝乐器之形，象木上有弦；「和」从龢，象竹管编连、乐声相应；「鸣」从鸟从口，取声出于口之意。四字皆有古文字出处，不做美术化的拼贴与变形。',
          '语出《诗经·小雅·常棣》：「妻子好合，如鼓瑟琴。」后世以「琴瑟和鸣」祝夫妇情笃、声气相投——两件乐器各自成声，合奏方为和鸣，正是两个人过日子的样子。',
          '跋文以行书小字题写祝辞，落款纪年，钤名章与闲章各一。写给谁、因什么喜事而写，这几句话写在跋文里，作品就只属于这两个人。每件作品随附释读说明一页，逐字注明字形来源与跋文全文。'] },
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
  { slug: 'desk-mountain-keepsake', name: '案上有山 · 雅致贺礼', en: 'A Mountain on the Desk · Keepsake', scene: 'opening', sceneLabel: '开业贺礼', tier: 'keepsake', price: '¥800 以上', meaning: '书房之内，自有山河——大境之气，亦有大静之气。把稳重、开阔与持续生长的祝愿，安放进日常的空间。', recipient: '适合开业、晋升、周年等需要郑重表达的时刻。', dispatch: '预计确认后 14–21 个工作日发出', packaging: '含珍藏礼盒、包装升级与贺卡文字预览', visual: '山', image: '/assets/scenes/theme-desk-mountain.jpg',
    gallery: [
      { src: '/assets/scenes/desk-mountain-dining.jpg', alt: '古文字通景长卷挂于餐厅上方，下方为原木长餐桌与陶器干花', caption: '横幅长卷 · 餐厅上墙｜贺辞与一日三餐相对，日子越过越实' },
      { src: '/assets/scenes/desk-mountain-panels.jpg', alt: '四条屏书法通景挂于客厅主墙，下方为矮柜与松树盆景，沙发茶几成组', caption: '四条屏通景 · 客厅主墙｜一整面墙的开阔气象' },
      { src: '/assets/scenes/desk-mountain-living.jpg', alt: '古文字横幅挂于客厅沙发上方，落地窗竹影与蒲团坐榻成组', caption: '横幅 · 客厅主墙｜与落地窗竹影同框，静而不喧' },
    ],
    deepDive: [
      {
        eyebrow: 'Chapter 01 / 释读', heading: '书法文字提取与释读', intro: '贺辞先行：开业、晋升、周年，各有各的说法。', paragraphs: [
          '长卷以古文字集铭文书就：大字一列贯通全卷，小字跋文一行收在下方，落款纪年、钤印收尾。大字取青铜铭文气象，字字有出处，通卷读来如山势绵延——这是「案上有山」名字的由来。',
          '写给企业与开业场合的内容，从一句站得住的祝辞开始：「基业如山」「日新其业」「山不让尘，川不辞盈」。文字方向确认后，再定幅式——长卷、四条屏或单幅大字。',
          '每件作品随附释读说明一页，逐字注明取字出处与跋文全文。收礼的企业可以把释读页装进相框立在作品旁——往来宾客看得懂，这幅字就有了讲不完的故事。'] },
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
  { slug: 'ink-breath-teacher', name: '墨有呼吸 · 谢师礼', en: 'Ink with Breath · Teacher Gift', scene: 'thanks', sceneLabel: '感谢恩师 / 朋友', tier: 'keepsake', price: '¥800 以上', meaning: '自古文人雅趣，皆值得被郑重记录——一笔一画的浓淡与停顿都看得见，书香之气，就此落在案头。', recipient: '适合送给老师、爱书之人，或在人生阶段给予帮助的人。', dispatch: '预计确认后 14–21 个工作日发出', packaging: '含珍藏礼盒、说明卡与手写贺卡选项', visual: '墨', image: '/assets/scenes/theme-ink-breath.jpg',
    gallery: [
      { src: '/assets/scenes/ink-breath-writing.jpg', alt: '书写近景：手执毛笔在毛边纸上写下浓墨大字，笔锋转折与飞白清晰可见，旁有砚台', caption: '从落笔开始｜笔锋起落之间的浓淡枯润，就是墨的呼吸' },
      { src: '/assets/scenes/ink-breath-mounting.jpg', alt: '装裱过程：双手以棕刷在棉麻卡纸上匀浆托裱一幅小字书法，旁有竹起子与浆碗', caption: '托裱工序｜棕刷匀浆、竹起子起边，纸与卡贴合的每一下都靠手感' },
      { src: '/assets/scenes/ink-breath-framing.jpg', alt: '装帧完成：双手扶住黑胡桃木框边缘，框内书法作品已装妥，钤有朱红印章', caption: '装帧完成｜入框、验平、钤印归档，作品从此可以立在案头' },
    ],
    deepDive: [
      {
        eyebrow: 'Chapter 01 / 释读', heading: '书法文字提取与释读', intro: '先讲清楚这四个字：为什么是「墨有呼吸」。', paragraphs: [
          '本幅作品以古文字集青铜铭文书就：界格密排，字字有金文出处，右侧题写标题数位，左侧以行书落跋、钤印两方。墨色浓处如漆、枯处见锋——所谓「呼吸」，就是这些浓淡与停顿：机器打印的字没有呼吸，一笔一笔写出来的字有。',
          '写给老师的内容，我们建议从一句具体的话开始：「谢谢您教我看见」「先生之风，山高水长」，或你们之间才懂的一句话。文字方向确认后，再定书写体式与幅面。',
          '每件作品随附释读说明一页，逐字注明取字出处与跋文全文——老师拿到的不只是一幅字，而是一份可以逐字讲给学生听的材料。这大概是对「老师」二字最好的回应。'] },
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
// 价格（业主 2026-10-17 裁决）：A4 生肖同样定价 ¥300–500（见上方 giftProducts 定价规则）。
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
  { slug: 'shu', char: '鼠', name: '甲骨文 · 鼠', en: 'Rat', price: '¥300–500', blessing: '子鼠开天', story: '甲骨文的「鼠」张着尖嘴，垂着碎屑般的长尾，像刚从粮囤边溜过。传说天地混沌未开，是鼠咬破混沌漏下第一道光——「鼠咬天开」，一天时辰从子时开始。', image: '/assets/zodiac/zodiac-shu.jpg', alt: '甲骨文「鼠」字书法摆件，珊瑚橘暗纹笺，黑胡桃木框装裱，陈设于客厅木质边柜，旁有陶瓶花枝与碗' },
  { slug: 'niu', char: '牛', name: '甲骨文 · 牛', en: 'Ox', price: '¥300–500', blessing: '俯首甘为孺子牛', story: '一对弯角是甲骨文「牛」字最醒目的笔画。牛拉动农耕文明三千年，古文字里的「物」字就从牛而来——万物之「物」，本义是一头毛色纯正的牛。', image: '/assets/zodiac/zodiac-niu.jpg', alt: '甲骨文「牛」字书法摆件，藕粉云纹笺，黑胡桃木框装裱，陈设于展厅木案，旁有陶瓶花枝与深色陶碗' },
  { slug: 'hu', char: '虎', name: '甲骨文 · 虎', en: 'Tiger', price: '¥300–500', blessing: '虎啸风生', story: '甲骨文的「虎」张着巨口、遍体斑纹，威势扑面而来。先民画虎于门以驱邪祟——虎是山林之长，也是大人放在孩子枕边的勇气。', image: '/assets/zodiac/zodiac-hu.jpg', alt: '甲骨文「虎」字书法摆件，橘黄洒金笺，黑胡桃木框装裱，陈设于茶室木案，旁有黑陶茶壶与青瓷杯' },
  { slug: 'tu', char: '兔', name: '甲骨文 · 兔', en: 'Rabbit', price: '¥300–500', blessing: '赤兔呈瑞', story: '长耳、短尾、腾跃的身姿，甲骨文的「兔」一眼可辨。月宫捣药的玉兔是温柔的仙兽——「兔」与「瑞」相伴，愿你所求皆有回响。', image: '/assets/zodiac/zodiac-tu.jpg', alt: '甲骨文「兔」字书法摆件，豆绿暗纹笺，黑胡桃木框装裱，陈设于茶室原木长桌，旁有青瓷茶杯' },
  { slug: 'long', char: '龙', name: '甲骨文 · 龙', en: 'Dragon', price: '¥300–500', blessing: '飞龙在天', story: '顶着角冠、曲身昂首，甲骨文的「龙」是先民想象力的集大成：沟通天地、司掌风雨。十二生肖里唯一不存在于现实的神物，却活在每一个中国人的名字里。', image: '/assets/zodiac/zodiac-long.jpg', alt: '甲骨文「龙」字书法摆件，黄笺墨字，黑胡桃木框装裱，陈设于玄关端景木案，旁有铜鹤摆件与陶瓶' },
  { slug: 'she', char: '蛇', name: '甲骨文 · 蛇', en: 'Snake', price: '¥300–500', blessing: '金蛇献瑞', story: '蜿蜒的线条是「蛇」的本形——古文字里「它」字本义就是蛇，古人见面互问「无它乎」，便是「最近没遇上蛇吧」。蛇蜕皮新生，被称作小龙，是智慧与蜕变。', image: '/assets/zodiac/zodiac-she.jpg', alt: '甲骨文「蛇」字书法摆件，朱红暗纹笺，黑胡桃木框装裱，陈设于书房木案，旁有陶壶书册与青瓷杯' },
  { slug: 'ma', char: '马', name: '甲骨文 · 马', en: 'Horse', price: '¥300–500', blessing: '马到功成', story: '鬃毛飞扬、长尾奋蹄，甲骨文的「马」天生带着速度。《易》以乾卦配马，「天行健」的意象里始终有一匹奔跑的马——愿你不倦，一往无前。', image: '/assets/zodiac/zodiac-ma.jpg', alt: '甲骨文「马」字书法摆件，明黄笺墨字，黑胡桃木框装裱，陈设于茶室木案，旁有茶壶与青瓷茶杯' },
  { slug: 'yang', char: '羊', name: '甲骨文 · 羊', en: 'Goat', price: '¥300–500', blessing: '三羊开泰', story: '一对温顺的弯角，是甲骨文「羊」的全部温柔。古文字里「美」从羊、「善」从羊、「祥」从羊——先民把世间一切美好，都托付给了这个字。', image: '/assets/zodiac/zodiac-yang.jpg', alt: '甲骨文「羊」字书法摆件，金黄洒金笺，黑胡桃木框装裱，陈设于书房木案，旁有白瓷茶杯与石镇纸' },
  { slug: 'hou', char: '猴', name: '甲骨文 · 猴', en: 'Monkey', price: '¥300–500', blessing: '金猴献瑞', story: '灵长的手与目，在甲骨文里刻画得活灵活现。「猴」与「侯」相通，封侯进禄的期许都落在它身上——机敏、聪慧，自有主张。', image: '/assets/zodiac/zodiac-hou.jpg', alt: '甲骨文「猴」字书法摆件，朱红暗纹笺，黑胡桃木框装裱，陈设于书房书堆旁，旁有太湖石与毛笔' },
  { slug: 'ji', char: '鸡', name: '甲骨文 · 鸡', en: 'Rooster', price: '¥300–500', blessing: '雄鸡一唱天下白', story: '高冠长尾，甲骨文的「鸡」昂首如鸣。雄鸡司晨，风雨无改——「守信」二字，先民最早是从一只鸡身上读懂的。', image: '/assets/zodiac/zodiac-ji.jpg', alt: '甲骨文「鸡」字书法摆件，素白宣笺，黑胡桃木框装裱，陈设于书房木案，旁有书堆、笔洗与文房清供' },
  { slug: 'gou', char: '狗', name: '甲骨文 · 狗', en: 'Dog', price: '¥300–500', blessing: '犬守平安', story: '甲骨文的「狗（犬）」翘着尾巴、竖着耳朵，一副警觉的模样。犬是人类最古老的伙伴，守夜护院、不离不弃——它守的是家门，也是人心的安稳。', image: '/assets/zodiac/zodiac-gou.jpg', alt: '甲骨文「狗」字书法摆件，朱红暗纹笺，黑胡桃木框装裱，陈设于玄关木质边柜，旁有陶瓶花枝与石雕摆件' },
  { slug: 'zhu', char: '猪', name: '甲骨文 · 猪', en: 'Pig', price: '¥300–500', blessing: '诸事如意', story: '圆润丰腴的甲骨文「猪（豕）」。屋下有豕方为「家」——「家」字的宝盖头下，住的就是这头猪。富足、安定、烟火气，都从它开始。', image: '/assets/zodiac/zodiac-zhu.jpg', alt: '甲骨文「猪」字书法摆件，橘黄云纹笺，黑胡桃木框装裱，陈设于玄关木柜，旁有铜环摆件与方形铜盒' },
];

export type ReadyMadeWork = {
  slug: string;
  title: string;
  en: string;
  note: string;
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
export const readyMadeWorks: ReadyMadeWork[] = [
  { slug: 'qing-huan', title: '清欢', en: 'Quiet Joy', code: 'XMA-CL-WA-26-0001-T2-0', year: 2026, note: '「人间有味是清欢」，苏轼写给寻常日子的七个字。不浓烈，却留得住——适合茶席、餐桌旁，或任何一个想慢下来的墙角。', material: '赭底宣纸 · 白色卡衬 · 榫卯结构柚木框', form: '挂墙', price: 399, size: { w: 60, h: 33 }, image: '/assets/works/work-qing-huan-2.jpg', alt: '赭底白卡柚木框书法小品《清欢》挂在墙上的空间实景，旁有青瓷瓶、座钟与书册',
    source: { char: '歡', origin: '商周金文', note: '「欢」的繁体作「歡」，从雚从欠：左旁「雚」是一种水鸟，右旁「欠」象人张口出气。古人以鸟鸣开口之形，记下欢愉这件事——原来「开心」这个意思，一开始是从声音里来的。' },
    sceneFit: '茶席旁、餐桌边，或任何一个想慢下来的墙角。它不劝你热闹，只提醒你——寻常日子本身就值得被写下来。' },
  { slug: 'de-xin-ya-ju', title: '德馨雅居', en: 'Virtue Graces the Home', code: 'XMA-CL-WA-26-0002-T2-3', year: 2026, note: '「斯是陋室，惟吾德馨」——屋子不在大小，住的人自有雅气。适合客厅大墙，也适合乔迁与开业。', material: '手写书法原作 · 榫卯结构胡桃木框', form: '挂墙', price: 399, size: { w: 60, h: 33 }, image: '/assets/works/work-de-xin-ya-ju.jpg', alt: '书法横批《德馨雅居》挂在客厅大墙上，下方是茶台、皮沙发与圆几',
    source: { char: '馨', origin: '商甲骨文', note: '「馨」从香从殸省，本义是香气传得远。《说文》释为「香之远闻者」——古人用一个字记下「好东西会自己飘出去」这件事，所以「德馨」说的是：住的人对了，屋子自然有味道。' },
    sceneFit: '客厅大墙、进门正对的那面墙。乔迁、开业、或者只是你终于把家安顿好了——这四个字替主人说话，不必开口。' },
  { slug: 'shang-hua-pin-ming', title: '赏花品茗', en: 'Flowers & Tea', code: 'XMA-CL-SG-26-0001-T1-8', year: 2026, note: '赏花品茗，四时清课。瓶花与茶席之间，把日子过成自己的样子。适合茶室与餐边柜，也适合爱花爱茶的人。', material: '手写书法原作 · 榫卯结构柚木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-shang-hua-pin-ming.jpg', alt: '书法横批《赏花品茗》立在木质边柜上，旁有瓶花与盖碗茶席',
    source: { char: '茗', origin: '先秦石鼓文', note: '「茗」从艸从名，指晚采的茶。《说文》未收此字，较早见于汉魏文献；本义与「名」有关——茶有名字，不好的一茬才叫「茗」。后来这个字反而成了茶的雅称，古人的自谦，慢慢长成了体面。' },
    sceneFit: '茶室、餐边柜、阳台一角的茶席。送给爱花爱茶的人，或者送给那个终于愿意给自己泡一壶茶的人。' },
  { slug: 'nan-xi-xin-ji', title: '南谿新霁', en: 'Clearing Over the South Stream', code: 'XMA-CL-FA-26-0001-T1-4', year: 2026, note: '「南谿新霁」——雨过天晴，山清水净。四个字落在洒金扇面上，把雨停之后那一刻的清朗留在案头，适合茶席与书房。', material: '洒金扇面 · 榫卯结构胡桃木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/nan-xi-xin-ji-wide.jpg', alt: '胡桃木框洒金扇面书法小品《南谿新霁》陈设于条案上，旁有太湖石与青瓷瓶梅枝，暖光斜入',
    source: { char: '霁', origin: '秦篆', note: '「霁」从雨从齐，本义是雨停。《说文》释为「雨止也」，从「齐」得声兼取意——雨脚齐了，便是天要放晴。这个字只属于那一小段时间：雨刚停、水汽还悬着、光刚刚透进来。' },
    sceneFit: '茶席、书房案头。它写的是雨后那一刻，也可以是你心里那件事刚刚过去的那一刻。' },
  { slug: 'chan', title: '禅', en: 'Zen', code: 'XMA-CL-SC-26-0001-T1-4', year: 2026, note: '「菩提本无树」，六祖慧能的偈语。一方圆光小品，进门第一眼、家里最安静的那个角落，都合适。', material: '圆光小品 · 榫卯结构胡桃木框', form: '摆件', price: 299, size: { w: 50, h: 50 }, image: '/assets/works/work-chan.jpg', alt: '圆光书法小品《禅》立在玄关石面上，旁有玉兰花枝与暖灯',
    source: { char: '禪', origin: '秦篆', note: '「禅」的繁体作「禪」，从示从單：左旁「示」是祭台，右旁「單」声。这个字本身是「祭天」之意，佛教东传后被借去翻译梵语「dhyāna」的音，从此长出一个全新的意思——一个字被赋予新生命，往往不是因为谁改造了它，而是因为有人需要它。' },
    sceneFit: '玄关石面、最安静的墙角、办公桌一侧。它不说「你要放下」，它只是站在那里。' },
  { slug: 'mo-jian-hu-yin', title: '莫见乎隐', en: 'Seen Even When Alone', code: 'XMA-CL-WA-26-0003-T2-6', year: 2026, note: '「莫见乎隐，莫显乎微」——《中庸》讲慎独：越是没人看见的地方，越看得见一个人。适合书房，也适合留给自己的角落。', material: '手写书法立轴 · 榫卯结构胡桃木框', form: '挂墙', price: 399, size: { w: 60, h: 33 }, image: '/assets/works/work-mo-jian-hu-yin.jpg', alt: '书法立轴《莫见乎隐·莫显乎微》嵌在拱形壁龛里，下方石台上有陶瓶与蒲苇',
    source: { char: '隱', origin: '先秦石鼓文', note: '「隐」的繁体作「隱」，从阜从㥯：左旁「阜」是土山，右旁取其声兼意。本义是「藏在山后」——先秦的人用山的遮挡来理解「看不见」这件事，所以「隐」从来不是消失，只是被挡住了。' },
    sceneFit: '书房、留给自己的那个角落。它不写给客人看，写给深夜还醒着的你。' },
  { slug: 'guan-zi-zai', title: '观自在', en: 'At Ease, As You Are', code: 'XMA-CL-SG-26-0002-T1-1', year: 2026, note: '「观自在菩萨」，心经开篇三字。自在不在远处，就在抬眼可见的地方——适合书房与玄关。', material: '手写书法原作 · 榫卯结构胡桃木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-guan-zi-zai.jpg', alt: '书法横批《观自在》摆在中式木案上，旁有石盆、瘦枝与笔架',
    source: { char: '心', origin: '秦篆', note: '「心」在秦篆里还是一个能看出心脏形状的象形字，《说文》释为「人心，土藏，在身之中」。到隶书时它才被压成今天的样子——字变了，「心」这个意思却一直没变。观自在的「自」，指的就是这颗心。' },
    sceneFit: '书房案头、玄关。它不劝你放下什么，只提醒你——先看见自己，再谈其他。' },
  { slug: 'yi-hu-yi-xi', title: '一呼一吸', en: 'One Breath, Then Another', code: 'XMA-CL-SG-26-0003-T1-4', year: 2026, note: '一呼一吸之间，日子有了自己的节奏。适合卧室床头、书桌旁，也适合送给总在赶时间的人。', material: '手写书法原作 · 榫卯结构柚木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-yi-hu-yi-xi.jpg', alt: '书法小品《一呼一吸》立在卧室边柜上，旁有台灯与柿子果盘',
    source: { char: '息', origin: '商甲骨文', note: '「息」从自从心：「自」在甲骨文里就是鼻子的形状，古人以为气从鼻出，所以「息」的本义是呼吸。《说文》释「喘也」。一个由「鼻子」和「心」组成的字——呼吸这件事，从一开始就被当作心的事。' },
    sceneFit: '卧室床头、书桌一角。送给总在赶时间的人，或者送给你自己——一呼一吸，你还在。' },
  { slug: 'chang-le', title: '长乐', en: 'Everlasting Joy', code: 'XMA-CL-WA-26-0004-T2-9', year: 2026, note: '取意汉瓦「长乐未央」，两个字，是古人最绵长的祝愿。适合书房与日常抬眼可见的地方。', material: '手写书法立轴 · 榫卯结构胡桃木框', form: '挂墙', price: 399, size: { w: 60, h: 33 }, image: '/assets/works/work-chang-le.jpg', alt: '书法立轴《长乐》挂在深木色书房书架间，案上有绿植、笔砚与台灯',
    source: { char: '樂', origin: '汉瓦当', note: '「长乐未央」是汉代瓦当上最常见的吉语之一，汉长乐宫的瓦头至今还留着这四个字。「乐」的初形是木上系丝弦——古人先有乐器，才从乐音里说出「快乐」。所以「长乐」的意思不只是长久高兴，是长久地、像音乐一样地过着。' },
    sceneFit: '书房、抬眼可见的地方。不要热烈，只要绵长——这是两个字能给出的最长承诺。' },
  { slug: 'duan-she-li', title: '断舍离', en: 'Less, Then Light', code: 'XMA-CL-SG-26-0004-T1-7', year: 2026, note: '三个字，写给正在做减法的人与家。适合卧室、玄关，也适合送给刚刚搬完家的朋友。', material: '手写书法原作 · 榫卯结构柚木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-duan-she-li-2.jpg', alt: '书法小品《断舍离》立在卧室柜上，旁有台灯、书册与瓶枝',
    source: { char: '捨', origin: '秦篆', note: '「舍」的繁体作「捨」，从手从舍：提手旁是「放手」这个动作，右旁「舍」是房舍。本义是「放下手里的东西」。有意思的是，「舍」本身也指住所——同一个字，既是「放掉」，也是「安顿」。' },
    sceneFit: '卧室、玄关、刚整理完的那个柜子前。送给刚搬完家的朋友，或者送给正打算重新开始的自己。' },
  { slug: 'mao-fei-jia-run', title: '猫肥家润', en: 'Fat Cat, Flourishing Home', code: 'XMA-CL-SG-26-0005-T1-0', year: 2026, note: '猫肥家润，花繁人安。把最有烟火气的幸福写进家里——适合客厅，也适合养猫的人家。', material: '手写书法原作 · 榫卯结构柚木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-mao-fei-jia-run.jpg', alt: '书法横批《猫肥家润》摆在客厅木几上，背景是沙发、抱枕与绿植',
    source: { char: '猫', origin: '先秦石鼓文', note: '「猫」从豸从苗：左旁「豸」在古文字里是长脊兽的象形，右旁「苗」是它的声音。从「苗」得声不是巧合——鼠害吃苗，所以猫因护苗而得名。这个字把「猫的用处」写进了它的样子里。' },
    sceneFit: '客厅、猫窝旁边、家里的木几上。最没架子的一幅字——它记的不是理想生活，是有人在家。' },
  { slug: 'xiang-jian-yi-wu-shi', title: '相见亦无事', en: 'Nothing Much, Just to See You', code: 'XMA-CL-SG-26-0006-T1-3', year: 2026, note: '「相见亦无事，不来忽忆君」，写给不必寒暄的老朋友。适合客厅与茶席，也适合做乔迁与重逢的礼。', material: '白底红卡 · 榫卯结构胡桃木框', form: '摆件', price: 199, size: { w: 21, h: 29.7 }, image: '/assets/works/work-xiang-jian-yi-wu-shi.jpg', alt: '白底红卡黑框书法小品《相见亦无事》立在暖光卧室的木柜上，旁有台灯与书册',
    source: { char: '見', origin: '商甲骨文', note: '「见」的初形是一个人跪坐着、头上顶着一只放大的眼睛——甲骨文里「目」被刻意画得很大。古人用「突出眼睛」表示「看见」，因为看这件事，本来就不只是眼睛的事。' },
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
