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
export const navItems = [
  {
    href: '/gifts/', zh: '小民好礼', en: 'Xiaomin Gifts', children: [
      { href: '/gifts/ready-made/', zh: '现货好礼', en: 'Ready to Ship' },
      { href: '/custom-commission/', zh: '定制好礼', en: 'Made to Order' },
      { href: '/gift-guide/', zh: '送礼指南', en: 'Gift Guide' },
    ],
  },
  {
    href: '/scenes/', zh: '灵感参考', en: 'Inspiration', children: [
      { href: '/scenes/#scene-study', zh: '书', en: 'Study' },
      { href: '/scenes/#scene-living', zh: '厅', en: 'Living room' },
      { href: '/scenes/#scene-tea', zh: '茶', en: 'Tea room' },
      { href: '/scenes/#scene-bedroom', zh: '房', en: 'Bedroom' },
      { href: '/gift-guide/', zh: '礼', en: 'Gifts' },
      { href: '/business-gifts/', zh: '企', en: 'Business' },
    ],
  },
  {
    href: '/partners/', zh: '机构合作', en: 'Partnerships', children: [
      { href: '/partners/publishing/', zh: '出版社插画', en: 'Publishing' },
      { href: '/partners/museum-tourism/', zh: '博物馆与文旅', en: 'Museum & Tourism' },
      { href: '/partners/heritage/', zh: '非遗面塑活动', en: 'Heritage Workshops' },
      { href: '/partners/cases/', zh: '合作案例', en: 'Case Studies' },
    ],
  },
  { href: '/about/', zh: '关于我们', en: 'About Us', children: [] },
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
  { slug: 'xiaomin', name: '升斗小民', en: 'Dou Sheng Xiaomin', discipline: '书写与东方日常 / Calligraphy & everyday rituals', bio: '以书写为入口，关注人与人之间那些需要被郑重说出的时刻。字既是礼物，也是日常的注脚——从一句心事出发，落成可以留住的纸本。', philosophy: '让一句话先被听见，再寻找适合它的笔墨、尺度与停顿。', styles: ['留白', '墨色'], media: ['书写', '纸本'], projectTypes: ['小幅礼赠', '居家墙面'], portfolio: ['静入', '一点朱砂', '四时一笺'], experience: '经历与展览信息将随创作笔记持续呈现。', siteNote: '落地实景图与公开案例将随授权故事持续呈现。', quote: '参考报价需结合尺寸、媒介、创作复杂度与交付边界沟通确认。' },
  { slug: 'xiaoning', name: '非遗小宁', en: 'Xiao Ning', discipline: '非遗面塑与手作体验 / Dough figurine & workshops', bio: '以面塑为手上功夫，关注传统手艺如何走进现代日常。主持校园、社区与机构的面塑体验活动，把材料、故事和一段有来处的时间，一起交到参与者手上。', philosophy: '让每个人亲手捏出属于自己的那一段记忆。', styles: ['面塑', '节气'], media: ['面塑', '手作'], projectTypes: ['非遗体验活动', '机构专场'], portfolio: ['节气面塑', '亲子手作课'], experience: '活动经历与现场记录将随授权整理持续呈现。', siteNote: '活动现场照片与案例将随授权整理持续呈现。', quote: '活动费用按人数、时长与材料配置沟通确认。' },

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
  miniProgramUrl?: string;
  miniProgramStatus?: 'unconfigured' | 'ready' | 'unavailable';
  published?: boolean;
};

