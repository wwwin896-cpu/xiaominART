export const navItems = [
  { href: '/', zh: '首页', en: 'Home' },
  { href: '/inspiration/', zh: '灵感画廊', en: 'Gallery' },
  { href: '/artists/', zh: '艺术家', en: 'Artists' },
  { href: '/custom/', zh: '方寸心境', en: 'Fangcun Mood' },
  { href: '/commission/', zh: '个人定制', en: 'Personal Commission' },
  { href: '/business-custom/', zh: '企业定制', en: 'Business Custom' },
  { href: '/blog/', zh: 'Journal', en: 'Journal' },
  { href: '/about/', zh: '关于我们', en: 'About' },
  { href: '/faq/', zh: '常见问题', en: 'FAQ' },
];

export const processSteps = [
  { no: '01', zh: '说出愿望', en: 'Share the intention', body: '告诉我们空间、人物与想留下的情绪，不必先懂艺术。' },
  { no: '02', zh: '共同取意', en: 'Shape the direction', body: '从字、色、材质与观看距离中，找到属于你的视觉方向。' },
  { no: '03', zh: '艺术家创作', en: 'Artist at work', body: '由匹配的艺术家完成创作，过程中保留必要的确认节点。' },
  { no: '04', zh: '交付一份作品', en: 'Receive the work', body: '最终方案与交付边界确认后，作品以适合你的方式抵达。' },
];

export const inspirations = [
  { slug: 'quiet-entry', title: '静入', en: 'A Quiet Entrance', category: '空间气质 / Spatial mood', note: '以留白、低饱和纸色和一笔墨色建立入口的安静秩序。', tag: '纸白 · 墨色', spaces: ['玄关', '客厅'], style: ['留白'], artist: '斗升小民', palette: ['纸白', '墨色'], frames: ['matte-black', 'natural-oak'] },
  { slug: 'red-seal', title: '一点朱砂', en: 'A Cinnabar Note', category: '色彩方向 / Colour direction', note: '不追求热闹，只用一处朱砂把观看的重心轻轻点亮。', tag: '朱砂 · 留白', spaces: ['客厅', '茶室'], style: ['朱砂', '留白'], artist: '斗升小民', palette: ['朱砂', '纸白'], frames: ['champagne', 'matte-black'] },
  { slug: 'desk-mountain', title: '案上有山', en: 'A Mountain on the Desk', category: '案头意象 / Desk object', note: '将山水的起伏收进器物，让日常工作拥有可停留的边界。', tag: '木色 · 线条', spaces: ['书房', '办公室'], style: ['山水', '器物'], artist: '案上山房', palette: ['木色', '纸白'], frames: ['natural-oak', 'matte-black'] },
  { slug: 'ink-breath', title: '墨有呼吸', en: 'Ink with Breath', category: '书写气息 / Ink gesture', note: '观察墨色浓淡、速度与停顿，寻找不被复制的手感。', tag: '墨色 · 手感', spaces: ['茶室', '书房'], style: ['墨色'], artist: '墨结构', palette: ['墨色', '灰'], frames: ['matte-black', 'champagne'] },
  { slug: 'seasonal-letter', title: '四时一笺', en: 'A Letter for the Season', category: '礼赠方向 / Gift direction', note: '让一份礼物从季节、关系与一句话开始，而不是从货架开始。', tag: '节气 · 心意', spaces: ['玄关', '民宿空间'], style: ['留白', '器物'], artist: '斗升小民', palette: ['纸白', '木色'], frames: ['champagne', 'natural-oak'] },
  { slug: 'threshold-light', title: '门槛的光', en: 'Light at the Threshold', category: '空间定制 / Spatial commission', note: '为民宿、会客厅与文化空间寻找一处不喧哗的识别。', tag: '空间 · 光线', spaces: ['企业会客厅', '民宿空间'], style: ['留白', '山水'], artist: '墨结构', palette: ['灰', '木色'], frames: ['natural-oak', 'champagne'] },
];

export const artists = [
  { slug: 'xiaomin', name: '斗升小民', en: 'Dou Sheng Xiaomin', discipline: '书写与东方日常 / Calligraphy & everyday rituals', bio: '以书写为入口，关注人与人之间那些需要被郑重说出的时刻。', philosophy: '让一句话先被听见，再寻找适合它的笔墨、尺度与停顿。', styles: ['留白', '墨色'], media: ['书写', '纸本'], projectTypes: ['小幅礼赠', '居家墙面'], portfolio: ['静入', '一点朱砂', '四时一笺'], experience: '经历与展览信息将随创作笔记持续呈现。', siteNote: '落地实景图与公开案例将随授权故事持续呈现。', quote: '参考报价需结合尺寸、媒介、创作复杂度与交付边界沟通确认。' },
  { slug: 'ink-structure', name: '墨结构', en: 'Ink Structure', discipline: '书法与空间 / Calligraphy & space', bio: '以结构、尺度与留白回应建筑和生活空间的秩序。', philosophy: '让作品与空间保持呼吸，在观看距离与材料关系中建立安静的秩序。', styles: ['墨色', '山水'], media: ['书法', '空间构成'], projectTypes: ['居家墙面', '商业空间'], portfolio: ['墨有呼吸', '门槛的光', '案上有山'], experience: '经历与展览信息将随创作笔记持续呈现。', siteNote: '落地实景图与公开案例将随授权故事持续呈现。', quote: '参考报价需结合空间尺度、媒介、安装与交付边界沟通确认。' },
  { slug: 'wooden-mountain', name: '案上山房', en: 'Mountain on the Desk', discipline: '文房器物 / Scholar objects', bio: '从木、纸、石与使用痕迹中，寻找器物的安定感。', philosophy: '从可触摸的材料和日常使用出发，让器物成为人与空间之间的缓慢回应。', styles: ['器物', '留白'], media: ['木', '纸', '文房器物'], projectTypes: ['小幅礼赠', '商业空间'], portfolio: ['案上有山', '四时一笺', '静入'], experience: '经历与展览信息将随创作笔记持续呈现。', siteNote: '落地实景图与公开案例将随授权故事持续呈现。', quote: '参考报价需结合材料、尺度、数量与制作边界沟通确认。' },
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
  { title: '一群人的礼', en: 'A gift for a collective', body: '适用于企业、婚礼、周年与活动场景的艺术化定制。' },
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
  { slug: 'xi', title: '喜', pinyin: 'Xǐ', en: 'A shared joy', meaning: '把值得庆祝的相逢、成家与好消息写下来。', scene: '适合婚礼、周年、新居与重要相逢。' },
  { slug: 'cai', title: '财', pinyin: 'Cái', en: 'A life in abundance', meaning: '关于丰足、流动与把日子经营好的心愿。', scene: '适合开业、乔迁与为生活添一份笃定。' },
];

export const seasons = [
  { slug: 'spring', name: '春', line: '春生福', note: '万物开始有了方向。' },
  { slug: 'summer', name: '夏', line: '夏纳喜', note: '把好消息留在手边。' },
  { slug: 'autumn', name: '秋', line: '秋守财', note: '收拢一年的丰足。' },
  { slug: 'winter', name: '冬', line: '冬安寿', note: '在安静里照看日常。' },
];

export const faqs = [
  ['为什么没有成品直接购买？什么是艺术共创？ / Why is there no ready-made checkout?', '小民艺术专注艺术共创定制，每件作品会结合你的故事、空间与想法重新讨论，不做批量复刻现货。灵感画廊中的案例仅作方向参考，不售卖同款。 / Xiaomin Art focuses on collaborative commissions shaped around your story, space and intention. Gallery cases are references only; identical works are not for sale.'],
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
