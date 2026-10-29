# План миграции `frontend` → `frontend-ts` (TypeScript)

## Метаданные

- **Репозиторий:** `Chat-Slack-like`
- **Источник:** `frontend/` (React 18 + CRA, только чтение)
- **Цель:** `frontend-ts/` (Vite 7 + React 19 + TypeScript 5.9)
- **Статус:** в процессе — частично выполнены этапы 1 и 8 (см. раздел 3.0)
- **Ветка:** `migrate-ts-2026_10_27` (план предлагал `migrate-to-ts-2026_10` — оставлено как есть для совместимости с уже открытым PR)
- **Дата:** 2026-10-29; правки отражают фактическое состояние ветки

---

## 1. Цель и границы

### Цель

Перевести оставшиеся `.js` / `.jsx` файлы `frontend-ts` на TypeScript, сохранив текущее поведение приложения, и получить проект, который:

- полностью проверяется TypeScript в строгом режиме;
- не содержит `.js` / `.jsx` в `frontend-ts/src`;
- собирается и запускается в dev и production-режиме;
- не требует правок в каталоге `frontend/`.

### Что является эталоном поведения

Эталон — **текущее поведение `.jsx`-файлов в `frontend-ts`**, а не код в `frontend/`.

`frontend-ts` уже отличается от `frontend`:

- `Chat.jsx` использует `useGetChannelsQuery` / `useGetMessagesQuery` и передаёт данные пропсами, а `frontend` — селекторы и `setChannels` / `setMessages`;
- `Messages.jsx` использует `message.body`, а `frontend` — `message.body.body`;
- `Channels.jsx` использует `onChannelClick` / `onOpenModal`, а `frontend` — `activeChannnelClick` / `handleModal`;
- в `frontend-ts` добавлен ключ `channels.manage`;
- `MessageInput` сбрасывает форму и использует `values.body`, в `frontend` есть старые ошибки;
- версии React, Router, Vite и зависимостей отличаются.

`frontend/` нужен только как источник недостающих файлов и смысла, но не как эталон функциональности.

### Вне scope

- изменение или удаление файлов в `frontend/`;
- перенос CRA-инфраструктуры;
- настройка Vitest / e2e-тестов;
- редизайн UI;
- рефакторинг бизнес-логики, не связанный с типами;
- переименование `activeChannnelClick` и прочие косметические правки — только отдельным коммитом после миграции.

---

## 2. Правила

1. **Не трогать `frontend/`.** Любые команды запускать из `frontend-ts` или с `--prefix frontend-ts`.
2. **Новые файлы создавать только в `frontend-ts`.**
3. Импорты — **без расширения** (`./App`, `./store/api`, `./Messages`).
4. Компоненты — стрелочные функции с `default export`, как в уже мигрированных файлах.
5. Доменные типы — в `src/store/types/index.ts`.
6. Пропсы компонентов описывать локальными `interface` / `type` над компонентом.
7. В `catch` использовать `unknown`, без `any`.
8. Не менять разметку и поведение без отдельного решения, зафиксированного в разделе «Решения».
9. **Старый файл удаляется в том же шаге, что и создаётся новый.** См. риск дублирования модулей.
10. После каждого этапа выполнять проверки из раздела 8.

---

## 3. Исходное состояние

### 3.0. Фактическое состояние на момент правки плана

Ветка `migrate-ts-2026_10_27` уже содержит часть результатов этапов 1 и 8. Это нужно учитывать при выполнении остальных шагов.

| Файл / артефакт | Состояние | Что с этим делать |
|---|---|---|
| `src/App.tsx`, `src/main.tsx` | уже на TS, **но с дефектами** | правятся в этапе 8 (см. ниже) |
| `src/store/{index,api}.ts`, `Slices/*.ts` | уже на TS, **но с дефектами** | правятся в этапе 1 |
| `src/store/types/index.ts` | уже на TS, но `Message` имеет `text/channelId/token/timestamp` вместо `body/channelID/username` | переписать по разделу 5.1 (этап 1) |
| `src/store/api.ts` | `editChannel/removeChannel/removeMessage: number`; `getAuthToken: { token: string }`; `addNewUser: void` | переписать по таблице 5.2 (этап 1) |
| `src/utils/routes.ts` | `(id) =>` без аннотации | типизировать (этап 1) |
| `src/store/Slices/*.ts` | `import { Channel } from '../types'` без `type` | заменить на `import type` (этап 1) |
| `src/main.tsx` (строка 7) | `import App from './App.jsx'` | **критично**: Vite по умолчанию резолвит `.jsx` раньше `.tsx`, а в репо есть и `App.tsx`. Победит `.jsx` и импорт упадёт. Исправить в первую очередь (этап 0) |
| `src/main.tsx` | `document.getElementById('root')` без null-check, закомментированный Rollbar | этап 8 / этап 9 |
| `src/store/hooks.ts` | **отсутствует** | создать в этапе 1 |
| `src/App.tsx` | `useDispatch()` без типов; socket-payload'ы без типов | этап 8 |
| `src/components/Channels/Channels.jsx` | импортирует `cn from 'classnames'`, **а `classnames` не в `package.json`** | **критично**: этап 2 |
| `eslint.config.ts` | `import js from '@eslint/js'`, **а `@eslint/js` не в devDeps** | **критично**: этап 2 |
| `tsconfig.node.json` | `"types": ["node"]`, **а `@types/node` не в devDeps** | **критично**: этап 2 |
| `frontend-ts/package.json` | `socket.io` уже удалён из `dependencies` | закрыто до начала этапа 2 |
| `types/react-jsx-runtime.d.ts`, `types/eslint-plugin-jsx-a11y.d.ts` | ещё на месте, но их досрочное удаление ломает lint на этапах 3–8 (пока есть `.jsx`) | удалять только в этапе 9 (правка по сравнению с исходным планом) |
| `types/assets.d.ts` | шимы для статических ассетов (svg/png/jpg/...) | оставить, в плане не упоминается |
| `src/utils/rollbarConfig.js`, `src/main.tsx` (Rollbar-комменты) | ещё на месте | этап 9 |
| `frontend-ts/README.md` | Vite-шаблон, не описание проекта | этап 9 |
| `src/App.css`, `src/assets/vite.svg` | не используются | этап 9 |
| `tsconfig.app.tsbuildinfo`, `tsconfig.node.tsbuildinfo` | отслеживаются git | этап 0 |

