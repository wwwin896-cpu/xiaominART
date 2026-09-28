// 后台外壳的客户端组件模块（.astro 无法把「frontmatter 里创建的组件」交给 client:only，
// 必须是一个可被客户端解析的真实模块——官方注入页 keystatic-page.js 即此模式）。
// 配置通过 virtual:keystatic-config 在客户端直接 import（dev 由 @keystatic/astro 集成提供；
// 生产构建由 astro.config.mjs 的 vite alias 指向 keystatic.config.ts），
// 这样 schema 里的函数/React 组件不会被 astro-island 的 JSON 序列化剥掉——
// 若像旧版外壳那样把 config 作为 props 传入，dev 下会得到白屏（字段全为 null）。
import { makePage } from '@keystatic/astro/ui';

// eslint-disable-next-line import/no-unresolved
import config from 'virtual:keystatic-config';

export const Keystatic = makePage(config);
