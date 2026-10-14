// 站点联系信息集中配置。
// wechatId 留空时，页脚会引导访客通过定制咨询表单留下微信号（表单已接入真实后端）。
// 填写后页脚自动改为展示微信号；wechatQr 填二维码图片路径（如 /assets/images/wechat-qr.png）后自动展示二维码。
export const siteContact = {
  email: 'hi@xiaominart.com',
  wechatId: '17761888727',
  wechatQr: '/assets/images/wechat-qr.jpg',
  /**
   * 微信公众号 / 服务号名称与二维码（2026-10-14 新增，用于作品档案页的「关注」转化段）。
   *
   * ⚠️ 两个字段留空时，档案页会自动**隐藏关注段**（降级为只展示个人微信），
   *    不会出现空二维码或死链。业主拿到公众号后，把图片放到
   *    `public/assets/images/` 再把路径填进来即可，无需改代码。
   *
   * 注意：公众号需为企业主体（南京宁伊文化传播有限公司）注册，
   *      个人订阅号方案已于 2026-10-11 作废。
   */
  mpName: '',
  mpQr: '',
};

/** 是否已配置公众号（决定档案页是否展示「关注」段） */
export const hasOfficialAccount = Boolean(siteContact.mpQr);