### 3.1. Уже на TypeScript

- `src/main.tsx`
- `src/App.tsx`
- `src/store/index.ts`
- `src/store/api.ts`
- `src/store/types/index.ts`
- `src/store/Slices/{activeChannel,authToken,channels,messages}.ts`
- `src/utils/routes.ts`

Эти файлы **не являются полностью готовыми**: в них есть неявные `any` и неверные типы относительно реального API. Это исправляется на этапе 1.

### 3.2. Осталось конвертировать

```text
src/utils/socket.js
src/utils/defaultChannel.js
src/utils/rollbarConfig.js
src/locales/i18n.js
src/locales/index.js
src/locales/en/en.js
src/locales/ru/ru.js
src/auth/contexts.jsx
src/auth/hook.jsx
src/auth/AuthProvider.jsx
src/auth/AuthButton.jsx
src/auth/PrivateRoute.jsx
src/components/ChatBox/ChatBox.jsx
src/components/ChatBox/Messages.jsx
src/components/ChatBox/MessageInput.jsx
src/components/Channels/Channels.jsx
src/components/modals/index.js
src/components/modals/Rename.jsx
src/components/modals/Add.jsx
src/components/modals/Remove.jsx
src/Pages/Login/Login.jsx
src/Pages/Signup/Signup.jsx
src/Pages/NotFound/NotFound.jsx
src/Pages/Chat/Chat.jsx
src/assets/ChannelButtonSVG.jsx
src/assets/MessageInputButtonSVG.jsx
```

Итого 26 файлов `.js` / `.jsx`.

### 3.3. Технический долг, который нужно закрыть до конвертации

| Проблема | Последствие | Решение |
|---|---|---|
| `store/types` не соответствует реальным данным | компоненты не типизируются без `as` / `any` | этап 1 |
| `Message` содержит `text`, `channelId`, `token`, `timestamp` | фактически используются `body`, `channelID`, `username` | этап 1 |
| `getAuthToken` возвращает `{ token }` | код читает `data.username` | этап 1 |
| `addNewUser` возвращает `void` | код читает `data.token`, `data.username` | этап 1 |
| `editChannel` / `removeChannel` принимают `number` | `Channel.id` — `string` | этап 1 |
| `routes.ts`: `(id)` без типа | неявный `any` | этап 1 |
| `App.tsx`: payload'ы socket без типов | неявный `any` | этап 8 |
| `types/react-jsx-runtime.d.ts` | при `--noImplicitAny` даёт `TS7026` на JSX | этап 0 |
| `classnames` используется, но не объявлен | риск падения после `npm ci` | этап 2 |
| `@eslint/js`, `@types/node` не объявлены | конфиги зависят от транзитивных пакетов | этап 2 |
| `tsconfig.*.tsbuildinfo` отслеживаются git | `tsc -b` пачкает рабочее дерево | этап 0 |
| `src/App.css`, `src/assets/vite.svg` не используются | мусор | этап 9 |
| `utils/rollbarConfig.js` полностью закомментирован | мусор, нет пакета `rollbar` | этап 9 |
| `socket.io` в dependencies | серверный пакет в клиенте | этап 2, опционально |

### 3.4. Что не переносим из `frontend`

- `src/index.js` — заменён на `src/main.tsx`;
- `src/utils/App.test.js`;
- `src/utils/setupTests.js`;
- `src/utils/reportWebVitals.js`;
- `public/index.html`, `public/manifest.json`, `public/robots.txt`;
- `.eslintrc.yml`, `.eslintignore`;
- `build/`;
- CRA-зависимости: `react-scripts`, `@testing-library/*`, `web-vitals` и т.п.;
- `frontend/README.md`, `frontend/Makefile`.

Если тесты понадобятся, они поднимаются отдельной задачей через Vitest, а не копированием CRA-инфраструктуры.

---

## 4. Соглашения

### Импорты

```ts
import type { Channel } from '../../store/types'
import { useGetChannelsQuery } from '../../store/api'
import Messages from './Messages'
```

Не использовать `.js` / `.jsx` в импортах. Не использовать `.ts` / `.tsx` в импортах: `allowImportingTsExtensions` не включён.

### Компоненты

```tsx
interface ComponentProps {
  // ...
}

const Component = ({ ... }: ComponentProps) => (
  // ...
)

export default Component
```

### Типизированные хуки

Создать `src/store/hooks.ts`:

```ts
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

Использовать их вместо `useDispatch()` / `useSelector()` без типов.

### Ошибки

```ts
try {
  // ...
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  // ...
}
```

---

## 5. Типовой контракт

### 5.1. `src/store/types/index.ts`

```ts
export interface UserCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  username: string
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
  body: string
  channelID: string
  username: string
}

