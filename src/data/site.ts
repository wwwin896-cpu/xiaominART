// 站点联系信息集中配置。
// wechatId 留空时，页脚会引导访客通过定制咨询表单留下微信号（表单已接入真实后端）。
// 填写后页脚自动改为展示微信号；wechatQr 填二维码图片路径（如 /assets/images/wechat-qr.png）后自动展示二维码。
export const siteContact = {
  email: 'hi@xiaominart.com',
  wechatId: '17761888727',
  wechatQr: '/assets/images/wechat-qr.jpg',
  /**
   * 2026-10-18 说明：飞书机器人 webhook 只接受程序 POST，
   * 访客在浏览器打开只会看到错误页，**绝不能做成外链**（字段已删除）。
   * 私信入口的真实通道见下方 chatConfig。
   */
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

/**
 * 「私信」实时对话通道（2026-10-18 业主选定「两个都要」）。
 *
 * 目标：访客点移动端底栏「私信」，**不填表单、不加好友**，直接进对话框。
 *
 * 两条通道，按环境自动分流（逻辑在 components/MobileBar.astro 的 openDm）：
 *   ① 微信内打开 → 跳 `wechatKfUrl`（企业微信「微信客服」链接）。
 *      微信里是原生会话页，无需加好友，业主回复后访客微信有消息提醒 —— 回复率最高。
 *   ② 其他浏览器 → 拉起 Knocket 网页聊天面板（`knocketIdentifier`）。
 *      不离开站点，业主在 Knocket 收件箱 / Telegram 回复。
 *   ③ 两者都没配 → 回退到原来的留言弹层（写库 + 推飞书群），不留死入口。
 *
 * ⚠️ 两个字段都留空时，站点零变化、零报错 —— 与全站「未就绪即静默降级」一致。
 *
 * ── 怎么拿到这两个值 ──────────────────────────────
 * wechatKfUrl：
 *   1. work.weixin.qq.com 注册企业微信（免费）→「我的企业」完成主体认证（第三方审核，¥300/年）
 *   2. 管理后台「应用管理 → 微信客服」开通（认证后免费，基础版 10 坐席 / 月 1 万次）
 *   3. 在客服账号里「获取客服链接」，形如 https://work.weixin.qq.com/kfid/kfcXXXXXXXX
 *
 * knocketIdentifier：
 *   1. knocket.trtc.io 注册（腾讯云 TRTC 出品，永久免费、无水印）
 *   2. 控制台建「网页小组件」，在 Installation 页复制 identifier
 *
 * 拿到后填进下面两个字符串即可，**不需要改其它任何代码**。
 */
export const chatConfig = {
  /** 微信客服链接；空字符串 = 未接入 */
  wechatKfUrl: '',
  /** Knocket 网页组件的 identifier；空字符串 = 未接入 */
  knocketIdentifier: '',
};

/** 是否已接入任意一条实时通道（决定「私信」按钮的行为） */
export const hasLiveChat = Boolean(chatConfig.wechatKfUrl || chatConfig.knocketIdentifier);

/** 是否已配置公众号（决定档案页是否展示「关注」段） */
export const hasOfficialAccount = Boolean(siteContact.mpQr);

/**
 * 「分享作品得积分」是否已启用（2026-10-14）。
 *
 * ⚠️ 业主已确认要做完整积分系统，但积分涉及账号、余额、兑换核销，
 *    需要后端与运营规则同时就绪。
 *
 * 设计取向与全站一致：**未就绪时功能静默关闭、优雅降级，不留死链**。
 *   · false → 档案页的「分享有礼」卡片自动换成「定制」卡片
 *   · true  → 展示「晒出你的那一件」，指向 /share/
 *
 * 启用条件（三条都满足才改 true）：
 *   1. 积分规则已定稿（怎么算分、能不能叠加、有效期）
 *   2. 兑换池已定（哪几件作品可兑、库存怎么控）
 *   3. /share/ 页面与后端已上线并验证通过
 */
export const shareEnabled = false;
