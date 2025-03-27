<p align="center">
  <img width="250" height="250" src="https://raw.githubusercontent.com/museofficial/muse/master/.github/logo.png">
</p>

> [!WARNING]
> 我 ([@codetheweb](https://github.com/codetheweb)) 已經不是 Muse 的要維護者。 **如果你使用的是 Docker Image，請更新你的來源至 `ghcr.io/museofficial/muse`。** 我們目前仍然在同時發布 `ghcr.io/museofficial/muse` 和 `codetheweb/muse`，但未來可能有所改變。
> 感謝所有人幫助維護 Muse！

UnOfficial Fork, this is **Traditional Chinese** Translation Version!

------

Muse 是一個**備受好評的中西部自架版** Discord 音樂機器人 **並且不爛**。這製作用於小型到中型大小的 Discord 伺服器（把它想成，你與你朋友，你朋友與你朋友）。

![Hero graphic](.github/hero.png)

## 特色

- 🎥 直播
- ⏩ 跳到指定歌曲／影片的位置
- 💾 本地端快取以獲得更好的效能
- 📋 沒有投票跳過 - 這是無政府的，不是民主
- ↔️ 自動轉換來自 Spotify 的播放清單、作曲家、專輯、歌曲
- ↗️ 使用者可以添加自訂的短指令（aliases）
- 1️⃣ Muse 支持多伺服器
- 🔊 標準化跨曲音量控制
- ✍️ 使用 TypeScript 編寫，容易擴展
- ❤️ 忠誠的 Packers 粉絲

## 運行

Muse 使用 TypeScript 編寫。你可以使用 Docker（推薦）或是直接通過 Node.js 來運行。兩種方式都 API 金鑰作為環境變數傳入：

- `DISCORD_TOKEN` 可以在[這裡](https://discordapp.com/developers/applications)獲取，通過創建一個「New Application」，然後轉到 'Bot' 選項。
- `SPOTIFY_CLIENT_ID` 和 `SPOTIFY_CLIENT_SECRET` 可以在[這裡](https://developer.spotify.com/dashboard/applications) 的「Create a Client ID」中獲取。（可選的）
- `YOUTUBE_API_KEY` 可以在[創建一個新的專案](https://console.developers.google.com)，Google的開發者終端，啟用 Youtube API（YouTube Data API v3），並創建一個 API 金鑰在憑證下方。

Muse 在運行時將會顯示 URL 在記錄中。在瀏覽器中打開 URL 來邀請 Muse 到你的伺服器。加入伺服器後，Muse 將會私訊伺服器擁有者有關於設定相關的教學。

需要使用 64 位元作業系統來運行 Muse。

### 版本號

`master` 分支是開發 / 前沿測試分支，不保證穩定性。

當你正在運行一個生產實例環境，我推薦你使用[最新發布版](https://github.com/museofficial/muse/releases/)。

### 🐳 Docker

有多種可用的映像檔標籤可用（繁體中文版不適用以下內容）：
- `:2`: 版本 >= 2.0.0
- `:2.1`: 版本 >= 2.1.0 和 < 2.2.0
- `:2.1.1`: 精確版本
- `:latest`: 無論最新版是甚麼

（用正確的值替換空的設定字串。）

```bash
docker run -it -v "$(pwd)/data":/data -e DISCORD_TOKEN='' -e SPOTIFY_CLIENT_ID='' -e SPOTIFY_CLIENT_SECRET='' -e YOUTUBE_API_KEY='' ghcr.io/xmikux/muse:latest
```

這會啟動 Muse，並創建一個 data 資料夾在你目前的資料夾位置。

你也可以將你的令牌儲存在環境變數檔案中，並讓其存在於容器之中，預設下，容器將會尋找 `/config` 中的環境變數檔案。你可以透過設定環境變數 `ENV_FILE` 來更改路徑，例如與 [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/) 一起使用。 

**Docker Compose**:

```yaml
services:
  muse:
    image: ghcr.io/xmikux/muse:latest
    restart: always
    volumes:
      - ./muse:/data
    environment:
      - DISCORD_TOKEN=
      - YOUTUBE_API_KEY=
      - SPOTIFY_CLIENT_ID=
      - SPOTIFY_CLIENT_SECRET=
```

### Node.js

**前置**:
* Node.js（需要版本 18.17.0 或最新的 18.xx.xx，推薦使用最新的 18.x.x LTS 版本）（選擇版本 18 是因為依賴 opus）
* ffmpeg（4.1 版本或更高）

1. `git clone https://github.com/museofficial/muse.git && cd muse`
2. 複製 `.env.example` 成 `.env` 並填入相應的值
3. 我建議使用 `git checkout v[最新版本標籤]` 來使用一個固定版本
4. `yarn install`（或 `npm i`）
5. `yarn start`（或 `npm run start`）

**注意**: 如果你正在使用 Windows，你可能需要手動設定 ffmpeg 路徑。詳情請參閱 [#345](https://github.com/museofficial/muse/issues/345)。

## ⚙️ 附加配置選項 (進階)

### 緩存

預設情況下，Muse 將總緩存大小限制在 2GB 左右。如果你想要變更這個，請設定環境變數 `CACHE_LIMIT`。例如，`CACHE_LIMIT=512MB` 或 `CACHE_LIMIT=10GB`。

### SponsorBlock

Muse 可以跳過 YouTube 音樂影片開頭或結尾的非音樂部分（使用 [SponsorBlock](https://sponsor.ajay.app/)）。這個功能預設是禁用的。如果你想啟用它，請將環境變數 `ENABLE_SPONSORBLOCK=true` 設定為 `true`，或在 `.env` 檔案中取消註解這一行。
作為一個社群專案，伺服器可能會因為停機或過載而無法正常運作。當發生這種情況時，Muse 會暫時跳過對 SponsorBlock 的請求幾分鐘。你可以通過設置 `SPONSORBLOCK_TIMEOUT` 的值來更改跳過的時長。

### 自訂機器人狀態

預設狀態下，Muse 會有狀態 "線上" 和文字訊息 "正在聽 音樂"。你可以透過更改環境變數來更改狀態：

- `BOT_STATUS`:
  - `online` （線上）
  - `idle` （閒置）
  - `dnd` （請勿打擾）

- `BOT_ACTIVITY_TYPE`:
  - `PLAYING` (正在玩 XYZ)
  - `LISTENING` (正在聽 to XYZ)
  - `WATCHING` (正在看 XYZ)
  - `STREAMING` (直播 XYZ)

- `BOT_ACTIVITY`: 與狀態類型一起的文字訊息

- `BOT_ACTIVITY_URL` 如果你正在使用 `STREAMING` 狀態類型，你必須設定這個變數，不然它將不會運作！在這裡通常是寫 YouTube 或 Twitch 直播連結。

#### 範例

**Muse 正在看電影並且是請勿打擾**:
- `BOT_STATUS=dnd`
- `BOT_ACTIVITY_TYPE=WATCHING`
- `BOT_ACTIVITY=電影`

**Muse 正在直播 Monstercat**:
- `BOT_STATUS=online`
- `BOT_ACTIVITY_TYPE=STREAMING`
- `BOT_ACTIVITY_URL=https://www.twitch.tv/monstercat`
- `BOT_ACTIVITY=Monstercat`

### 機器人 全局性指令

如果你的 Muse 在多個伺服器上運行（10+），你會想要轉換到註冊全域性指令而不是每個伺服器。（缺點是指令更新將需要長達一小時才會完成）要將指令設定成全域性，設定環境變數 `REGISTER_COMMANDS_ON_BOT` 成 `true` 即可。

### 有人講話時自動降低音樂音量

你可以透過指令設定機器人當有人在講話時自動降低音量：

- `/config set-reduce-vol-when-voice true` - 啟用自動音量降低
- `/config set-reduce-vol-when-voice false` - 停用自動音量降低
- `/config set-reduce-vol-when-voice-target <volume>` - 設定當有人講話時所降低的目標音量（0-100，預設為 70）