export type NewMessage = Pick<Message, 'body' | 'channelID' | 'username'>
```

### 5.2. `src/store/api.ts`

| Эндпоинт | Тип ответа | Тип аргумента |
|---|---|---|
| `getAuthToken` | `AuthResponse` | `UserCredentials` |
| `addNewUser` | `AuthResponse` | `UserCredentials` |
| `getChannels` | `Channel[]` | `void` |
| `addChannel` | `Channel` | `{ name: string }` |
| `editChannel` | `Channel` | `{ id: string; name: string }` |
| `removeChannel` | `void` | `string` |
| `getMessages` | `Message[]` | `void` |
| `addMessage` | `Message` | `NewMessage` |
| `removeMessage` | `void` | `string` |

### 5.3. Nullability

| Сущность | Решение |
|---|---|
| `activeChannel` | `Channel` — инициализируется `defaultChannel`, пустого значения нет |
| `channels` из RTK Query | `Channel[]`, в пропсы передавать `channels ?? []` |
| `messages` из RTK Query | `Message[]`, в пропсы передавать `messages ?? []` |
| `inputEl` | `RefObject<HTMLInputElement \| null>` (React 19) |
| `channelID` в `MessageInput` | `string \| undefined`, при отсутствии не отправлять |
| `modalType.currentChannel` | `Channel \| null`; в `Remove` / `Rename` — guard или discriminated union |
| `document.getElementById('root')` | проверка на `null` |

### 5.4. Типы модалок

`src/components/modals/types.ts`:

```ts
import type { Dispatch, SetStateAction } from 'react'
import type { Channel } from '../../store/types'

export type ModalType = 'adding' | 'removing' | 'renaming'

export interface ModalState {
  type: ModalType | null
  currentChannel: Channel | null
}

export interface ValidationState {
  isInvalid: boolean
  error: string
}

export interface ModalProps {
  modalType: ModalState
  closeModal: () => void
  activeChannnelClick: (channel: Channel) => void
  errorValidation: ValidationState
  setErrorValidation: Dispatch<SetStateAction<ValidationState>>
}
```

Все модалки принимают общий `ModalProps`. `Remove` просто не использует `errorValidation` / `setErrorValidation`; это допустимо и позволяет обойтись без `any` в `modals/index.ts`.

`activeChannnelClick` пока сохраняем с существующим именем (три `n`), чтобы не смешивать миграцию и переименование. Косметическое переименование — отдельным коммитом.

### 5.5. Auth-контекст

`src/auth/contexts.ts`:

```ts
import { createContext } from 'react'