export const giftProducts: GiftProduct[] = [
  { slug: 'quiet-entry-gift', name: '静入 · 书房小礼', en: 'A Quiet Entrance · Study Gift', scene: 'housewarming', sceneLabel: '乔迁之喜', tier: 'entry', price: '¥100–300', meaning: '以一处留白，为新居留住第一份安静。', recipient: '适合送给刚搬入新家的朋友、同事或长辈。', dispatch: '预计确认后 7–10 个工作日发出', packaging: '含基础礼盒与手写贺卡选项', visual: '静入', image: '/assets/scenes/study-desk-scroll.jpg' },
  { slug: 'cinnabar-note-gift', name: '一点朱砂 · 生日心意', en: 'A Cinnabar Note · Birthday Gift', scene: 'birthday', sceneLabel: '生日心意', tier: 'thoughtful', price: '¥300–500', meaning: '用一处温和朱砂，替你说出值得庆祝的好消息。', recipient: '适合送给朋友、伴侣或希望认真表达感谢的人。', dispatch: '预计确认后 7–10 个工作日发出', packaging: '含礼盒包装、祝福卡和贺卡文字预览', visual: '朱', image: '/assets/scenes/sideboard-fan-calligraphy.jpg' },
  { slug: 'seasonal-letter-gift', name: '四时一笺 · 节日问候', en: 'A Letter for the Season · Festival Gift', scene: 'festival', sceneLabel: '节日问候', tier: 'thoughtful', price: '¥300–500', meaning: '从一个节气和一句问候开始，让礼物慢慢抵达日常。', recipient: '适合节日送长辈、朋友或重要合作伙伴。', dispatch: '预计确认后 10–14 个工作日发出', packaging: '含节日主题包装与手写贺卡选项', visual: '笺', image: '/assets/scenes/tea-gold-calligraphy.jpg' },
  { slug: 'desk-mountain-keepsake', name: '案上有山 · 雅致贺礼', en: 'A Mountain on the Desk · Keepsake', scene: 'opening', sceneLabel: '开业贺礼', tier: 'keepsake', price: '¥800 以上', meaning: '把稳重、开阔与持续生长的祝愿，放在案头。', recipient: '适合开业、晋升、周年等需要郑重表达的时刻。', dispatch: '预计确认后 14–21 个工作日发出', packaging: '含珍藏礼盒、包装升级与贺卡文字预览', visual: '山', image: '/assets/scenes/dining-room-long-calligraphy.jpg' },
  { slug: 'ink-breath-teacher', name: '墨有呼吸 · 谢师礼', en: 'Ink with Breath · Teacher Gift', scene: 'thanks', sceneLabel: '感谢恩师 / 朋友', tier: 'keepsake', price: '¥800 以上', meaning: '以墨色的浓淡和停顿，表达长久的感谢与敬意。', recipient: '适合送给老师、 mentor 或在人生阶段给予帮助的人。', dispatch: '预计确认后 14–21 个工作日发出', packaging: '含珍藏礼盒、说明卡与手写贺卡选项', visual: '墨', image: '/assets/scenes/study-desk-scroll.jpg' }, 
];

export const giftScenes = [
  { slug: 'housewarming', name: '乔迁之喜', en: 'Housewarming', body: '为新居添一处书香静气。' },
  { slug: 'opening', name: '开业贺礼', en: 'Opening gift', body: '用一份有文化温度的心意，祝愿事业开张。' },
  { slug: 'birthday', name: '生日心意', en: 'Birthday', body: '不追逐热闹，认真表达对一个人的在意。' },
  { slug: 'festival', name: '节日问候', en: 'Festival greeting', body: '让节日礼物拥有一段可以被记住的故事。' },
  { slug: 'thanks', name: '感谢恩师 / 朋友', en: 'Thank you', body: '把感谢写下来，送给曾经照亮你的人。' },
];

export const giftOccasions = [
  { slug: 'birthday', title: '生日心意', en: 'Birthday gifts', intro: '不追逐热闹，认真表达对一个人的在意。', scenes: ['birthday', 'thanks'] },
  { slug: 'housewarming', title: '乔迁之喜', en: 'Housewarming gifts', intro: '为新居添一处书香静气，也为新的生活留一份祝愿。', scenes: ['housewarming'] },
  { slug: 'festival', title: '节日问候', en: 'Festival gifts', intro: '让节日礼物从一句问候开始，慢慢抵达日常。', scenes: ['festival', 'thanks'] },
  { slug: 'teacher-thanks', title: '感谢恩师 / 朋友', en: 'Thank-you gifts', intro: '把感谢写下来，送给曾经照亮你的人。', scenes: ['thanks'] },
  { slug: 'opening', title: '开业贺礼', en: 'Opening gifts', intro: '用一份有文化温度的心意，祝愿事业开张。', scenes: ['opening', 'keepsake'] },
  { slug: 'anniversary', title: '周年与纪念', en: 'Anniversary gifts', intro: '为共同走过的时间，留下一件可以被反复看见的礼物。', scenes: ['opening', 'thanks'] },
];

