const mineflayer = require('mineflayer');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalBlock, GoalNear } = goals;
const fs = require('fs');
const path = require('path');

// ----------------------------------------------------------------空投玩家白名单读取----------------------------------------
// 从文件中读取玩家列表
const filePath = path.join(__dirname, 'ReplenishList.txt');
let players = [];

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件时发生错误:', err);
    return;
  }

  players = data.split('\n').map(line => line.trim()).filter(line => line.startsWith('<') && line.endsWith('>')).map(line => line.slice(1, -1));
  console.log('玩家列表:', players);
});

// ----------------------------------------------------------------白名单读取 end--------------------------------

const bot = mineflayer.createBot({
  host: '222.187.238.102', 
  username: 'xin游商官方服务站2', 
  port: 25565, 
  version: '1.20.1', 
});
//回来修改为读取同目录下txt文件离线账密登录
bot.loadPlugin(pathfinder);


// 提供控制命令部分的变量
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
// ----------------------------控制命令spam变量--------------------------------
let isSpamming = false;
let spamMessages = []; // 用于存储从文件读取的消息
let currentMessageIndex = 0;
let public_ad = 0;
let public_rest = 0;
let spamInterval;
let spamWList = [];
const spamMessagesPath = path.join(__dirname, 'spammer.txt');
// ---------------------------spam变量 end------------------------
////////////////////////////////读取spam文件////////////////////////////////////////////////////////////////
function loadSpamMessages() {
  fs.readFile(spamMessagesPath, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取 spammer.txt 文件:', err);
      return;
    }
    spamMessages = data.split('\n').map(line => line.trim()).filter(line => line); // 读取消息并过滤掉空行
    console.log('成功加载 spammer.txt 文件中的消息！');
  });
}
const spamWListPath = './SpamWList.txt';