export interface AuthContextValue {
  loggedIn: boolean
  logIn: () => void
  logOut: () => void
  initLoggedIn: () => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export default AuthContext
```

`src/auth/hook.ts`:

```ts
import { useContext } from 'react'
import AuthContext from './contexts'

const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export default useAuth
```

---

## 6. Этапы

### Этап 0. Baseline и рабочие проверки

**Задачи:**

1. Если ветка ещё не создана, создать:
   ```bash
   git switch -c migrate-ts-2026_10_27
   ```
   (исходный план предлагал `migrate-to-ts-2026_10` — имя скорректировано под существующую ветку).
2. Зафиксировать baseline:
   ```bash
   cd frontend-ts
   npx tsc -b --force
   npm run lint
   npm run build
   ```
   На текущем baseline все три команды проходят за счёт `allowJs: true / checkJs: false / strict: false` — это **ложный зелёный** (см. 10.2). Фиксируем только как замер «до правок».
3. Убедиться, что `frontend/` чист:
   ```bash
   git status --short frontend
   git diff --stat frontend
   ```
4. Убрать `tsbuildinfo` из-под контроля git:
   ```bash
   cd frontend-ts
   printf '\n*.tsbuildinfo\n' >> .gitignore
   git rm --cached tsconfig.app.tsbuildinfo tsconfig.node.tsbuildinfo
   ```
5. **Удалить `frontend-ts/types/eslint-plugin-jsx-a11y.d.ts`** (пакет `@types/eslint-plugin-jsx-a11y` уже есть, см. devDependencies). Шим `frontend-ts/types/react-jsx-runtime.d.ts` **не удалять в этапе 0** — он нужен, пока существуют `.jsx`-файлы (см. раздел 10.6 и правку в этапе 9). Шимы `types/assets.d.ts` оставить.
6. **Критично до старта любой миграции:** в `src/main.tsx` исправить
   ```ts
   import App from './App.jsx'
   ```
   на
   ```ts
   import App from './App'
   ```
   Vite по умолчанию разрешает `.jsx` раньше `.tsx`; в репо одновременно лежат `App.tsx` (этап 8) и `.jsx`-остатки этапов 3–7, и без этого фикса возможны тихие регрессии, которые выглядят как «не работает, но без ошибок».
7. Зафиксировать, что **`npx tsc --noEmit` в `frontend-ts` ничего не проверяет**, потому что `tsconfig.json` содержит `"files": []` и `references`. Использовать только `tsc -b` или `tsc -p tsconfig.app.json`.

**Критерий:** `tsc -b`, lint и build проходят; `frontend/` не изменён; `tsbuildinfo` больше не отслеживается; шим JSX сохранён; `main.tsx` импортирует `./App` без расширения.

---

### Этап 1. Типовой контракт и store

Это блокирующий этап. Без него остальные файлы будут типизироваться через `as` и `any`.
На момент правки плана **часть этапа уже сделана**, но не до конца: см. таблицу в разделе 3.0.

**Файлы:**

1. `src/store/types/index.ts` — привести к разделу 5.1. **Текущий файл содержит `Message { text, channelId, token, timestamp }`, нужно заменить на `Message { id, body, channelID, username }` и добавить `AuthResponse`, `NewMessage`.**
2. `src/store/api.ts` — привести к таблице 5.2. **Текущие endpoint'ы используют `id: number` (где нужно `string`) и возвращают `{ token: string }` / `void` (где нужно `AuthResponse`). Кроме того, `addMessage` использует `Partial<Message>` — заменить на `NewMessage`.**
3. `src/store/index.ts`:
   - импорты `import type` там, где нужны только типы;
   - сохранить экспорт `RootState` и `AppDispatch`.
4. `src/store/hooks.ts` — **новый файл** с `useAppDispatch` / `useAppSelector`. Файл отсутствует на текущем baseline.
5. `src/store/Slices/activeChannel.ts` — убрать `defaultChannel as Channel` после типизации `defaultChannel`. **Каст `as Channel` ещё на месте.**
   Во всех `Slices/*.ts` (`channels.ts`, `messages.ts`, `authToken.ts`) заменить `import { T } from '../types'` на `import type { T } from '../types'`.
6. `src/utils/routes.ts`:
   ```ts
   channelsPathWithID: (id: string) => `${API_V1_PATH}/channels/${id}`,
   messagesPathWithID: (id: string) => `${API_V1_PATH}/messages/${id}`,
   ```
   **Файл уже `.ts`, но `(id) =>` без аннотации — неявный `any`.**
7. `src/utils/defaultChannel.ts` — новый файл:
   ```ts
   import type { Channel } from '../store/types'

   const defaultChannel: Channel = {
     id: '1',
     name: 'general',
     removable: false,
   }

   export default defaultChannel
   ```
   Важно: **default export**, иначе сломаются текущие импорты в `activeChannel.ts`, `App.tsx`, `Remove.jsx`.
8. `src/utils/socket.ts` — новый файл:
   ```ts
   import { io } from 'socket.io-client'

   const socket = io()

   export default socket
   ```
   Явная аннотация `Socket` не обязательна, тип выводится.
9. **Опционально:** на этом этапе можно сразу типизировать socket payload'ы в `App.tsx`, чтобы они соответствовали новому `Message`/`Channel` (см. шаблон в этапе 8). Если отложить — ошибки проявятся после этапа 8.
10. Удалить старые `src/utils/defaultChannel.js`, `src/utils/socket.js`, `src/utils/routes.js` (если остался).

**Критерий:**

```bash
npx tsc -b --force
npx tsc -p tsconfig.app.json --noEmit --noImplicitAny
```

На этом этапе `--noImplicitAny` может показывать ошибки в ещё не мигрированных `.jsx` — они не проверяются, но ошибки в `App.tsx` и `routes.ts` должны исчезнуть. Ошибки JSX из-за шима — только после этапа 9 (в этапе 0 шим сохраняется).

---

### Этап 2. Зависимости и конфиги

Этот этап — **критический блокер** для `rm -rf node_modules && npm ci` (Definition of Done). На текущем baseline три пакета уже **используются в коде или конфигах, но не объявлены** — это выявляется только при чистой установке.

**Задачи:**

1. Добавить зависимости:
   ```bash
   cd frontend-ts
   npm i classnames
   npm i -D @eslint/js @types/node
   ```
   - `classnames` используется в `src/components/Channels/Channels.jsx`, но в `dependencies` отсутствует → `npm ci` упадёт.
   - `@eslint/js` импортируется в `eslint.config.ts`, но в `devDependencies` отсутствует → на текущий момент работает за счёт транзитивного `node_modules/hexlet-...`, после чистой установки возможен провал lint.
   - `@types/node` запрошен через `"types": ["node"]` в `tsconfig.node.json`, но в `devDependencies` отсутствует → `tsc -b` упадёт на чистой установке.
2. **`socket.io` уже удалён из `dependencies`** (`git diff` подтверждает). Эта подзадача снята.
3. Проверить, что `package-lock.json` обновился.
4. Конфиг `tsconfig.app.json` пока **не ужесточать**: `allowJs: true`, `checkJs: false`, `strict: false` остаются до этапа 9. На текущем baseline именно эти настройки дают «ложный зелёный» на `tsc -b` / lint / build для не мигрированных `.jsx`. Это **нормально** до этапа 9, но должно быть явно зафиксировано, чтобы не интерпретировать зелёный билд как готовность.
5. Убедиться, что `eslint.config.ts` не ссылается на отсутствующие пакеты.

**Критерий:** `npm run lint` проходит; `npm ls classnames @eslint/js @types/node` показывает все три пакета; `rm -rf node_modules && npm ci` проходит без ошибок.

---

### Этап 3. Локали и assets (листья)

**Файлы:**

1. `src/locales/en/en.js` → `src/locales/en/en.ts`.
2. `src/locales/ru/ru.js` → `src/locales/ru/ru.ts`.
3. `src/locales/index.js` → `src/locales/index.ts`:
   ```ts
   import ru from './ru/ru'
   import en from './en/en'

   const resources = { ru, en } as const

   export default resources
   ```
4. `src/locales/i18n.js` → `src/locales/i18n.ts`, импорт `./index` без расширения.
5. `src/assets/ChannelButtonSVG.jsx` → `src/assets/ChannelButtonSVG.tsx`.
6. `src/assets/MessageInputButtonSVG.jsx` → `src/assets/MessageInputButtonSVG.tsx`.

**Важно:** не типизировать `en` как `typeof ru` — у них разные plural-ключи (`_one/_other` и `_few/_many`). Достаточно `as const` для общего объекта ресурсов.

**Критерий:** `tsc -b`, lint, build; переключение ru/en и интерполяция `{{count}}` работают.

---

### Этап 4. Auth-слой

Порядок важен: `contexts` → `hook` → потребители.

**Файлы:**

1. `src/auth/contexts.jsx` → `src/auth/contexts.ts` (без JSX, поэтому `.ts`).
2. `src/auth/hook.jsx` → `src/auth/hook.ts`.
3. `src/auth/AuthProvider.jsx` → `src/auth/AuthProvider.tsx`:
   - `PropsWithChildren`;
   - `useAppSelector(tokenSelector)`;
   - `localStorage.getItem` возвращает `string | null`.
4. `src/auth/AuthButton.jsx` → `src/auth/AuthButton.tsx`.
5. `src/auth/PrivateRoute.jsx` → `src/auth/PrivateRoute.tsx`:
   - `children: ReactNode`;
   - `Navigate`, `useLocation`.
6. Удалить старые `.jsx` файлы.

**Критерий:** логин/логаут, редирект на `/login`, `AuthButton` работают.

---

### Этап 5. Компоненты ChatBox и Channels

Порядок — от листьев к контейнерам.

**Файлы:**

1. `src/components/ChatBox/Messages.jsx` → `Messages.tsx`:
   ```ts
   interface MessagesProps {
     messages: Message[]
     activeChannel: Channel
   }
   ```
   - `useRef<HTMLDivElement>(null)`;
   - `filter.clean(message.body)`;
   - `channelID`.
2. `src/components/ChatBox/MessageInput.jsx` → `MessageInput.tsx`:
   ```ts
   interface MessageInputProps {
     inputEl: RefObject<HTMLInputElement | null>
     channelID: string | undefined
   }
   ```
   - `useFormik<{ body: string }>`;
   - при `!channelID` или пустом `body.trim()` не отправлять;
   - `catch (err: unknown)`.
3. `src/components/ChatBox/ChatBox.jsx` → `ChatBox.tsx`:
   ```ts
   interface ChatBoxProps {
     messages: Message[]
     activeChannel: Channel
   }
   ```
   - `useRef<HTMLInputElement>(null)`;
   - `filteredMessages` через `useMemo`.
4. `src/components/Channels/Channels.jsx` → `Channels.tsx`:
   ```ts
   interface ChannelsProps {
     channels: Channel[]
     activeChannel: Channel
     onChannelClick: (channel: Channel) => void
     onOpenModal: (type: ModalType, currentChannel?: Channel | null) => void
   }
   ```
   - убрать `console.log`;
   - `cn` из `classnames`.

**Критерий:** сообщения отправляются, фильтруются, скроллятся; каналы переключаются.

---

### Этап 6. Модальные окна

**Порядок:** сначала типы, потом реализации, `index.ts` — последним.

**Файлы:**

1. `src/components/modals/types.ts` — новый файл из раздела 5.4.
2. `src/components/modals/Add.jsx` → `Add.tsx`:
   - `ModalProps`;
   - `useFormik<{ body: string }>`;
   - `data ?? []`;
   - `catch (err: unknown)`;
   - `toast` и `closeModal`.
3. `src/components/modals/Remove.jsx` → `Remove.tsx`:
   - `ModalProps`;
   - guard для `modalType.currentChannel`.
4. `src/components/modals/Rename.jsx` → `Rename.tsx`:
   - `ModalProps`;
   - `modalType.currentChannel` guard;
   - `useFormik<{ body: string }>`.
5. `src/components/modals/index.js` → `index.ts`:
   ```ts
   import type { ComponentType } from 'react'
   import Add from './Add'
   import Remove from './Remove'
   import Rename from './Rename'
   import type { ModalProps, ModalType } from './types'

   const modals: Record<ModalType, ComponentType<ModalProps>> = {
     adding: Add,
     removing: Remove,
     renaming: Rename,
   }

   const getModal = (modalName: ModalType) => modals[modalName]

   export default getModal
   ```
   `any` не использовать: все модалки принимают общий `ModalProps`.
6. Удалить старые `.jsx` / `.js`.

**Критерий:** создание, переименование и удаление канала работают; ошибки валидации отображаются.

---

### Этап 7. Страницы

**Порядок:** `NotFound` → `Login` → `Signup` → `Chat` (Chat последним).

1. `src/Pages/NotFound/NotFound.jsx` → `NotFound.tsx` — без пропсов.
2. `src/Pages/Login/Login.jsx` → `Login.tsx`:
   - `useFormik<UserCredentials>`;
   - `getToken(inputData).unwrap()` или явная проверка `error` (см. раздел 10);
   - `data: AuthResponse`;
   - `isInvalidAuth: boolean`;
   - `catch (err: unknown)`.
3. `src/Pages/Signup/Signup.jsx` → `Signup.tsx`:
   ```ts
   interface SignupValues extends UserCredentials {
     confirmPassword: string
   }
   ```
   - `<Formik<SignupValues> ...>`;
   - `useRef<HTMLInputElement>(null)` + проверка `inputRef.current`;
   - `isErrStatus409(error: unknown): boolean`;
   - `addNewUser(...).unwrap()` или проверка `error`.
4. `src/Pages/Chat/Chat.jsx` → `Chat.tsx`:
   - `useAppDispatch()`;
   - `useState<ModalState>`;
   - `useState<ValidationState>`;
   - `activeChannel: Channel`, без `|| {}`;
   - `channels ?? []`, `messages ?? []`;
   - `const ActiveModal = modalType.type ? getModal(modalType.type) : null`;
   - рендер `{ActiveModal && <ActiveModal ... />}`;
   - проверка 401 через type guard, а не `error?.status`.

**Критерий:** все маршруты, логин, регистрация, чат и модалки работают.

---

### Этап 8. Точки входа

На текущем baseline оба файла уже в `.tsx`, но содержат дефекты — их и нужно закрыть в этом этапе. Подробности в разделе 3.0.

1. `src/App.tsx`:
   - **заменить** `useDispatch()` на `useAppDispatch()` из `./store/hooks.ts` (файл должен появиться в этапе 1);
   - **добавить типы** socket-payload'ов:
     ```ts
     socket.on('newMessage', (payload: Message) => ...)
     socket.on('newChannel', (payload: Channel) => ...)
     socket.on('removeChannel', (payload: { id: string }) => ...)
     socket.on('renameChannel', (payload: { id: string; name: string }) => ...)
     ```
     На текущем baseline все четыре callback'а принимают нетипизированный `payload`.
   - `socket.off()` в cleanup — **уже используется**, проверить только, что он действительно снимает все события, а не ведёт себя как `socket.offAll()`.
2. `src/main.tsx`:
   - **уже исправленный импорт** `'./App.jsx' → './App'` зафиксирован в этапе 0, проверить, что правка присутствует;
   - добавить проверку root-элемента:
     ```ts
     const rootElement = document.getElementById('root')

     if (!rootElement) {
       throw new Error('Root element #root not found')
     }

     ReactDOM.createRoot(rootElement).render(...)
     ```
3. Удалить закомментированный Rollbar-блок из `main.tsx` (этап 9).

**Критерий:** приложение стартует, socket-события обновляют store, ошибок в консоли нет; `tsc -p tsconfig.app.json --noEmit --noImplicitAny` не выдаёт ошибок в `App.tsx` и `main.tsx`.

---

### Этап 9. Ужесточение и зачистка

**Задачи:**

1. Удалить оставшиеся `.js` / `.jsx` после конвертации.
2. Удалить неиспользуемые файлы:
   - `src/App.css`;
   - `src/assets/vite.svg` (если ещё присутствует);
   - `src/utils/rollbarConfig.js`;
   - закомментированный Rollbar-код в `main.tsx` (строки 6, 9, 14, 19–20 на текущем baseline).
3. **Удалить** `types/react-jsx-runtime.d.ts` и `types/eslint-plugin-jsx-a11y.d.ts`. На текущем baseline оба шима ещё на месте; их удаление отложено именно в этот этап, чтобы не сломать lint / TS на этапах 3–8, где `.jsx` ещё присутствуют.
4. В `tsconfig.app.json`:
   ```json
   "allowJs": false,
   "strict": true,
   "noImplicitAny": true
   ```
   - убрать `checkJs`.
   - после включения `strict: true` ожидаемо появятся ошибки `noUnusedLocals` / `noUnusedParameters` на пропсах модалок (например, `Remove` не использует `errorValidation`). **Зафиксировать в `tsconfig.app.json`** смягчение:
     ```json
     "noUnusedLocals": false,
     "noUnusedParameters": false
     ```
     Альтернатива — пробрасывать пропсы через `_`-prefix и подавлять правило для конкретных модалок, но для простоты предпочтительно смягчение. Зафиксировать выбор в разделе «Решения».
5. Опционально включить recommended-правила `@typescript-eslint` в `eslint.config.ts`.
6. **Обновить `frontend-ts/README.md`**: на текущем baseline это всё ещё Vite-шаблон (`# React + TypeScript + Vite` плюс длинные блоки про React Compiler и tseslint configs). Заменить на короткое описание реального проекта:
   - установка: `npm ci` (в корне и в `frontend-ts`);
   - dev: `make dev` из корня (backend на `:5001`, vite на `:5002`);
   - build: `make build` (выход — `frontend-ts/dist`);
   - start: `make start` (production на `:5001`);
   - линтинг: `make lint-ts` / `make lint-fix`;
   - стек: перечислить реальный (React 19, Redux Toolkit Query, i18next, Formik, Bootstrap и т.д.);
   - ссылка на render.com сохраняется.
7. Проверить, что `root package.json` и `Makefile` уже указывают на `frontend-ts`. Корень уже переведён (`scripts.build = npm run build --prefix frontend-ts`, `postinstall = cd frontend-ts && npm ci`). В корневом `Makefile` остались **мёртвые алиасы** на CRA (`make -C frontend start`, `make start-frontend` и т.п., строки 1–14 в комментариях). Не входит в scope строго, но в этом этапе стоит удалить комментарии с фразами «#alias for TS», «# lint: make -C frontend lint», «# start-frontend: make -C frontend start», «# start-backend: npx start-server -s ./frontend/build» — они вводят в заблуждение, если открыть `Makefile` без контекста.
8. Убедиться, что `dist` и `*.tsbuildinfo` не попадают в git.

**Критерий:**

```bash
cd frontend-ts
npx tsc -b --force
npx tsc -p tsconfig.app.json --noEmit --noImplicitAny
npm run lint
npm run build
find src -name '*.js' -o -name '*.jsx'
find . -name '*.tsbuildinfo'
```

`find` не должен ничего вывести.

---

### Этап 10. Финальная проверка

**Команды:**

```bash
cd frontend-ts
npx tsc -b --force
npx tsc -p tsconfig.app.json --noEmit --noImplicitAny
npm run lint
npm run build

cd ..
make dev
make build
make start
```

**Проверить чистую установку:**

```bash
cd frontend-ts
rm -rf node_modules
npm ci
npm run build
```

**Ручной QA:**

- регистрация и логин;
- сохранение `token` и `userName`;
- 401 разлогинивает и редиректит на `/login`;
- создание, переименование и удаление канала;
- realtime-события `newChannel`, `renameChannel`, `removeChannel`;
- отправка сообщения, realtime `newMessage`;
- фильтрация leo-profanity;
- автоскролл к последнему сообщению;
- маршруты `/`, `/login`, `/signup`, `*` → NotFound;
- переключение ru/en;
- production-раздача из `frontend-ts/dist`.

**Проверить, что `frontend/` не изменён:**

```bash
git status --short frontend
git diff --stat frontend
```

Обе команды должны быть пустыми.

---

## 7. Таблица соответствия файлов

| № | Сейчас | Цель | Действие |
|---|---|---|---|
| 1 | `src/utils/socket.js` | `src/utils/socket.ts` | переименовать, типы |
| 2 | `src/utils/defaultChannel.js` | `src/utils/defaultChannel.ts` | переименовать, `Channel`, default export |
| 3 | `src/utils/rollbarConfig.js` | — | удалить |
| 4 | `src/locales/i18n.js` | `src/locales/i18n.ts` | переименовать |
| 5 | `src/locales/index.js` | `src/locales/index.ts` | переименовать, `as const` |
| 6 | `src/locales/en/en.js` | `src/locales/en/en.ts` | переименовать |
| 7 | `src/locales/ru/ru.js` | `src/locales/ru/ru.ts` | переименовать |
| 8 | `src/auth/contexts.jsx` | `src/auth/contexts.ts` | переименовать, типизировать контекст |
| 9 | `src/auth/hook.jsx` | `src/auth/hook.ts` | переименовать, guard |
| 10 | `src/auth/AuthProvider.jsx` | `src/auth/AuthProvider.tsx` | переименовать, `PropsWithChildren` |
| 11 | `src/auth/AuthButton.jsx` | `src/auth/AuthButton.tsx` | переименовать |
| 12 | `src/auth/PrivateRoute.jsx` | `src/auth/PrivateRoute.tsx` | переименовать, `ReactNode` |
| 13 | `src/components/ChatBox/ChatBox.jsx` | `src/components/ChatBox/ChatBox.tsx` | переименовать, пропсы |
| 14 | `src/components/ChatBox/Messages.jsx` | `src/components/ChatBox/Messages.tsx` | переименовать, пропсы |
| 15 | `src/components/ChatBox/MessageInput.jsx` | `src/components/ChatBox/MessageInput.tsx` | переименовать, пропсы |
| 16 | `src/components/Channels/Channels.jsx` | `src/components/Channels/Channels.tsx` | переименовать, пропсы |
| 17 | `src/components/modals/index.js` | `src/components/modals/index.ts` | переименовать, типизировать |
| 18 | `src/components/modals/Rename.jsx` | `src/components/modals/Rename.tsx` | переименовать, пропсы |
| 19 | `src/components/modals/Add.jsx` | `src/components/modals/Add.tsx` | переименовать, пропсы |
| 20 | `src/components/modals/Remove.jsx` | `src/components/modals/Remove.tsx` | переименовать, пропсы |
| 21 | `src/Pages/Login/Login.jsx` | `src/Pages/Login/Login.tsx` | переименовать, Formik |
| 22 | `src/Pages/Signup/Signup.jsx` | `src/Pages/Signup/Signup.tsx` | переименовать, Formik |
| 23 | `src/Pages/NotFound/NotFound.jsx` | `src/Pages/NotFound/NotFound.tsx` | переименовать |
| 24 | `src/Pages/Chat/Chat.jsx` | `src/Pages/Chat/Chat.tsx` | переименовать, модалки |
| 25 | `src/assets/ChannelButtonSVG.jsx` | `src/assets/ChannelButtonSVG.tsx` | переименовать |
| 26 | `src/assets/MessageInputButtonSVG.jsx` | `src/assets/MessageInputButtonSVG.tsx` | переименовать |
| 27 | — | `src/store/hooks.ts` | создать |
| 28 | — | `src/components/modals/types.ts` | создать |
| 29 | `src/App.tsx` | `src/App.tsx` | дотипизировать socket/dispatch |
| 30 | `src/main.tsx` | `src/main.tsx` | root guard, импорт `./App` |
| 31 | `src/store/types/index.ts` | `src/store/types/index.ts` | исправить типы |
| 32 | `src/store/api.ts` | `src/store/api.ts` | исправить типы эндпоинтов |
| 33 | `src/utils/routes.ts` | `src/utils/routes.ts` | `id: string` |

---

## 8. Проверки

### Обязательные команды

```bash
cd frontend-ts

# TypeScript: сборка references
npx tsc -b --force

# TypeScript: жёсткая проверка одного проекта
npx tsc -p tsconfig.app.json --noEmit --noImplicitAny

# Линтер
npm run lint

# Сборка
npm run build
```

### Важно

- `npx tsc --noEmit` в `frontend-ts` **ничего не проверяет** из-за `"files": []` и `references`.
- `npm run build` (`tsc -b && vite build`) не проверяет `.jsx`, пока `allowJs: true` и `checkJs: false`.
- `tsc -b` обновляет `*.tsbuildinfo`; после этапа 0 они не должны быть в git.

### Проверка импортов

```bash
cd frontend-ts

# Не должно остаться импортов с расширениями .js/.jsx
grep -rn "\.jsx\|\.js'" src --include='*.ts' --include='*.tsx'

# Не должно остаться .js/.jsx
find src -name '*.js' -o -name '*.jsx'
```

---

## 9. Definition of Done

- [ ] В `frontend-ts/src` нет `.js` и `.jsx`.
- [ ] `npx tsc -b --force` проходит без ошибок.
- [ ] `npx tsc -p tsconfig.app.json --noEmit --noImplicitAny` проходит без ошибок.
- [ ] `npm run lint` проходит без ошибок.
- [ ] `npm run build` проходит.
- [ ] `rm -rf frontend-ts/node_modules && npm ci && npm run build` проходит на чистой установке.
- [ ] `npm run dev` работает с backend на 5001.
- [ ] `make build` и `make start` работают.
- [ ] Ручной QA из этапа 10 пройден.
- [ ] `git status --short frontend` и `git diff --stat frontend` пустые.
- [ ] `frontend-ts/README.md` описывает реальный проект, а не Vite-шаблон.
- [ ] `*.tsbuildinfo` не отслеживаются git.
- [ ] В `frontend-ts/package.json` объявлены `classnames`, `@eslint/js`, `@types/node` (см. раздел 3.0 — на текущем baseline они используются в коде или конфигах, но не объявлены).
- [ ] `src/main.tsx` импортирует `./App` без расширения (см. этап 0).

---

## 10. Риски и решения

### 10.1. Дублирование модулей и порядок разрешения расширений Vite

Vite по умолчанию разрешает расширения в порядке:

```text
.mjs, .js, .mts, .ts, .jsx, .tsx, .json
```

`.jsx` идёт **раньше** `.tsx`, а `.js` — раньше `.ts`. Если оставить `Chat.jsx` и `Chat.tsx`, импорт `./Chat` возьмёт старый `.jsx`. Если оставить `modals/index.js` и `index.ts`, победит `index.js`.

**Решение:** старый файл удаляется в том же шаге, что и создаётся новый. Не оставлять пары файлов с одинаковым basename.

### 10.2. Ложные «зелёные» проверки

- `npx tsc --noEmit` — no-op из-за `files: []`;
- `tsc -b` не проверяет `.jsx` из-за `checkJs: false`;
- `strict: false` и `noImplicitAny: false` скрывают неявные `any`.

**Решение:** использовать команды из раздела 8; финально включить `strict`, `noImplicitAny`, `allowJs: false`.

### 10.3. Неверные типы API

Если не исправить `store/types` и `store/api` до компонентов, появятся `as` и `any`.

**Решение:** этап 1 блокирующий.

### 10.4. Семантика ошибок RTK Query

Mutation в RTK Query не reject-ит на HTTP-ошибку, а возвращает `{ error }`. Сейчас в `Login` / `Signup` стоит `try/catch`, и на 401 он срабатывает только потому, что обращение к `data.token` падает с `TypeError`. При типизации это станет заметно.

**Решение:** выбрать один вариант и зафиксировать в коде:

- `.unwrap()` — ошибка бросается, `catch` обрабатывает `FetchBaseQueryError`; поведение становится явным;
- явная проверка `error` — без исключений, но с ручной обработкой 401/409.

Рекомендуется `.unwrap()` + аккуратная обработка `unknown`.

### 10.5. Nullability

- `activeChannel` всегда `Channel` благодаря `defaultChannel`;
- не передавать `{}` вместо канала;
- `MessageInput` не отправляет сообщение без `channelID`;
- `Remove` / `Rename` проверяют `modalType.currentChannel`;
- `useRef<HTMLInputElement>(null)` → `RefObject<HTMLInputElement | null>`.

### 10.6. Шим `react/jsx-runtime` — порядок удаления критичен

`types/react-jsx-runtime.d.ts` (`declare module 'react/jsx-runtime' { export * from 'react'; }`) перекрывает типы `react/jsx-runtime` и при `--noImplicitAny` даёт `TS7026` на каждом JSX-элементе. Удалить и проверить, что `@types/react` 19 предоставляет JSX-типы самостоятельно.

**Важно:** шим нужно удалять **после** конвертации всех `.jsx`, иначе на этапах 3–8 (где `.jsx` ещё остаются) сломается lint и TS-проверка под `--noImplicitAny`. В исходном плане удаление стояло в этапе 0 — это ошибка упорядочивания. Правка: шим удаляется в этапе 9 (см. раздел 3.0 и этап 9).

То же касается `types/eslint-plugin-jsx-a11y.d.ts` — он больше не нужен, потому что `@types/eslint-plugin-jsx-a11y` уже в `devDependencies`, но удалять его можно только после этапа 8 (когда ESLint перестанет видеть `.jsx` через `files: ['**/*.{js,jsx,ts,tsx}']` и `eslint.config.ts` соберётся без шима).

### 10.7. `tsbuildinfo` в git

`frontend-ts/tsconfig.app.tsbuildinfo` и `tsconfig.node.tsbuildinfo` отслеживаются. Любой `tsc -b` делает рабочее дерево грязным.

**Решение:** `*.tsbuildinfo` в `.gitignore` + `git rm --cached`.

### 10.8. i18n

У `ru` и `en` разные plural-ключи. Не типизировать `en` как `typeof ru`. Использовать `as const` для общего объекта ресурсов.

### 10.9. Поведение и рефакторинг

Миграция не должна менять UI и логику. Если по ходу находится баг (например, обработка 401), он либо сохраняется с явной пометкой, либо исправляется отдельным коммитом с описанием.

### 10.11. Незаявленные зависимости и чистая установка

На текущем baseline три пакета **используются в коде или конфигах, но не объявлены** в `frontend-ts/package.json`:

- `classnames` — импортируется в `src/components/Channels/Channels.jsx`, отсутствует в `dependencies`;
- `@eslint/js` — импортируется в `eslint.config.ts`, отсутствует в `devDependencies`;
- `@types/node` — запрошен через `"types": ["node"]` в `tsconfig.node.json`, отсутствует в `devDependencies`.

Сейчас это маскируется тем, что нужные пакеты прилетают транзитивно из других зависимостей и из `frontend/node_modules` через плоский layout корня. **`rm -rf frontend-ts/node_modules && npm ci` имеет высокий шанс упасть** на одном из этих трёх пакетов. Снято в этапе 2.

### 10.10. Коммиты

Один коммит на этап:

```text
migrate: type contract and store
migrate: dependencies and configs
migrate: locales and assets
migrate: auth layer
migrate: chat components
migrate: modals
migrate: pages
migrate: app entry
chore: enable strict TS and cleanup
docs: update frontend-ts README
```

Это упрощает откат и review.

---

## 11. Чек-лист прогресса

- [ ] Этап 0. Baseline и рабочие проверки
- [ ] Этап 1. Типовой контракт и store
- [ ] Этап 2. Зависимости и конфиги
- [ ] Этап 3. Локали и assets
- [ ] Этап 4. Auth-слой
- [ ] Этап 5. Компоненты ChatBox и Channels
- [ ] Этап 6. Модальные окна
- [ ] Этап 7. Страницы
- [ ] Этап 8. Точки входа
- [ ] Этап 9. Ужесточение и зачистка
- [ ] Этап 10. Финальная проверка
