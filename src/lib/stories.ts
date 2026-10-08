/**
 * 客户故事（content/client-stories/*.yaml）读取层。
 *
 * 这里唯一重要的事是**授权门禁**：
 * 站点对外的承诺是「故事默认只有你和写字的我们可见，公开需要单独授权」，
 * 而 Keystatic 里 `authorization` 与 `published` 两个开关的默认值都是 false。
 * 因此本文件只把 **同时满足 `authorization === true` 且 `published === true`** 的故事
 * 交给页面渲染——少任何一个都不算数。
 *
 * 换句话说：在后台「客户故事」里，只勾「发布」而不勾「已获公开授权」，
 * 内容不会出现在网站上。这不是提示，是硬过滤。
 */
import { parse } from 'yaml';

const storyFiles = import.meta.glob('../../content/client-stories/*.{yaml,yml}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export type ClientStory = {
  slug: string;
  title: string;
  /** 脱敏客户名，如「张女士」 */
  clientName: string;
  clientType: 'personal' | 'business';
  /** 客户评价原文（已获授权才可用） */
  testimonial: string;
  /** 故事正文（Markdown） */
  body: string;
};

type RawStory = ClientStory & { authorization: boolean; published: boolean };

const asText = (value: unknown): string => (value === null || value === undefined ? '' : String(value));

function readAll(): RawStory[] {
  return Object.entries(storyFiles).map(([path, raw]) => {
    const data = (parse(raw) ?? {}) as Record<string, unknown>;
    return {
      slug: path.split('/').pop()?.replace(/\.ya?ml$/, '') ?? '',
      title: asText(data.title),
      clientName: asText(data.clientName),
      clientType: data.clientType === 'business' ? 'business' : 'personal',
      testimonial: asText(data.testimonial),
      body: asText(data.body),
      authorization: data.authorization === true,
      published: data.published === true,
    };
  });
}

/** 已获公开授权、且已发布的故事。页面只能用这个函数取数。 */
export function getAuthorizedStories(): ClientStory[] {
  return readAll()
    .filter((story) => story.authorization && story.published && story.title)
    .map(({ authorization: _authorization, published: _published, ...story }) => story);
}
