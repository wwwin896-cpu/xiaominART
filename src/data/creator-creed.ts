// 书者手记（升斗小民）
// ─────────────────────────────────────────────────────────────
// 2026-10-07：把主理人升斗小民关于书法的两段见解整理为站点内容，
// 用于「关于我们」的独立版块与艺术家详情页，增加品牌内涵与可信度。
//
// 整理原则：
// 1. 保留原话的口吻与判断，只做去重、断句与书面化；不添加她没说的结论。
// 2. 不写任何营销词（顶级 / 大师 / 独家 / 匠心），与全站去营销化一致。
// 3. 英文仅为栏目语义对应，不逐句翻译——与站点其它 eyebrow 的处理一致。

export interface CreedItem {
  /** 序号，两位字符串 */
  no: string;
  /** 中文核心句（短，可独立成题） */
  title: string;
  /** 栏目英文标识 */
  en: string;
  /** 展开说明，用她的原话语气 */
  body: string;
}

export interface Creed {
  /** 锚点 id，用于页内跳转 */
  id: string;
  /** 栏目眉标 */
  eyebrow: string;
  /** 小标题 */
  lead: string;

  /** 一句话主张，独立成行 */
  motto: string;
  /** 主张的英文对照（书法性表达，非逐字翻译） */
  mottoEn: string;

  /** 支撑该主张的分点 */
  items: CreedItem[];

  /** 收束语 */
  closing: string;
}

/** 一、墨写箴言，行胜于言 */
export const creedAction: Creed = {
  id: 'creed-action',
  eyebrow: 'Creed / 书者手记 · 其一',
  lead: '墨写箴言，行胜于言。',
  motto: '书法即是心迹，墨痕从不欺人。',
  mottoEn: 'Calligraphy is the trace of a person. Ink does not lie.',
  items: [
    {
      no: '01',
      title: '箴言若只留在纸上，便没有走进生活',
      en: 'On the wall is only the first step',
      body: '不少人把格言联句当成装点书房的布景，把书法变作附庸风雅的道具。这样一来，楹联就成了悬浮的圣人说教——字挂上去了，人却没有被它说动。',
    },
    {
      no: '02',
      title: '挂上墙，只是第一步',
      en: 'The first step, not the last',
      body: '最怕的是：联语好看，行动落空。文字可以一挥而就，修身却是漫长打磨。写得漂亮不难，难的是让写下的那句话，在往后的日子里一直作数。',
    },
    {
      no: '03',
      title: '让每一笔风骨，都落到日常的行事之中',
      en: 'Let the words land in daily life',
      body: '与其把古联当成门面摆设，不如试着让每一句格言、每一笔风骨，都落到日常行事里。字不是给别人看的，是给自己立的。',
    },
  ],
  closing: '墨写箴言，行胜于言，方不负纸上笔墨风骨。',
};

/** 二、扎根古法，碑帖相参 */
export const creedCraft: Creed = {
  id: 'creed-craft',
  eyebrow: 'Craft / 书者手记 · 其二',
  lead: '扎根古法，碑帖相参。',
  motto: '满纸清和，文心涵养。',
  mottoEn: 'Rooted in tradition, tempered by a quiet hand.',
  items: [
    {
      no: '01',
      title: '笔墨根脉端正，格局开阔',
      en: 'A straight root, an open frame',
      body: '不逐时流、不媚时风。于雄浑的金石气中，藏一份温润的书卷气——气象是大的，手却是收敛的。',
    },
    {
      no: '02',
      title: '用笔圆劲朗润，结字疏淡自然',
      en: 'Round, clear, unhurried',
      body: '细腻凝练，不紧不迫，字里有一种松弛的静气。一笔一画从容平和，看不出浮躁和刻意——这不是慢下来装出来的，是本来就不急。',
    },
    {
      no: '03',
      title: '小字之美，不靠雕琢取胜',
      en: 'Not carved, but accumulated',
      body: '全然是常年读书、临池沉淀下来的文心流露。通篇清和涵养、气韵绵长，静心品读，足以让人褪去浮躁、安顿心神。',
    },
  ],
  closing: '古法是根，读书是养。根深了，字才立得住。',
};

/** 两则手记，按页面展示顺序 */
export const creatorCreed: Creed[] = [creedAction, creedCraft];