export const giftRecipients = [
  { slug: 'parents', title: '送长辈', en: 'For parents and elders', intro: '选择一份稳重、温和、可以进入日常的心意。', scenes: ['thanks', 'festival'] },
  { slug: 'partner', title: '送伴侣', en: 'For a partner', intro: '从你们共同拥有的一句话、一段时间或一个空间开始。', scenes: ['birthday', 'festival'] },
  { slug: 'friends', title: '送朋友', en: 'For friends', intro: '为朋友的小聚、生日或新的生活阶段准备一份不喧哗的礼。', scenes: ['birthday', 'housewarming'] },
  { slug: 'teachers', title: '送老师', en: 'For teachers', intro: '用书写、纸本和墨色表达长久的感谢与敬意。', scenes: ['thanks'] },
  { slug: 'clients', title: '送客户 / 合作伙伴', en: 'For clients and partners', intro: '让一份礼物替关系留下清晰、克制而有温度的表达。', scenes: ['opening', 'festival'] },
  { slug: 'team', title: '送员工 / 团队', en: 'For teams', intro: '适合团队纪念、节日慰问和需要共同分享的时刻。', scenes: ['festival', 'opening'] },
];

export const giftTierLabels = {
  entry: { name: '入门款', en: 'Everyday gift', range: '¥100–300', body: '适合日常表达、朋友小聚与轻量心意。' },
  thoughtful: { name: '心意款', en: 'Thoughtful gift', range: '¥300–500', body: '适合生日、节日与需要认真准备的关系。' },
  keepsake: { name: '珍藏款', en: 'Keepsake gift', range: '¥800 以上', body: '适合开业、周年、谢师等重要时刻。' },
};

export type ReadyMadeWork = {
  slug: string;
  title: string;
  en: string;
  note: string;
  image: string;
  alt: string;
  /** 装饰场景图：作品挂进真实空间的样子。优先于实拍图展示。 */
  sceneImage?: string;
  sceneAlt?: string;
};

/**
 * 现货好礼 · 书法小品（2026-09-30 新增）
 * 已写完、装裱完成、可直接发货的在册作品，每幅世间唯一。
 * image 为作品实拍（public/assets/works/work-*.jpg）；sceneImage 为空间场景演绎（scene-*.jpg，与实拍逐字核对过）。
 * 题字为从实拍辨认，上线前请主人复核一遍。
 * 尺寸、纸墨与价格不写在页面上，随作品档案在咨询时提供。
 */
