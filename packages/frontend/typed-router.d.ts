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
    '/invite/[inviteCode]': RouteRecordInfo<'/invite/[inviteCode]', '/invite/:inviteCode', { inviteCode: ParamValue<true> }, { inviteCode: ParamValue<false> }>,
    '/login': RouteRecordInfo<'/login', '/login', Record<never, never>, Record<never, never>>,
    '/pm/automations': RouteRecordInfo<'/pm/automations', '/pm/automations', Record<never, never>, Record<never, never>>,
    '/pm/card/[cardId]': RouteRecordInfo<'/pm/card/[cardId]', '/pm/card/:cardId', { cardId: ParamValue<true> }, { cardId: ParamValue<false> }>,
    '/pm/list/[listId]/': RouteRecordInfo<'/pm/list/[listId]/', '/pm/list/:listId', { listId: ParamValue<true> }, { listId: ParamValue<false> }>,
    '/register': RouteRecordInfo<'/register', '/register', Record<never, never>, Record<never, never>>,
  }
}
