# 🎯 Kingshot 戰術壓秒集結計算器 (Rally Sync Timer)

專為 **Kingshot** 等策略手遊（SLG）之據點戰、奇觀戰所設計的壓秒集結計時工具。透過精準推算發起集結時間，讓多支集結部隊在同一秒抵達目標，打出無縫連續攻擊（壓秒集結），不給防守方任何補兵與治療的空間。

---

## ⚡ 核心功能特色

1. **雙作戰計時模式切換**：
   - 🎯 **模式一：指定「目標撞擊時間」**（由抵達時間反推所有隊長發起時間，全隊同一秒撞擊據點）。
   - 🚀 **模式二：指定「第一隊發起時間」**（行軍時間最久的隊長於指定時間首發，自動推算所有隊伍同時撞擊的時間與其他隊伍發起時間）。
   - 預設集結等待時間為 **5 分鐘**（支援自訂 1 分鐘、3 分鐘、10 分鐘或個別隊伍覆寫）。
2. **雙時區即時時鐘**：
   - 頂部大字體即時顯示 **當前遊戲 UTC 時間** 與 **設備本地時間**，方便即時核對秒數。
3. **即時倒數與狀態監控**：
   - 即時倒數每一位隊長的發起時間，標註 `🚀 首發隊伍` 與各隊微調秒數。
   - 動態狀態標籤：`準備中` ➔ `🔥 即將發起` ➔ `等待出發中` ➔ `行軍中` ➔ `已撞擊完成`。
4. **手機觸控專用步進器 (▲/▼) 與一鍵對齊**：
   - 支援鍵盤輸入、上下箭頭點擊或長按快速連續調整（加速滾動）。
   - 提供「重設為目前時間」按鈕，秒級對齊當前 UTC 伺服器時間。
5. **一鍵複製發布作戰指令**：
   - 提供 **遊戲盟頻精簡版**、**Discord / LINE 美化排版版**、**含本地時間對照版**。
6. **戰術分享連結 (Shareable URL)**：
   - 一鍵產生包含所有隊伍設定的網址，發送給盟友打開即可同步查看倒數。
7. **本地保存預設組**：
   - 自動將資料儲存於瀏覽器 LocalStorage，並可保存「太陽城隊伍」、「據點A組」等自訂預設配置。
8. **批次匯入功能**：
   - 支援快速貼上整份名單（如 `隊長A 20`、`隊長B 1:15`）。

---

## 📐 計算公式

### 模式一：指定目標撞擊時間 $T_{\text{hit}}$
$$\text{發起集結時間} = T_{\text{hit}} - \text{行軍時間} - \text{集結等待時間}$$

### 模式二：指定第一隊發起時間 $L_{\text{first}}$
$$\text{最大行軍總耗時} = \max_i(\text{集結等待時間}_i + \text{行軍時間}_i)$$
$$\text{目標撞擊時間} = L_{\text{first}} + \text{最大行軍總耗時}$$
$$\text{各隊發起集結時間} = \text{目標撞擊時間} - (\text{集結等待時間}_i + \text{行軍時間}_i)$$

### 範例：
- 目標撞擊時間：`22:50:00 UTC`
- 集結等待時間：`5 分鐘 (300 秒)`
- **隊長 A** 行軍時間 `20 秒`：
  - 發起集結時間：`22:44:40 UTC`
  - 出發時間：`22:49:40 UTC`
- **隊長 B** 行軍時間 `40 秒`：
  - 發起集結時間：`22:44:20 UTC`
  - 出發時間：`22:49:20 UTC`

---

## 🚀 如何部署到 GitHub Pages

本專案為 **純前端架構（HTML5 + CSS3 + Vanilla JavaScript）**，無需安裝 Node.js 或任何後端伺服器，直接託管於 GitHub Pages 即可永久免費使用。

### 步驟說明：

1. **建立 GitHub Repository（倉庫）**：
   - 前往 [GitHub](https://github.com/) 登入後，點擊右上角 `+` > **New repository**。
   - 輸入倉庫名稱（例如 `ks_timer` 或 `kingshot-rally-timer`）。
   - 設定為 **Public**，點擊 **Create repository**。

2. **將本地專案上傳至 GitHub**：
   打開終端機（Terminal），進入本專案資料夾：
   ```bash
   cd /Users/baohueih/Desktop/ks_timer

   # 初始化 Git
   git init
   git add .
   git commit -m "feat: initial commit for Kingshot rally sync timer"

   # 關聯至您的 GitHub 倉庫並推送 (將 USERNAME 與 REPO 換成您的)
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```

3. **啟用 GitHub Pages**：
   - 進入您的 GitHub 倉庫頁面，點擊上方的 **Settings**（設定）。
   - 在左側選單點擊 **Pages**。
   - 在 **Build and deployment** > **Branch** 下方：
     - 將分支選擇為 `main`。
     - 資料夾選擇 `/(root)`。
     - 點擊 **Save**。
   - 等待約 1~2 分鐘重新整理，上方即會出現網址：  
     `https://<你的GitHub帳號>.github.io/<倉庫名稱>/`

4. 打開該網址即可在手機、平板或電腦隨時使用！
