import { config, fields, collection, singleton } from '@keystatic/core';

const menuItem = fields.object({
  label: fields.text({ label: '中文名称', validation: { isRequired: true } }),
  englishLabel: fields.text({ label: '英文名称' }),
  href: fields.url({ label: '链接', validation: { isRequired: true } }),
  visible: fields.checkbox({ label: '显示', defaultValue: true }),
  order: fields.integer({ label: '排序', defaultValue: 1 }),
  children: fields.array(fields.object({
    label: fields.text({ label: '子菜单名称' }),
    englishLabel: fields.text({ label: '子菜单英文名称' }),
    href: fields.url({ label: '子菜单链接' }),
    visible: fields.checkbox({ label: '显示子菜单', defaultValue: true }),
    order: fields.integer({ label: '子菜单排序', defaultValue: 1 }),
  }), { label: '二级菜单' }),
});

const contentBody = fields.mdx({ label: '正文内容', description: '支持 Markdown/MDX。' });

export default config({
  // github：在线后台模式。访问 站点/keystatic → GitHub 登录 → 改动直接提交到仓库，
  // 由 GitHub Action 自动构建部署上线（.github/workflows/deploy.yml）。
  // 需要环境变量：KEYSTATIC_GITHUB_CLIENT_ID / KEYSTATIC_GITHUB_CLIENT_SECRET /
  //   KEYSTATIC_SECRET / PUBLIC_KEYSTATIC_GITHUB_APP_SLUG（首次由 /keystatic 向导生成）。
  storage: { kind: 'github', repo: 'wwwin896-cpu/xiaominART' },
  locale: 'zh-CN',
  ui: {
    brand: {
      name: '小民艺术｜东方日常之礼',
    },
    navigation: {
      内容管理: ['settings', 'navigation', 'products', 'occasions', 'recipients', 'scenes', 'channelPages', 'blog', 'faqs', 'clientStories'],
    },
  },
  singletons: {
    settings: singleton({
      label: '网站设置',
      path: 'content/settings/site.yaml',
      format: 'yaml',
      schema: {
        siteTitle: fields.text({ label: '网站标题', defaultValue: '小民艺术｜日常之礼' }),
        siteDescription: fields.text({ label: '网站描述', multiline: true, defaultValue: '小民艺术，以亲笔书写为起点的东方日常之礼。见字如面，心意表达。' }),
        logoSubtitle: fields.text({ label: 'Logo 副标', defaultValue: '小民艺术｜日常之礼' }),
        brandSlogan: fields.text({ label: '品牌主张', defaultValue: '见字如面，心意表达' }),
        artistPenName: fields.text({ label: '艺术家笔名', defaultValue: '升斗小民' }),
        contactEmail: fields.text({ label: '联系邮箱', defaultValue: 'hello@xiaominart.com' }),
        footerText: fields.text({ label: '页脚文案', multiline: true, defaultValue: 'XIAOMINART / 东方日常之礼' }),
        published: fields.checkbox({ label: '启用设置', defaultValue: true }),
      },
    }),
    navigation: singleton({
      label: '主菜单与二级菜单',
      path: 'content/settings/navigation.yaml',
      format: 'yaml',
      schema: {
        primaryItems: fields.array(menuItem, { label: '主菜单', description: '私享礼遇、选礼指南、企业礼赠、品牌故事四项一级导航；场合和对象作为选礼指南下的二级与 SEO 子页。' }),
        footerItems: fields.array(menuItem, { label: '页脚菜单' }),
      },
    }),
  },
  collections: {
    products: collection({
      label: '产品与礼品',
      path: 'content/products/*',
      slugField: 'title',
      format: { contentField: 'body' },
      columns: ['title', 'category', 'priceRange', 'published'],
      schema: {
        title: fields.slug({ name: { label: '标题', validation: { isRequired: true } } }),
        subtitle: fields.text({ label: '副标题' }),
        category: fields.select({ label: '品类', options: [
          { label: '手写书法', value: 'calligraphy' },
          { label: '手作/插画', value: 'handmade-illustration' },
          { label: '非遗/器物', value: 'heritage-objects' },
        ], defaultValue: 'calligraphy' }),
        priceRange: fields.text({ label: '价格区间', defaultValue: '¥100–300' }),
        scene: fields.text({ label: '适用场景' }),
         occasion: fields.text({ label: '适用场合' }),
         recipients: fields.array(fields.text({ label: '适合对象' }), { label: '适合对象' }),
         meaning: fields.text({ label: '礼物寓意', multiline: true }),
         packaging: fields.text({ label: '包装与贺卡说明', multiline: true }),
         dispatch: fields.text({ label: '制作 / 发货参考' }),
         miniProgramUrl: fields.url({ label: '微信小程序商品链接（未确认时留空）' }),
         miniProgramStatus: fields.select({ label: '小程序导流状态', options: [
           { label: '未配置', value: 'unconfigured' },
           { label: '已确认', value: 'ready' },
           { label: '暂时失效', value: 'unavailable' },
         ], defaultValue: 'unconfigured' }),
         featured: fields.checkbox({ label: '首页推荐', defaultValue: false }),
         published: fields.checkbox({ label: '发布', defaultValue: true }),
         seoTitle: fields.text({ label: 'SEO 标题' }),
         seoDescription: fields.text({ label: 'SEO 描述', multiline: true }),
         body: contentBody,
       },
     }),
     occasions: collection({
       label: '选礼指南 / 场合',
       path: 'content/occasions/*',
       slugField: 'title',
       format: { contentField: 'body' },
       columns: ['title', 'published'],
       schema: {
         title: fields.slug({ name: { label: '场合名称', validation: { isRequired: true } } }),
         englishTitle: fields.text({ label: '英文名称' }),
         intro: fields.text({ label: '场合简介', multiline: true }),
         recommendedGiftSlugs: fields.array(fields.text({ label: '推荐礼品 slug' }), { label: '推荐礼品' }),
         published: fields.checkbox({ label: '发布', defaultValue: true }),
         seoTitle: fields.text({ label: 'SEO 标题' }),
         seoDescription: fields.text({ label: 'SEO 描述', multiline: true }),
         body: contentBody,
       },
     }),
     recipients: collection({
       label: '选礼指南 / 对象',
       path: 'content/recipients/*',
       slugField: 'title',
       format: { contentField: 'body' },
       columns: ['title', 'published'],
       schema: {
         title: fields.slug({ name: { label: '对象名称', validation: { isRequired: true } } }),
         englishTitle: fields.text({ label: '英文名称' }),
         intro: fields.text({ label: '对象简介', multiline: true }),
         recommendedGiftSlugs: fields.array(fields.text({ label: '推荐礼品 slug' }), { label: '推荐礼品' }),
         published: fields.checkbox({ label: '发布', defaultValue: true }),
         seoTitle: fields.text({ label: 'SEO 标题' }),
         seoDescription: fields.text({ label: 'SEO 描述', multiline: true }),
         body: contentBody,
       },
     }),
     channelPages: collection({
       label: '渠道专题 / 小红书承接页',
       path: 'content/channel-pages/*',
       slugField: 'title',
       format: { contentField: 'body' },
       columns: ['title', 'channel', 'published'],
       schema: {
         title: fields.slug({ name: { label: '专题标题', validation: { isRequired: true } } }),
         channel: fields.select({ label: '渠道', options: [
           { label: '小红书', value: 'xiaohongshu' },
           { label: '微信', value: 'wechat' },
           { label: '搜索', value: 'search' },
         ], defaultValue: 'xiaohongshu' }),
         campaign: fields.text({ label: '活动 / 主题' }),
         ctaLabel: fields.text({ label: 'CTA 文案', defaultValue: '进入选礼指南' }),
         ctaUrl: fields.url({ label: 'CTA 链接', defaultValue: '/gift-guide/' }),
         published: fields.checkbox({ label: '发布', defaultValue: false }),
         seoTitle: fields.text({ label: 'SEO 标题' }),
         seoDescription: fields.text({ label: 'SEO 描述', multiline: true }),
         body: contentBody,
       },
     }),
     faqs: collection({
       label: '帮助中心 / FAQ',
       path: 'content/faqs/*',
       slugField: 'question',
       format: { contentField: 'answer' },
       columns: ['question', 'category', 'published'],
       schema: {
         question: fields.slug({ name: { label: '问题', validation: { isRequired: true } } }),
         category: fields.select({ label: '分类', options: [
           { label: '选礼', value: 'gift-guide' },
           { label: '包装与交付', value: 'delivery' },
           { label: '售后', value: 'after-sales' },
           { label: '定制', value: 'custom' },
         ], defaultValue: 'gift-guide' }),
         published: fields.checkbox({ label: '发布', defaultValue: true }),
         answer: fields.mdx({ label: '回答' }),
       },
     }),
     scenes: collection({
      label: '生活场景',
      path: 'content/scenes/*',
      slugField: 'title',
      format: { contentField: 'body' },
      columns: ['title', 'spaceType', 'published'],
      schema: {
        title: fields.slug({ name: { label: '标题', validation: { isRequired: true } } }),
        subtitle: fields.text({ label: '副标题' }),
        spaceType: fields.select({ label: '空间类型', options: [
          { label: '书房', value: 'study' },
          { label: '客厅', value: 'living-room' },
          { label: '茶室', value: 'tea-room' },
          { label: '玄关', value: 'entry' },
          { label: '企业空间', value: 'business' },
        ], defaultValue: 'study' }),
        styleKeyword: fields.text({ label: '风格关键词' }),
        description: fields.text({ label: '场景描述', multiline: true }),
        imagePath: fields.text({ label: '场景图片路径', description: '填写 public 下的绝对路径，例如 /assets/scenes/study-round-calligraphy.jpg。' }),
        published: fields.checkbox({ label: '发布', defaultValue: true }),
        body: contentBody,
      },
    }),
    blog: collection({
      label: '静气生活 / Journal',
      path: 'content/blog/*',
      slugField: 'title',
      format: { contentField: 'body' },
      columns: ['title', 'author', 'published'],
      schema: {
        title: fields.slug({ name: { label: '标题', validation: { isRequired: true } } }),
        author: fields.text({ label: '作者', defaultValue: '升斗小民' }),
        publishDate: fields.date({ label: '发布日期' }),
        tags: fields.array(fields.text({ label: '标签' }), { label: '标签' }),
        published: fields.checkbox({ label: '发布', defaultValue: true }),
        body: contentBody,
      },
    }),
    clientStories: collection({
      label: '客户故事',
      path: 'content/client-stories/*',
      slugField: 'title',
      format: { contentField: 'body' },
      columns: ['title', 'authorization', 'published'],
      schema: {
        title: fields.slug({ name: { label: '标题', validation: { isRequired: true } } }),
        clientName: fields.text({ label: '脱敏客户名' }),
        clientType: fields.select({ label: '客户类型', options: [
          { label: '个人', value: 'personal' },
          { label: '企业', value: 'business' },
        ], defaultValue: 'personal' }),
        testimonial: fields.text({ label: '客户评价', multiline: true }),
        authorization: fields.checkbox({ label: '已获公开授权', defaultValue: false }),
        published: fields.checkbox({ label: '发布', defaultValue: false }),
        body: contentBody,
      },
    }),
  },
});