fs.readFile(spamWListPath, 'utf8', (err, data) => {
  if (err) {
    console.error('读取 SpamWList.txt 文件时发生错误:', err);
    return;
  }
  spamWList = data.split('\n').map(line => line.trim()).filter(line => line.startsWith('<') && line.endsWith('>')).map(line => line.slice(1, -1));
  console.log('宣传白名单列表:', spamWList);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

loadSpamMessages();
////////////////////////////////////////spam///////////////////////////////////
function startSpamming() {
  if (isSpamming) {
    console.log('Spamming 已经在运行中');
    return;
  }
  isSpamming = true;
  spamInterval = setInterval(() => {
    // 从所有玩家中排除在 spamWList 中的玩家和机器人本身
    const eligiblePlayers111 = Object.keys(bot.players).filter(playerName => playerName !== bot.username && !spamWList.includes(playerName));
    if (eligiblePlayers111.length > 0 && spamMessages.length > 0) {
      const randomPlayer = eligiblePlayers111[Math.floor(Math.random() * eligiblePlayers111.length)];
      bot.chat(`/w ${randomPlayer} ${spamMessages[currentMessageIndex]}`);
	  if(public_rest >= 10){bot.chat(`${spamMessages[currentMessageIndex]}`);public_rest=0;}
      currentMessageIndex = (currentMessageIndex + 1) % spamMessages.length;
	  public_rest += 1;
    }
  }, 3000); // 每3秒发送一次（可调）
  console.log('Spamming 已启用');
}

// 停止 spam 功能
function stopSpamming() {
  if (!isSpamming) {
    console.log('Spamming 功能尚未启用');
    return;
  }
  clearInterval(spamInterval);
  isSpamming = false;
  console.log('Spamming 已停止');
}//////////////////////////////////////////控制↓//////////////////////////////////////////////////////////
rl.on('line', (input) => {
  const args = input.split(' ');
  const command = args[0];

  switch (command) {
    case 'inventory':
      bot.inventory.items().forEach((item, index) => {
        const slot = bot.inventory.slots.findIndex(s => s && s.type === item.type);
        console.log(`Item: ${item.name}, Count: ${item.count}, Slot: ${slot}`);
      });
      break;
    case 'title':
      console.log(bot.title);
      break;
    case 'use':
      setTimeout(() => {
        bot.activateItem();
        bot.deactivateItem();
      }, 200);
      break;
    case 'switch':
      const itemName = args[1];
      const item = bot.inventory.items().find(i => i.name === itemName);
      if (item) {
        bot.equip(item, 'hand');
        console.log(`Switched to ${itemName}`);
      } else {
        console.log(`Item ${itemName} not found`);
      }
      break;
    case 'slot':
      const slot = parseInt(args[1], 10);
      if (!isNaN(slot) && slot >= 0 && slot <= 8) {
        bot.setQuickBarSlot(slot);
        console.log(`Switched to slot ${slot}`);
      } else {
        console.log('0 - 8！');
      }
      break;
    case 'chat':
      const message = args.slice(1).join(' ');
      bot.chat(message);
      break;
      case 'goto':
        const x = parseFloat(args[1]);
        const y = parseFloat(args[2]);
        const z = parseFloat(args[3]);
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          const mcData = require('minecraft-data')(bot.version);
          const defaultMove = new Movements(bot, mcData);
          bot.pathfinder.setMovements(defaultMove);
          bot.pathfinder.setGoal(new GoalBlock(x, y, z));
        } else {
          console.log('错误的坐标格式！请输入goto x y z ');
        }
        break;
      case 'Pos':
        const pos = bot.entity.position;
        const dimension = bot.game.dimension; 
        console.log(`Pos: ${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}`);
        console.log(`DIM: ${dimension}`);
        break;
    case 'others':
      const players = Object.values(bot.players).map(player => {
        if (player.entity) {
          const distance = bot.entity.position.distanceTo(player.entity.position).toFixed(2);
          return { id: player.username, distance: distance };
        }
      }).filter(player => player); // 过滤掉 undefined 的玩家刷屏
      console.log('Nearby players:', players);
      break;
    case 'list':
        const onlinePlayers111 = Object.keys(bot.players);
        if (onlinePlayers111.length > 0) {
          console.log('在线玩家List：');
          onlinePlayers111.forEach(playerName => {
            console.log(playerName);
          });
        } else {
          console.log('未成功查询到在线玩家');
        }
      break;
        case 'spam':
          const spamCommand = args[1];
          if (spamCommand === 'on') {
            startSpamming();
          } else if (spamCommand === 'off') {
            stopSpamming();
          } else {
            console.log('未知spam命令格式. 使用 "spam on" 或 "spam off" 控制开关');
          }
          break;
    default:
      console.log('未知命令！');
  }
});

bot.once('spawn', () => {
  console.log('================================================================');
  console.log('Using YS Post Bot in Server:2b2t.xin!');

  console.log('YS Post Bot Version:0.1.0');
  console.log('服务群: 970439774');
  console.log('运营者: zb0bs');
  console.log('================================================================');
 
  mineflayerViewer(bot, { port: 3003 });
  console.log(`ChunkViewer 已经在本地3003端口打开>>> http://localhost:3003`);

  //  -------------------------------------------------- 登录服=>主服--------------------------------------------------
  setTimeout(() => {
	  bot.chat('/l uuuUUUuuu');//bot2密码
    //bot.chat('/l ys*12*sy'); // 密码输入
  }, 3000);

  setTimeout(() => {
    bot.setQuickBarSlot(2); // 切换到第三格
    bot.activateItem(); // 使用物品
    bot.deactivateItem(); // 停止使用物品（没啥用）
  }, 6000); // 延迟6秒
});

// -----------------------------------------------------自动答题AutoQueue--------------------------------------------------
let QueueCondition111 = false;
 
bot.on('actionBar', (text) => {
  const newText111 = text.toString().trim();
  
  // 更新 QueueCondition111 状态
  if (newText111.startsWith('Position in queue:')) {
    if (['1', '2', '3'].includes(newText111.split(': ')[1])) {
      QueueCondition111 = false;
    } else {
      QueueCondition111 = true;
    }
  }
});

bot.on('message', (message) => {
  const newMessage111 = message.toString().trim();
  
  if (QueueCondition111 && newMessage111.startsWith('红石火把信号有几格?')) {
    if (newMessage111.includes('A.15')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.15')) {
      bot.chat('B');
    } else if (newMessage111.includes('C')) {
      bot.chat('C');
    }
  }
  if (QueueCondition111 && newMessage111.startsWith('爬行者被闪电击中后会变成什么?')) {
    if (newMessage111.includes('A.高压爬行者')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.高压爬行者')) {
      bot.chat('B');
    } else if (newMessage111.includes('C.高压爬行者')) {
      bot.chat('C');
    }
  }
  if (QueueCondition111 && newMessage111.startsWith('无限水至少需要几格空间?')) {
    if (newMessage111.includes('A.3')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.3')) {
      bot.chat('B');
    } else if (newMessage111.includes('C.3')) {
      bot.chat('C');
    }
  }
  if (QueueCondition111 && newMessage111.startsWith('凋灵死后会掉落什么?')) {
    if (newMessage111.includes('A.下界之星')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.下界之星')) {
      bot.chat('B');
    } else if (newMessage111.includes('C.下界之星')) {
      bot.chat('C');
    }
  }
  if (QueueCondition111 && newMessage111.startsWith('挖掘速度最快的镐子是什么?')) {
    if (newMessage111.includes('A.金镐')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.金镐')) {
      bot.chat('B');
    } else if (newMessage111.includes('C.金镐')) {
      bot.chat('C');
    }
  }
  if (QueueCondition111 && newMessage111.startsWith('定位末地要塞至少需要几颗末影之眼?')) {
    if (newMessage111.includes('A.0')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.0')) {
      bot.chat('B');
    } else if (newMessage111.includes('C.0')) {
      bot.chat('C');
    }
  }
  if (QueueCondition111 && newMessage111.startsWith('定位末地遗迹至少需要几颗末影之眼?')) {
    if (newMessage111.includes('A.0')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.0')) {
      bot.chat('B');
    } else if (newMessage111.includes('C.0')) {
      bot.chat('C');
    }
  }
  if (QueueCondition111 && newMessage111.startsWith('猪被闪电击中后会变成什么?')) {
    if (newMessage111.includes('A.僵尸猪人')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.僵尸猪人')) {
      bot.chat('B');
    } else if (newMessage111.includes('C.僵尸猪人')) {
      bot.chat('C');
    }
  }
  if (QueueCondition111 && newMessage111.startsWith('定位末地要塞至少需要几颗末影之眼?')) {
    if (newMessage111.includes('A.0')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.0')) {
      bot.chat('B');
    } else if (newMessage111.includes('C.0')) {
      bot.chat('C');
    }
  }
  if (QueueCondition111 && newMessage111.startsWith('南瓜的生长是否需要水?')) {
    if (newMessage111.includes('A.不需要')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.不需要')) {
      bot.chat('B');
    } 
  }
  if (QueueCondition111 && newMessage111.startsWith('羊驼会主动攻击人吗?')) {
    if (newMessage111.includes('A.不会')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.不会')) {
      bot.chat('B');
    }
  }
  if (QueueCondition111 && newMessage111.startsWith('本服务器开服年份？')) {
    if (newMessage111.includes('A.2020')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.2020')) {
      bot.chat('B');
    } else if (newMessage111.includes('C.2020')) {
      bot.chat('C');
    }
  }
  if (QueueCondition111 && newMessage111.startsWith('小箱子能储存多少格物品?')) {
    if (newMessage111.includes('A.27')) {
      bot.chat('A');
    } else if (newMessage111.includes('B.27')) {
      bot.chat('B');
    } else if (newMessage111.includes('C.27')) {
      bot.chat('C');
    }
  }

});


// ----------------------------------------------------------------自动答题AutoQueue End----------------------------------------------------------------
// ----------------------------------------------------------------自动空投-----------------------------------------------------------------------------

bot.once('spawn', () => {
  const defaultMove = new Movements(bot);
  bot.pathfinder.setMovements(defaultMove);
});
bot.on('whisper', async (username, message) => {
  if (players.includes(username) && message === '#Getkit') {
    bot.whisper(username, 'preparing');
    await moveAndExecute(username);
  }
});
async function moveAndExecute(username) {
  // 起始位置
  const startPos = bot.entity.position.clone();

  await bot.pathfinder.goto(new GoalNear(startPos.x - 3, startPos.y, startPos.z - 1, 1));

  let itemsTaken = await takeShulkerBoxes('AuroraPVPKIT', 14);

  if (itemsTaken < 14) {
    await bot.pathfinder.goto(new GoalNear(startPos.x - 3, startPos.y, startPos.z + 6, 1));
    itemsTaken += await takeShulkerBoxes('AuroraPVPKIT', 14 - itemsTaken);

    // 回到原位置
    await bot.pathfinder.goto(new GoalNear(startPos.x - 3, startPos.y, startPos.z - 1, 1));
  }

  // 仍然不够，输出“库存不足”
  if (itemsTaken < 14) {
    console.log("库存不足");
  }
  bot.whisper(username, 'Step 1');

  // Step 2:
  await bot.pathfinder.goto(new GoalNear(startPos.x + 1, startPos.y, startPos.z - 2, 1));

  // 找到最近的箱子矿车并放入潜影盒
  await depositShulkerBoxes();

  await bot.pathfinder.goto(new GoalNear(startPos.x + 2, startPos.y, startPos.z - 3, 1));

  bot.whisper(username, 'Step 2');

  // 回到最开始位置
  await bot.pathfinder.goto(new GoalNear(startPos.x, startPos.y, startPos.z, 1));
}
async function takeShulkerBoxes(itemName, count) {
  let itemsTaken = 0;

  const chestsToTakeFrom = bot.findBlocks({
    matching: block => bot.registry.blocksByName.chest.id === block.type,
    maxDistance: 6,
    count: 2
  });

  for (const chestPosition of chestsToTakeFrom) {
    const chest = await bot.openContainer(bot.blockAt(chestPosition));

    for (const item of chest.containerItems()) {
      if (item.name === itemName) {
        const amountToTake = Math.min(item.count, count - itemsTaken);
        await chest.withdraw(item.type, item.metadata, amountToTake);
        itemsTaken += amountToTake;
        if (itemsTaken >= count) break;
      }
    }

    chest.close();
    if (itemsTaken >= count) break;
  }

  return itemsTaken;
}

async function depositShulkerBoxes() {
  const minecartChest = bot.findBlock({
    matching: block => bot.registry.blocksByName.minecart_with_chest.id === block.type,
    maxDistance: 6
  });

  if (!minecartChest) {
    bot.chat('No minecart chest found to deposit items!');
    return;
  }

  const chest = await bot.openContainer(minecartChest);

  for (const item of bot.inventory.items()) {
    if (item.name === 'AuroraPVPKIT') {
      await chest.deposit(item.type, item.metadata, item.count);
    }
  }

  chest.close();
}



//仍不可用


//  ----------------------------------------------------------------自动空投 end----------------------------------------------------------------
// 错误处理
bot.on('error', (err) => {
  console.error('Error:', err);
});

bot.on('kicked', (reason, loggedIn) => {
  console.error('Kicked:', reason, loggedIn);
});

bot.on('end', () => {
  console.log('Bot disconnected');
});
// --------------------------------输出信息--------------------------------
// 使用messagestr事件监听并打印来自非玩家实体的信息
let lastActionBarText = '';
let lastTitleText = '';
let lastSubTitleText = '';
let lastMessageText = '';


bot.on('messagestr', (message) => {
  const newMessage = message.toString().trim();
  if (newMessage !== lastMessageText) {
    lastMessageText = newMessage;
    console.log(`[Message] ${newMessage}`); 
  }
});

bot.on('title', (text) => {
  const newText = text.toString().trim();
  if (newText !== lastTitleText) {
    lastTitleText = newText;
    console.log(`[Title] ${newText}`); 
  }
});
bot.on('subtitle', (text) => {
  const newText = text.toString().trim();
  if (newText !== lastSubTitleText) {
    lastSubTitleText = newText;
    console.log(`[Subtitle] ${newText}`); 
  }
});

bot.on('actionBar', (text) => {
  const newText = text.toString().trim();
  if (newText !== lastActionBarText) {
    lastActionBarText = newText;
    console.log(`[ActionBar] ${newText}`); 
  }
});

// 监听私聊
bot.on('whisper', (username, message) => {
  console.log(`[Whisper] ${username}: ${message}`); 
});
// --------------------------------输出信息 end --------------------------------