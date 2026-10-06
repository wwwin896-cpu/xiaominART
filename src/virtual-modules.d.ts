// 构建期虚拟模块的类型声明。
//
// `virtual:keystatic-config` 由两处提供，类型检查器都看不到：
//   · dev：@keystatic/astro 集成插件的 resolveId 提供
//   · build：astro.config.mjs 的 vite alias 指向 keystatic.config.ts
// 这里只补一个模块形状声明，让 `astro check` 不报 ts(2307)。
// 用 import type 取真实类型，避免 any 扩散；若配置文件结构变化会自动跟上。
declare module 'virtual:keystatic-config' {
  import type { Config } from '@keystatic/core';
  const config: Config;
  export default config;
}