export const readyMadeWorks: ReadyMadeWork[] = [
  { slug: 'ri-you-xi', title: '日有喜 · 宜酒食', en: 'A Good Day, Good Food', note: '古人把「日日有喜、宜酒宜食」当作好日子的标准——这句话，今天依然成立。', image: '/assets/works/work-ri-you-xi.jpg', alt: '装裱完成的书法小品《日有喜·宜酒食》实拍', sceneImage: '/assets/works/scene-ri-you-xi.jpg', sceneAlt: '书法小品《日有喜·宜酒食》挂在木质边柜上，与陶罐绿枝和灯笼相映' },
  { slug: 'wan-shi-sui-yuan', title: '万事随缘', en: 'Go with Grace', note: '随缘不是随便，是把用力过猛的日子，轻轻松一松。', image: '/assets/works/work-wan-shi-sui-yuan.jpg', alt: '装裱完成的书法小品《万事随缘》实拍', sceneImage: '/assets/works/scene-wan-shi-sui-yuan.jpg', sceneAlt: '书法横批《万事随缘》挂在开放式厨房与客厅之间' },
  { slug: 'qing-huan', title: '清欢', en: 'Quiet Joy', note: '人间有味是清欢。不浓烈，却留得住。', image: '/assets/works/work-qing-huan.jpg', alt: '装裱完成的书法小品《清欢》实拍', sceneImage: '/assets/works/scene-qing-huan.jpg', sceneAlt: '木框书法小品《清欢》立在案头，旁边是台灯、书页与一杯茶' },
  { slug: 'que-bao-yan-qian-xi', title: '鹊报檐前喜', en: 'Good News at the Eaves', note: '喜鹊落在檐前，好事正在路上。适合乔迁与新阶段的开始。', image: '/assets/works/work-que-bao-yan-qian-xi.jpg', alt: '装裱完成的书法小品《鹊报檐前喜》实拍', sceneImage: '/assets/works/scene-que-bao-yan-qian-xi.jpg', sceneAlt: '书法立轴《鹊报檐前喜》挂在玄关，玉兰枝与球形壁灯相伴' },
  { slug: 'duan-she-li', title: '断舍离', en: 'Less, Then Light', note: '三个字，写给正在做减法的人与家。', image: '/assets/works/work-duan-she-li.jpg', alt: '装裱完成的书法小品《断舍离》实拍' },
  { slug: 'ming-pin-gong-shang', title: '茗品共赏', en: 'Tea & Words', note: '茶席之上，字与茶同席。适合茶室，也适合爱茶的人。', image: '/assets/works/work-ming-pin-gong-shang.jpg', alt: '装裱完成的书法横批《茗品共赏》实拍' },
  { slug: 'ran-xiang-ye-du-shu', title: '燃香夜读书', en: 'Incense & Night Reading', note: '一炉香，一盏灯，把夜晚还给读书的人。', image: '/assets/works/work-ran-xiang-ye-du-shu.jpg', alt: '装裱完成的书法小品《燃香夜读书》实拍', sceneImage: '/assets/works/scene-ran-xiang-ye-du-shu.jpg', sceneAlt: '书法立轴《燃香夜读书》挂在灰墙长案上方，香炉青烟与瓶花相伴' },
  { slug: 'fu-ru-dong-hai', title: '福如东海 · 寿比南山', en: 'Blessings Deep as the Sea', note: '最经典的祝福，值得用最郑重的笔写。适合长辈寿诞与重要纪念。', image: '/assets/works/work-fu-ru-dong-hai.jpg', alt: '装裱完成的鸟虫篆书法立轴《福如东海·寿比南山》实拍', sceneImage: '/assets/works/scene-fu-ru-dong-hai.jpg', sceneAlt: '鸟虫篆书法《福如东海·寿比南山》黄纸小品摆在书桌台灯下，旁有毛笔与放大镜' },
  { slug: 'huan-xi', title: '欢喜', en: 'Delight', note: '两个字，够了。看见它的人，会先笑一下。', image: '/assets/works/work-huan-xi.jpg', alt: '装裱完成的书法小品《欢喜》实拍' },
  { slug: 'he-qi', title: '和气', en: 'Warmth Within', note: '一门和气，是一个家最安静的底气。', image: '/assets/works/work-he-qi.jpg', alt: '装裱完成的书法小品《和气》实拍' },
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

export const work = { slug: 'seasonal-blessing', title: '四季福愿 · 心事成字', en: 'Seasonal Blessing · Your Story in Original Calligraphy', summary: '这是一个可继续讨论的定制方向，不是现货商品。我们从你的场景、关系与一句话开始，共同确认创作方向。', status: 'concept', delivery: 'commission', isConceptVisual: true };

export const blessings = [
  { slug: 'fu', title: '福', pinyin: 'Fú', en: 'A sense of wholeness', meaning: '关于安稳、圆满与被好好接住。', scene: '适合家庭、乔迁与想为日常留一笔的时刻。' },
  { slug: 'lu', title: '禄', pinyin: 'Lù', en: 'Purpose & practice', meaning: '关于所做之事、学业与职业方向。', scene: '适合为长期努力、事业与学习寻找一份视觉表达。' },
  { slug: 'shou', title: '寿', pinyin: 'Shòu', en: 'A long horizon', meaning: '对时间、陪伴与日常安康的温和祝愿。', scene: '适合长辈、生日与值得慢慢过的日子。' },
  { slug: 'xi', title: '喜', pinyin: 'Xǐ', en: 'A shared joy', meaning: '把值得庆祝的相逢、好消息写下来。', scene: '适合新居、纪念时刻与重要相逢。' },
  { slug: 'cai', title: '财', pinyin: 'Cái', en: 'A life in abundance', meaning: '关于丰足、流动与把日子经营好的心愿。', scene: '适合开业、乔迁与为生活添一份笃定。' },
];

export const seasons = [
  { slug: 'spring', name: '春', line: '春生福', note: '万物开始有了方向。' },
  { slug: 'summer', name: '夏', line: '夏纳喜', note: '把好消息留在手边。' },
  { slug: 'autumn', name: '秋', line: '秋守财', note: '收拢一年的丰足。' },
  { slug: 'winter', name: '冬', line: '冬安寿', note: '在安静里照看日常。' },
];

export const faqs = [
  ['手写现货和艺术共创定制有什么区别？ / What is the difference between ready-made works and commissions?', '手写现货是已经写好的小幅作品与手写小笺，按四时一笺、墨有呼吸、一点朱砂、案上有山四个主题分类，可以直接选购；艺术共创定制则从你的故事、空间与想法出发重新讨论，每件作品都不重复、不做批量复刻。灵感画廊中的案例仅作方向参考，不售卖同款。 / Ready-made works are already-written small pieces, grouped into four themes and available directly; commissions are shaped around your story, space and intention, so no two works are alike and nothing is mass-replicated. Gallery cases are references only; identical works are not for sale.'],
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
