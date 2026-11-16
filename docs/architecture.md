# 整體架構與通用設定

最後更新：2026-11-16
狀態：已定案，第一版已實作

各分頁的功能細節見 `breathing.md`、`exercise.md`、`stretching.md`、`habit.md`。

---

## 1. 平台與技術做法

- **第一階段：PWA**。用手機瀏覽器打開、「加到主畫面」，全螢幕使用，可以離線。
- **第二階段**：功能完善後，用 **Capacitor** 把同一份程式包成 iPhone 和 Android App，之後再上架。
- 技術：純 HTML、CSS、JavaScript，不需要建置工具，`app/` 資料夾就是整個 App。
- 跟平台有關的功能（語音、音效、震動、螢幕常亮、儲存）集中在 `core.js` 的平台層 `P` 和 `store`。包成 App 時只要換掉這一層，換成原生外掛。
- PWA 的限制，等包成 App 後就會解除：
  - iPhone 的網頁不能震動，提示以**音效和語音**為主。
  - 每日提醒通知在 PWA 上不可靠，延到 App 版再做。
- 包成 App 時要準備的：
  - Android 在 Windows 上就能打包。
  - iPhone 需要 Mac 或雲端打包服務，加上 Apple 開發者帳號（每年 99 美元）。

### 上線網址
- **https://tokoloshe-benson.github.io/breathe-app/**（GitHub Pages）
- 原始碼：https://github.com/Tokoloshe-Benson/breathe-app（公開）
- 更新方式：`git push` 到 `main` 後，GitHub Actions（`.github/workflows/pages.yml`）會自動把 `app/` 發布出去，約 1 分鐘。推送由架構對話統一處理，各分頁對話只 commit、不推送。

## 2. 資料

- **只存在手機上**（localStorage），不做帳號，也不做雲端同步。
- 設定頁可以**匯出／匯入備份檔**（JSON）。匯入時會覆蓋目前的資料，覆蓋前會再確認一次。
- 每個分頁的資料 key 加上前綴：`ex.`、`st.`、`hb.` 等。

### 練習紀錄（`log`，所有分頁共用）

```
{ t: 時間戳, type: 'breath'|'ex'|'st', name, sec: 總秒數,
  mood?: 1–5, note?: 備註（目前只有呼吸）, ...各分頁自己的欄位 }
```

- 完成練習後自動存一筆紀錄。習慣分頁依這些紀錄自動打勾。
- 心情可以事後在「練習紀錄」頁補選；呼吸的備註也可以事後補寫。

## 3. 共用功能與設定

| 功能 | 做法 |
|---|---|
| 外觀 | 淺色／深色／跟隨系統 |
| 語音提示 | 開或關；聲音可選**女聲**（HsiaoChen）或**男聲**（YunJhe）。預錄語音檔在 `app/audio/`，可以離線使用；沒有預錄的詞會用手機內建語音 |
| 音效 | 全 App 共用的開關 |
| 震動 | 全 App 共用的開關，只在 Android 有效 |
| 螢幕常亮 | 練習中自動開啟 |
| 完成畫面 | 共用。可以選 5 個心情表情（Microsoft Fluent Emoji 3D），也可以跳過。呼吸另外有可不填的備註欄 |
| 練習紀錄頁 | 依日期列出，可以篩選分類，點開某一筆可以補選心情和備註。入口在習慣分頁和設定頁 |
| 連續天數、月曆 | 在習慣分頁 |
| 每日提醒 | 延到 App 版 |

## 4. 導覽與視覺風格

### 導覽
- 底部分頁列分四格：`呼吸 ｜ 運動 ｜ 拉伸 ｜ 習慣`。
- 設定在習慣分頁右上角的 ⚙️。
- 練習進行中改成全螢幕畫面，分頁列隱藏。

### 視覺風格
- 字體：**圓體**（Chiron GoRound TC）。第一次打開時下載，之後存在手機上。
- 三種風格按分頁分配，但整體要像同一個 App，**不能像拼湊出來的**：
  - **列表頁**：四個分頁共用暖米白底（#F7F5F0）、字體、圓角、卡片和分頁列，只換主色。
  - **練習中**：全螢幕，背景淡入各分頁的主題色，完整呈現各自的風格。

| 分頁 | 風格 | 主色 | 深色模式底色 |
|---|---|---|---|
| 呼吸 | 深色沉靜 | 靛紫 | 夜空靛紫 |
| 運動 | 活潑能量 | 珊瑚橘（略降飽和） | 炭火暖棕 |
| 拉伸 | 柔和放鬆 | 薄荷綠 | 森林深綠 |
| 習慣 | 中性 | 灰，並用三色點標示三種練習 | 炭灰 |

- 深色模式下，每個分頁有自己的深色底，但明暗度相近；分頁列在四個分頁都是同一條近黑色。

## 5. 程式結構與分工

```
app/
  index.html        外框：分頁列、練習全螢幕
  sw.js             離線快取（本站檔案先抓網路最新版；字體、表情圖先用快取）
  css/style.css     共用樣式      css/<分頁>.css   各分頁樣式
  js/core.js        共用核心      js/<分頁>.js     各分頁程式
  js/log.js         練習紀錄頁    js/settings.js   設定頁   js/main.js 啟動
  audio/            預錄語音（f 女聲／m 男聲，運動在 audio/ex/）
```

- 每個分頁只改自己的 `js/<分頁>.js` 和 `css/<分頁>.css`。共用檔由架構對話維護。
- 每完成一個功能就用 git 存一個存檔點，只加入自己改的檔案。
- 在電腦上測試：在專案資料夾執行 `python -m http.server 5173 --directory app`，再打開 http://localhost:5173。語音檔需要透過伺服器開啟，直接開檔案載不到。

### 共用 API（`js/core.js`）
- `registerTab(key, render)`：註冊分頁，key 為 `breath`／`ex`／`st`／`hb`
- `store.get/set`、`S`（設定）
- `P.say`、`P.beep`、`P.buzz`、`P.wake`
- `showPlay`、`hidePlay`、`countdown`、`play.restart`／`play.end`
- `addLog`、`setLogMood`、`setLogNote`、`LOG()`
- `doneScreen`、`moodImg`、`moodRow`、`bindMood`、`openLog`（`log.js`）
- `isDark`、`fmt`、`render`、`go`

## 6. 版本範圍

### 第一版（已完成）
- 四個分頁的第一版功能，細節見各分頁規格
- 共用完成畫面和心情、練習紀錄頁
- 深淺色模式、語音（男聲、女聲）、音效、震動、螢幕常亮
- 加到主畫面、離線可用、匯出／匯入備份

### 之後再做
- 動作示意圖（運動、拉伸）
- 拉伸的預錄語音
- 運動完成後的備註
- 熱度圖、徽章、休息卡、統計圖表
- 每日提醒（App 版）
- 用 Capacitor 包成 iPhone 和 Android App
