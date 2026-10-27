export type UserCredentials = {
  username: string
  password: string
}

export interface TokenState {
  token: string | null
}

export interface Channel {
  id: string
  name: string
  removable: boolean
}

export interface Message {
  id: string
  text: string
  channelId: string
  token: string
  timestamp: string
}