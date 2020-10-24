// 引用 linebot 機器人套件
import linebot from 'linebot'
// 引用 dotenv 環境設定套件
import dotenv from 'dotenv'
// 引用 axios
import axios from 'axios'
// 引用 node-schedule
import schedule from 'node-schedule'

// 讀取 .env 檔案
dotenv.config()

// 設定 node-scheule 甚麼時候要資料
let exhubitions = []
const updateData = async () => {
  const response = await axios.get('https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=6')
  exhubitions = response.data
}
// 每天 0 點去要資料
schedule.scheduleJob('* * 0 * * *', () => {
  updateData()
})

updateData()
// 設定機器人的資訊
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

// 當收到訊息時
// linebot 有許多事件可以觸發，詳情請見 https://www.npmjs.com/package/linebot
bot.on('message', async event => {
  try {
    let reply = ''
    // 機器人接收搜尋訊息
    const searchText = event.message.text
    // 迭代資料
    exhubitions.forEach(element => {
      if (element.title === searchText) {
        reply = element.showInfo[0].locationName
      }
    })
    reply = reply.length === 0 ? '找不到資料' : reply
    // 機器人回應訊息
    event.reply(reply)
  } catch (error) {
    event.reply('發生錯誤')
  }
})

// 在 port 3000 啟動，設定 / 跟目錄即可
bot.listen('/', process.env.PORT, () => {
  console.log('機器人已啟動')
})
