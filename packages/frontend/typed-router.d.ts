/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by unplugin-vue-router. ‼️ DO NOT MODIFY THIS FILE ‼️
// It's recommended to commit this file.
// Make sure to add this file to your tsconfig.json file as an "includes" or "files" entry.

declare module 'vue-router/auto-routes' {
  import type {
    RouteRecordInfo,
    ParamValue,
    ParamValueOneOrMore,
    ParamValueZeroOrMore,
    ParamValueZeroOrOne,
  } from 'unplugin-vue-router/types'

  /**
   * Route name map generated by unplugin-vue-router
   */
  export interface RouteNamedMap {
    '/': RouteRecordInfo<'/', '/', Record<never, never>, Record<never, never>>,
    '/[...path]': RouteRecordInfo<'/[...path]', '/:path(.*)', { path: ParamValue<true> }, { path: ParamValue<false> }>,
    '/automations/': RouteRecordInfo<'/automations/', '/automations', Record<never, never>, Record<never, never>>,
    '/automations/[id]': RouteRecordInfo<'/automations/[id]', '/automations/:id', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    '/card/[cardId]': RouteRecordInfo<'/card/[cardId]', '/card/:cardId', { cardId: ParamValue<true> }, { cardId: ParamValue<false> }>,
    '/crm/[slug]': RouteRecordInfo<'/crm/[slug]', '/crm/:slug', { slug: ParamValue<true> }, { slug: ParamValue<false> }>,
    '/crm/tasks': RouteRecordInfo<'/crm/tasks', '/crm/tasks', Record<never, never>, Record<never, never>>,
    '/inbox': RouteRecordInfo<'/inbox', '/inbox', Record<never, never>, Record<never, never>>,
    '/invite/[inviteCode]': RouteRecordInfo<'/invite/[inviteCode]', '/invite/:inviteCode', { inviteCode: ParamValue<true> }, { inviteCode: ParamValue<false> }>,
    '/login': RouteRecordInfo<'/login', '/login', Record<never, never>, Record<never, never>>,
    '/pm/list/[listId]/': RouteRecordInfo<'/pm/list/[listId]/', '/pm/list/:listId', { listId: ParamValue<true> }, { listId: ParamValue<false> }>,
    '/register': RouteRecordInfo<'/register', '/register', Record<never, never>, Record<never, never>>,
    '/settings/': RouteRecordInfo<'/settings/', '/settings', Record<never, never>, Record<never, never>>,
    '/settings/[section]': RouteRecordInfo<'/settings/[section]', '/settings/:section', { section: ParamValue<true> }, { section: ParamValue<false> }>,
    '/settings/card-types/[id]': RouteRecordInfo<'/settings/card-types/[id]', '/settings/card-types/:id', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    '/settings/notifications/[channel]': RouteRecordInfo<'/settings/notifications/[channel]', '/settings/notifications/:channel', { channel: ParamValue<true> }, { channel: ParamValue<false> }>,
    '/whiteboard': RouteRecordInfo<'/whiteboard', '/whiteboard', Record<never, never>, Record<never, never>>,
  }
}
