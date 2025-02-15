import http from '@/common/http'
import { ListDataWithPagination } from '@/types/common'
import {
  BannedFormForCreate,
  BannedItem,
  PwdFormForUpdate,
  UserFormForCreate,
  UserItem,
} from '@/types/systemModule'

export function loadUser(): Promise<Array<UserItem>> {
  return http.get('/users')
}

export function createUser(body: UserFormForCreate): Promise<UserItem> {
  return http.post(`/users`, body)
}

export function updateUser(username: string, body: UserItem): Promise<UserItem> {
  return http.put(`/users/${encodeURIComponent(username)}`, body)
}

export function changePassword(username: string, body: PwdFormForUpdate): Promise<void> {
  return http.post(`/users/${encodeURIComponent(username)}/change_pwd`, body)
}

export function destroyUser(username: string): Promise<void> {
  return http.delete(`/users/${encodeURIComponent(username)}`)
}

export function loadBannedClient(params = {}): Promise<ListDataWithPagination<BannedItem>> {
  return http.get('/banned', { params })
}

export function createBannedClient(body: BannedFormForCreate): Promise<BannedItem> {
  return http.post('/banned', body)
}

export function deleteBannedClient({ who, as }: Pick<BannedItem, 'who' | 'as'>): Promise<void> {
  return http.delete(`/banned/${as}/${encodeURIComponent(who)}`)
}

export default {}
