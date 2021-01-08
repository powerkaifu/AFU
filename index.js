// 引用 linebot 機器人套件，https://www.npmjs.com/package/linebot
import linebot from 'linebot'
// 引用 dotenv 環境設定套件，https://www.npmjs.com/package/dotenv
import dotenv from 'dotenv'
// 引用 axios 套件，https://www.npmjs.com/package/axios
import axios from 'axios'
// 引用 node-schedule 套件，https://www.npmjs.com/package/node-schedule
import schedule from 'node-schedule'

// 讀取 .env 環境變數檔案
dotenv.config()

// 設定 node-scheule 甚麼時候更新資料
let exhubitions = []
const updateData = async () => {
  const res = await axios.get('https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=6')
  exhubitions = res.data
}

// 秒(0-59)、分(0-59)、時(0-23)、日(1-31)、月(1-12)、星期(0-7)(0 or 7 是星期日)
// 這裡指每天 0 點更新資料
schedule.scheduleJob('* * 0 * * *', () => {
  updateData()
})

// 機器人剛開始時需要資料
updateData()

// 設定機器人的資訊
// 使用 dotenv.process 存取 CHANNEL_ID、CHANNEL_SECRET、CHANNEL_ACCESS_TOKEN
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
    // 機器人接收的訊息
    const searchText = event.message.text
    // 迭代取得的資料
    exhubitions.forEach(elm => {
      if (elm.title === searchText) {
        reply = elm.showInfo[0].locationName
      }
    })
    reply = reply.length === 0 ? '找不到資料' : reply
    // 讓機器人回應收到的訊息
    event.reply(reply)
  } catch (error) {
    event.reply('發生錯誤!')
  }
})

// 在 port 3000 啟動，設定 / 跟目錄即可
bot.listen('/', process.env.PORT, () => {
  console.log('機器人已啟動')
})
