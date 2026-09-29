// src/chat.ts
import { getLanguage } from './system';
import { settings } from './menu';

type ChatMessageData = {
  text: string;
  type: 'sent' | 'received';
  silent?: boolean;
  isDate?: boolean;
};
const chatHistories: Record<string, ChatMessageData[]> = {};
let chatHistoriesInitialized = false;

function initChatHistories(lang: string) {
  if (chatHistoriesInitialized) return;
  chatHistories['work'] = [
    { text: lang === 'RU' ? '10 июня' : 'June 10', type: 'received', silent: true, isDate: true },
    { text: lang === 'RU' ? 'Напоминаю про дедлайн' : 'Reminder about the deadline', type: 'received', silent: true },
    { text: lang === 'RU' ? 'Понял' : 'Got it', type: 'sent', silent: true },
    { text: lang === 'RU' ? 'Сегодня' : 'Today', type: 'received', silent: true, isDate: true },
    { text: lang === 'RU' ? 'Отчеты ждем до 10:00' : 'Waiting for reports by 10:00', type: 'received', silent: true },
  ];
  chatHistories['mom'] = [
    { text: lang === 'RU' ? 'Вчера' : 'Yesterday', type: 'received', silent: true, isDate: true },
    { text: lang === 'RU' ? 'Привет, как дела?' : 'Hi, how are you?', type: 'received', silent: true },
    { text: lang === 'RU' ? 'Позвони как будет время' : 'Call me when you have time', type: 'received', silent: true },
  ];
  chatHistories['friend'] = [];
  chatHistoriesInitialized = true;
}

let isCutsceneActive = false;
let cutsceneSpeedMultiplier = 1;

function playSfx(path: string) {
  const sfx = new Audio(path);
  sfx.volume = (settings.sfxVolume / 100) * (settings.masterVolume / 100);
  sfx.play().catch(() => {});
}

export function openWhatisUp(): void {
  const screen = document.getElementById('phoneScreen');
  if (!screen) return;

  const lang = getLanguage();
  
  let appContainer = document.getElementById('whatisupApp');
  if (appContainer) {
      appContainer.style.display = 'flex';
      setTimeout(() => appContainer!.style.opacity = '1', 10);
      return;
  }

  appContainer = document.createElement('div');
  appContainer.id = 'whatisupApp';
  appContainer.className = 'app-full-screen';
  appContainer.style.cssText = `
    position: absolute; inset: 0; background: #000; z-index: 500;
    display: flex; flex-direction: column; color: #fff;
    font-family: 'Inter', sans-serif; opacity: 0; transition: opacity 0.3s ease;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    height: 100px; padding-top: 40px; display: flex; align-items: center;
    padding-left: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
    background: rgba(10,10,10,0.9); backdrop-filter: blur(10px);
  `;
  header.innerHTML = `<h1 style="font-size: 1.5rem; font-weight: 700;">WhatisUp</h1>`;
  appContainer.appendChild(header);

  const chatList = document.createElement('div');
  chatList.id = 'chatList';
  chatList.style.cssText = `flex: 1; overflow-y: auto; padding: 10px 0;`;
  
  initChatHistories(lang);
  const getLastMsg = (id: string, defaultMsg: string) => {
    const history = chatHistories[id];
    if (history && history.length > 0) {
      const msgs = history.filter(m => !m.isDate);
      if (msgs.length > 0) return msgs[msgs.length - 1].text;
    }
    return defaultMsg;
  };

  const chats = [
    { id: 'friend', name: lang === 'RU' ? 'Друг' : 'Friend', lastMsg: getLastMsg('friend', ''), time: '07:10', online: true },
    { id: 'work', name: lang === 'RU' ? 'Рабочий чат' : 'Work Group', lastMsg: getLastMsg('work', lang === 'RU' ? 'Отчеты ждем до 10:00' : 'Waiting for reports by 10:00'), time: 'Вчера', online: false },
    { id: 'mom', name: lang === 'RU' ? 'Мама' : 'Mom', lastMsg: getLastMsg('mom', lang === 'RU' ? 'Позвони как будет время' : 'Call me when you have time'), time: 'Вчера', online: false },
  ];

  chats.forEach(chat => {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.style.cssText = `
      display: flex; padding: 15px 20px; align-items: center; gap: 15px;
      cursor: pointer; transition: background 0.2s;
    `;
    chatItem.innerHTML = `
      <div style="width: 50px; height: 50px; border-radius: 50%; background: #333; display: flex; align-items: center; justify-content: center; position: relative;">
        ${chat.name[0]}
        ${chat.online ? '<div id="status-dot-' + chat.id + '" style="position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #4CAF50; border-radius: 50%; border: 2px solid #000;"></div>' : ''}
      </div>
      <div style="flex: 1;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="font-weight: 600;">${chat.name}</span>
          <span style="font-size: 0.8rem; opacity: 0.5;">${chat.time}</span>
        </div>
        <div id="last-msg-${chat.id}" style="font-size: 0.9rem; opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">
          ${chat.lastMsg}
        </div>
      </div>
    `;
    
    chatItem.addEventListener('click', () => {
      if (isCutsceneActive) return;
      openChat(chat.name, chat.id === 'friend', chat.id);
    });

    chatList.appendChild(chatItem);
  });

  appContainer.appendChild(chatList);
  
  const homeBar = document.createElement('div');
  homeBar.id = 'whatisupHomeBar';
  homeBar.style.cssText = `height: 40px; display: flex; justify-content: center; align-items: center; cursor: pointer;`;
  homeBar.innerHTML = `<div style="width: 120px; height: 5px; background: #555; border-radius: 5px;"></div>`;
  homeBar.addEventListener('click', () => {
    if (isCutsceneActive) return;
    appContainer!.style.opacity = '0';
    setTimeout(() => appContainer!.style.display = 'none', 300);
  });
  appContainer.appendChild(homeBar);

  screen.appendChild(appContainer);
  setTimeout(() => appContainer!.style.opacity = '1', 10);
}

export function openFriendChatDirectly(): void {
  openWhatisUp();
  setTimeout(() => {
    const lang = getLanguage();
    openChat(lang === 'RU' ? 'Друг' : 'Friend', true, 'friend');
  }, 120);
}

export function openClimaxFriendChat(): void {
  openWhatisUp();
  setTimeout(() => {
    const lang = getLanguage();
    openChat(lang === 'RU' ? 'Друг' : 'Friend', true, 'friend', true);
  }, 120);
}

export async function openChat(name: string, isFriend: boolean, chatId: string, isClimax: boolean = false): Promise<void> {
  const appContainer = document.getElementById('whatisupApp');
  if (!appContainer || document.getElementById('chatView')) return;

  const lang = getLanguage();
  initChatHistories(lang);
  if (isClimax) {
    if (!chatHistories['friend']) {
      chatHistories['friend'] = [];
    }
    chatHistories['friend'].push(
      { text: lang === 'RU' ? 'Сегодня' : 'Today', type: 'received', silent: true, isDate: true }
    );
  }
  const chatView = document.createElement('div');
  chatView.id = 'chatView';
  chatView.style.cssText = `
    position: absolute; inset: 0; background: #000; z-index: 600;
    display: flex; flex-direction: column; transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    height: 100px; padding-top: 40px; display: flex; align-items: center;
    padding-left: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);
    background: rgba(10,10,10,0.9); backdrop-filter: blur(10px);
  `;
  
  const backBtn = document.createElement('div');
  backBtn.id = 'chatBackBtn';
  backBtn.style.cssText = `padding: 10px; cursor: pointer; font-size: 1.5rem;`;
  backBtn.innerText = '←';
  
  const headerContent = document.createElement('div');
  headerContent.style.cssText = `display: flex; align-items: center;`;
  headerContent.innerHTML = `
    <div style="width: 40px; height: 40px; border-radius: 50%; background: #333; margin: 0 10px; display: flex; align-items: center; justify-content: center;">${name[0]}</div>
    <div>
      <div style="font-weight: 600;">${name}</div>
      <div id="friendStatus" style="font-size: 0.7rem; color: ${isFriend ? '#4CAF50' : '#888'};">
        ${isFriend ? 'online' : (lang === 'RU' ? 'был(а) недавно' : 'last seen recently')}
      </div>
    </div>
  `;
  
  header.appendChild(backBtn);
  header.appendChild(headerContent);
  chatView.appendChild(header);

  const messages = document.createElement('div');
  messages.id = 'chatMessagesArea';
  messages.style.cssText = `
    flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  `;
  const style = document.createElement('style');
  style.textContent = `#chatMessagesArea::-webkit-scrollbar { display: none; }`;
  document.head.appendChild(style);
  
  // Load messages from history
  if (chatHistories[chatId]) {
    chatHistories[chatId].forEach(msgData => {
      const msg = createMessage(msgData.text, msgData.type, true);
      if (msgData.isDate) {
        msg.style.background = 'transparent';
        msg.style.alignSelf = 'center';
        msg.style.opacity = '0.5';
      }
      messages.appendChild(msg);
    });
  }

  chatView.appendChild(messages);
  // scroll to bottom initially
  setTimeout(() => { messages.scrollTop = messages.scrollHeight; }, 10);

  const inputArea = document.createElement('div');
  inputArea.style.cssText = `padding: 20px; background: rgba(10,10,10,0.9); display: flex; gap: 10px; border-top: 1px solid rgba(255,255,255,0.1);`;
  
  const input = document.createElement('input');
  input.id = 'chatInput';
  input.type = 'text';
  input.placeholder = lang === 'RU' ? 'Сообщение' : 'Message';
  input.style.cssText = `flex: 1; background: #222; border: none; border-radius: 20px; padding: 10px 15px; color: #fff; font-family: inherit; outline: none;`;
  
  let lastLen = 0;
  input.addEventListener('input', () => {
    if (isCutsceneActive) return;
    const currentLen = input.value.length;
    if (currentLen > lastLen) playSfx('/assets/sounds/sfx/intro/whatisup/type.wav');
    else if (currentLen < lastLen) playSfx('/assets/sounds/sfx/intro/whatisup/type_delete.wav');
    lastLen = currentLen;
  });
  
  const sendBtn = document.createElement('button');
  sendBtn.id = 'chatSendBtn';
  sendBtn.innerText = lang === 'RU' ? 'Отпр.' : 'Send';
  sendBtn.style.cssText = `background: transparent; border: none; color: #007AFF; font-weight: 600; cursor: pointer;`;

  const sendMessage = (text?: string, silent: boolean = false) => {
    const msgText = text || input.value.trim();
    if (msgText) {
      if (!silent) playSfx('/assets/sounds/sfx/intro/whatisup/send_message.wav');
      messages.appendChild(createMessage(msgText, 'sent', silent));
      chatHistories[chatId].push({ text: msgText, type: 'sent', silent: true });
      input.value = '';
      lastLen = 0;
      messages.scrollTop = messages.scrollHeight;
      
      // Update lastMsg in chatList
      const lastMsgEl = document.getElementById(`last-msg-${chatId}`);
      if (lastMsgEl) lastMsgEl.innerText = msgText;
    }
  };

  sendBtn.addEventListener('click', () => !isCutsceneActive && sendMessage());
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isCutsceneActive) sendMessage();
  });

  inputArea.appendChild(input);
  inputArea.appendChild(sendBtn);
  chatView.appendChild(inputArea);
  appContainer.appendChild(chatView);

  setTimeout(() => chatView.style.transform = 'translateX(0)', 10);

  backBtn.addEventListener('click', () => {
    if (isCutsceneActive) return;
    chatView.style.transform = 'translateX(100%)';
    setTimeout(() => chatView.remove(), 300);
  });

  if (isFriend && !isCutsceneActive) {
    const statusEl = headerContent.querySelector('#friendStatus') as HTMLElement;
    const isActuallyOffline = statusEl.innerText.includes('recently') || statusEl.innerText.includes('недавно');
    
    if (isClimax) {
      statusEl.innerText = 'online';
      statusEl.style.color = '#4CAF50';
      runClimaxBranchingFriendCutscene(messages, input, statusEl, chatView);
    } else if (isActuallyOffline) {
        // Friend is offline, make him online
        statusEl.innerText = lang === 'RU' ? 'печатает...' : 'typing...';
        statusEl.style.color = '#4CAF50';
        
        // Add back status dot if it was removed
        let statusDot = document.getElementById('status-dot-friend');
        if (!statusDot) {
            const avatar = headerContent.querySelector('div') as HTMLElement;
            statusDot = document.createElement('div');
            statusDot.id = 'status-dot-friend';
            statusDot.style.cssText = `position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #4CAF50; border-radius: 50%; border: 2px solid #000;`;
            avatar.style.position = 'relative';
            avatar.appendChild(statusDot);
        } else {
            statusDot.style.background = '#4CAF50';
        }
        
        setTimeout(() => {
            statusEl.innerText = 'online';
            runFriendCutscene(messages, input, statusEl);
        }, 2000);
    } else {
        runFriendCutscene(messages, input, statusEl);
    }
  }
}

async function runFriendCutscene(msgArea: HTMLElement, input: HTMLInputElement, statusEl: HTMLElement) {
  isCutsceneActive = true;
  cutsceneSpeedMultiplier = 1;
  input.readOnly = true; 
  const lang = getLanguage();
  
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms / cutsceneSpeedMultiplier));
  
  const typeText = async (text: string) => {
    input.value = '';
    input.placeholder = lang === 'RU' ? 'Печатайте на клавиатуре...' : 'Type on keyboard...';
    let currentIdx = 0;
    
    await new Promise<void>((resolve) => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (cutsceneSpeedMultiplier > 1) return;
        
        // Ignore modifiers and system keys
        if (e.key.length > 1 && e.key !== 'Enter' && e.key !== 'Backspace' && e.key !== ' ') return;
        
        if (currentIdx < text.length) {
          if (e.key !== 'Enter') {
            e.preventDefault();
            input.value += text[currentIdx];
            currentIdx++;
            playSfx('/assets/sounds/sfx/intro/whatisup/type.wav');
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          finishTyping();
        }
      };

      const handleSendClick = () => {
         if (currentIdx >= text.length && cutsceneSpeedMultiplier === 1) {
            finishTyping();
         }
      };

      const finishTyping = () => {
        document.removeEventListener('keydown', handleKeyDown);
        const sendBtn = document.getElementById('chatSendBtn');
        if (sendBtn) sendBtn.removeEventListener('click', handleSendClick);
        input.placeholder = lang === 'RU' ? 'Сообщение' : 'Message';
        resolve();
      };

      document.addEventListener('keydown', handleKeyDown);
      const sendBtn = document.getElementById('chatSendBtn');
      if (sendBtn) sendBtn.addEventListener('click', handleSendClick);

      const autoType = async () => {
        while (currentIdx < text.length) {
          if (cutsceneSpeedMultiplier > 1) {
            input.value += text[currentIdx];
            currentIdx++;
            playSfx('/assets/sounds/sfx/intro/whatisup/type.wav');
            await wait((Math.random() * 150 + 100) / 2.5);
          } else {
            await wait(100);
          }
        }
        if (cutsceneSpeedMultiplier > 1) {
          await wait(500);
          finishTyping();
        }
      };
      autoType();
    });

    playSfx('/assets/sounds/sfx/intro/whatisup/send_message.wav');
    const msgText = input.value;
    msgArea.appendChild(createMessage(msgText, 'sent'));
    chatHistories['friend'].push({ text: msgText, type: 'sent', silent: true });
    const lastMsgEl = document.getElementById('last-msg-friend');
    if (lastMsgEl) lastMsgEl.innerText = msgText;
    input.value = '';
    msgArea.scrollTop = msgArea.scrollHeight;
  };

  const friendReply = async (text: string, delay: number = 2000) => {
    statusEl.innerText = lang === 'RU' ? 'печатает...' : 'typing...';
    statusEl.style.color = '#888';
    await wait(delay);
    msgArea.appendChild(createMessage(text, 'received'));
    chatHistories['friend'].push({ text: text, type: 'received', silent: true });
    const lastMsgEl = document.getElementById('last-msg-friend');
    if (lastMsgEl) lastMsgEl.innerText = text;
    statusEl.innerText = 'online';
    statusEl.style.color = '#4CAF50';
    msgArea.scrollTop = msgArea.scrollHeight;
  };

  await wait(1333);
  await typeText(lang === 'RU' ? 'привет' : 'hi');
  await wait(1000);
  await typeText(lang === 'RU' ? 'слушай ты давно заходил в проект AVALON?' : 'listen have you been in the AVALON project lately?');
  await wait(1666);
  await friendReply(lang === 'RU' ? 'ого ты еще помнишь про него' : 'wow you still remember that', 2000);
  await wait(1000);
  await friendReply(lang === 'RU' ? 'я думал ты забил после того случая' : 'i thought you quit after that incident', 1666);
  await wait(1333);
  await typeText(lang === 'RU' ? 'я нашел кое-какие странные архивы в папке' : 'i found some strange archives in the folder');
  await wait(1000);
  await typeText(lang === 'RU' ? 'они выглядят как зашифрованные логи' : 'they look like encrypted logs');
  await wait(2000);
  await friendReply(lang === 'RU' ? 'забудь про это' : 'just forget about it', 1333);
  await wait(666);
  await friendReply(lang === 'RU' ? 'серьезно не копайся там' : 'seriously dont dig in there', 1666);
  await wait(1333);
  await typeText(lang === 'RU' ? 'почему? ты знаешь что в них' : 'why? do you know whats in them');
  await wait(2666);
  await friendReply(lang === 'RU' ? 'я не хочу иметь с этим проблем' : 'i dont want any trouble with this', 2666);
  await wait(1000);
  await friendReply(lang === 'RU' ? 'и тебе не советую' : 'and you shouldnt either', 1333);
  await wait(1333);
  await typeText(lang === 'RU' ? 'просто скажи это опасно' : 'just tell me is it dangerous');
  await wait(3333);
  await friendReply(lang === 'RU' ? 'я сейчас занят, поговорим позже' : 'im busy right now, talk later', 3333);
  await wait(1000);
  await friendReply(lang === 'RU' ? 'удали всё что нашел ради своего же блага' : 'delete everything you found for your own good', 2000);

  // Friend goes offline
  await wait(2000);
  statusEl.innerText = lang === 'RU' ? 'был(а) недавно' : 'last seen recently';
  statusEl.style.color = '#888';
  const statusDot = document.getElementById('status-dot-friend');
  if (statusDot) statusDot.style.background = '#888';

  // Return control for 1s
  isCutsceneActive = false;
  await wait(1000);

  // Forced exit from chat
  const appContainer = document.getElementById('whatisupApp');
  if (appContainer) {
      appContainer.style.opacity = '0';
      setTimeout(() => appContainer.remove(), 1000);
  }
  
  await wait(1000);
  
  // Show subtitles
  const phoneScreen = document.getElementById('phoneScreen');
  const subtitle = document.createElement('div');
  subtitle.style.cssText = `
    position: absolute; bottom: 25%; left: 16px; right: 16px; text-align: center;
    color: #38bdf8; font-family: 'Segoe UI', sans-serif; font-size: 1rem;
    font-weight: 600; z-index: 20000; text-shadow: 0 2px 10px rgba(0,0,0,0.9);
    background: rgba(8, 14, 26, 0.94); padding: 10px 16px; border-radius: 8px;
    border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 4px 20px rgba(0,0,0,0.8);
    box-sizing: border-box; pointer-events: none; line-height: 1.4;
  `;
  if (phoneScreen) {
      phoneScreen.appendChild(subtitle);
  } else {
      document.body.appendChild(subtitle);
  }
  
  subtitle.innerText = lang === 'RU' ? 'Друг знает слишком много...' : 'Friend knows too much...';
  await wait(2000);
  subtitle.innerText = lang === 'RU' ? 'Нужно разузнать, что происходит...' : 'Need to find out what\'s happening...';
  await wait(3000);
  subtitle.remove();

  // Screen blackout
  const screen = document.getElementById('phoneScreen');
  if (screen) {
      screen.style.transition = 'background 2s linear';
      screen.style.background = '#000';
  }
  await wait(2000);
  
  // Transition to Desktop
  import('./desktop').then(m => m.initWindowsDesktop());
  
  isCutsceneActive = false;
  input.readOnly = false;
}

export function updateGoal(text: string) {
    const goalEl = document.getElementById('goalNotify');
    if (goalEl) {
        const goalTextEl = goalEl.querySelector('.goal-text');
        if (goalTextEl) (goalTextEl as HTMLElement).innerText = text;
        goalEl.classList.add('visible');
    }
}

function createMessage(text: string, type: 'sent' | 'received', silent: boolean = false): HTMLElement {
  const msg = document.createElement('div');
  msg.style.cssText = `
    max-width: 80%; padding: 10px 15px; border-radius: 18px; font-size: 0.95rem;
    ${type === 'sent' ? 'align-self: flex-end; background: #007AFF; color: #fff; border-bottom-right-radius: 4px;' : 'align-self: flex-start; background: #222; color: #fff; border-bottom-left-radius: 4px;'}
  `;
  msg.innerText = text;
  
  if (type === 'received' && !silent) {
    playSfx('/assets/sounds/sfx/intro/whatisup/receive_message.wav');
  }

  return msg;
}

/**
 * Act 2 Grand Climax with 3 Endings:
 * 1. Illusion & Dream
 * 2. Betrayal & Stolen Project
 * 3. Psychosis & Descent into Madness
 */
async function runClimaxBranchingFriendCutscene(
  msgArea: HTMLElement,
  input: HTMLInputElement,
  statusEl: HTMLElement,
  chatView: HTMLElement
) {
  isCutsceneActive = true;
  input.readOnly = true;
  const lang = getLanguage();
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  const typeText = async (text: string) => {
    input.value = '';
    input.placeholder = lang === 'RU' ? 'Печатайте на клавиатуре...' : 'Type on keyboard...';
    let currentIdx = 0;

    await new Promise<void>((resolve) => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.length > 1 && e.key !== 'Enter' && e.key !== 'Backspace' && e.key !== ' ') return;
        if (currentIdx < text.length) {
          if (e.key !== 'Enter') {
            e.preventDefault();
            input.value += text[currentIdx];
            currentIdx++;
            playSfx('/assets/sounds/sfx/intro/whatisup/type.wav');
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          finish();
        }
      };

      const handleSendClick = () => {
        if (currentIdx >= text.length) finish();
      };

      const finish = () => {
        document.removeEventListener('keydown', handleKeyDown);
        const sendBtn = document.getElementById('chatSendBtn');
        if (sendBtn) sendBtn.removeEventListener('click', handleSendClick);
        input.placeholder = lang === 'RU' ? 'Сообщение' : 'Message';
        resolve();
      };

      document.addEventListener('keydown', handleKeyDown);
      const sendBtn = document.getElementById('chatSendBtn');
      if (sendBtn) sendBtn.addEventListener('click', handleSendClick);

      // Automated typing progression with blips
      const autoType = async () => {
        while (currentIdx < text.length) {
          input.value += text[currentIdx];
          currentIdx++;
          playSfx('/assets/sounds/sfx/intro/whatisup/type.wav');
          await wait(55 + Math.random() * 45);
        }
        await wait(400);
        finish();
      };
      autoType();
    });

    playSfx('/assets/sounds/sfx/intro/whatisup/send_message.wav');
    const msgText = input.value;
    msgArea.appendChild(createMessage(msgText, 'sent'));
    chatHistories['friend'].push({ text: msgText, type: 'sent', silent: true });
    const lastMsgEl = document.getElementById('last-msg-friend');
    if (lastMsgEl) lastMsgEl.innerText = msgText;
    input.value = '';
    msgArea.scrollTop = msgArea.scrollHeight;
  };

  const friendReply = async (text: string, delay: number = 1800) => {
    statusEl.innerText = lang === 'RU' ? 'печатает...' : 'typing...';
    statusEl.style.color = '#888';
    await wait(delay);
    msgArea.appendChild(createMessage(text, 'received'));
    chatHistories['friend'].push({ text: text, type: 'received', silent: true });
    const lastMsgEl = document.getElementById('last-msg-friend');
    if (lastMsgEl) lastMsgEl.innerText = text;
    statusEl.innerText = 'online';
    statusEl.style.color = '#4CAF50';
    msgArea.scrollTop = msgArea.scrollHeight;
  };

  // 1. Initial Confrontation: Friend initiates with suspicious questions, Hero demands answers
  await wait(1400);
  await friendReply(lang === 'RU' ? 'ты еще не спишь? как там проект?' : 'are you still awake? how is the project going?', 1800);
  await wait(1000);
  await typeText(lang === 'RU' ? 'почему в архиве AVALON был троян Wacatac?' : 'why was there a Wacatac trojan inside the AVALON archive?');
  await wait(1400);
  await friendReply(lang === 'RU' ? 'ты... ты открыл архив? зачем ты полез в ядро?' : 'you... you opened the archive? why did you touch the core?', 2400);
  await wait(1000);
  await typeText(lang === 'RU' ? 'хватит вопросов! ты знал про этот вирус? отвечай прямо!' : 'stop the questions! did you know about this virus? answer me straight!');
  await wait(1400);
  await friendReply(lang === 'RU' ? 'слушай... я надеялся, что этот день никогда не наступит...' : 'listen... i was hoping this day would never come...', 2600);
  await wait(1000);
  await typeText(lang === 'RU' ? 'что ты скрываешь от меня все это время?!' : 'what have you been hiding from me all this time?!');
  await wait(1400);
  await friendReply(lang === 'RU' ? 'на самом деле... всё совсем не так, как ты помнишь. я должен тебе кое в чём признаться.' : 'actually... nothing is what you remember. i have to confess something to you.', 3000);

  // 2. Choice Selection Screen inside WhatisUp (Rendered globally over phone with 100% clickability)
  await wait(1000);
  isCutsceneActive = false; // Allow button clicks!
  input.readOnly = true;

  // Add extra padding to msgArea so the last message scrolls nicely ABOVE the choice container!
  msgArea.style.paddingBottom = '220px';
  msgArea.style.scrollBehavior = 'smooth';
  setTimeout(() => {
    msgArea.scrollTop = msgArea.scrollHeight;
  }, 50);

  const phoneScreen = document.getElementById('phoneScreen');
  const pRect = phoneScreen ? phoneScreen.getBoundingClientRect() : { left: (window.innerWidth - 400) / 2, bottom: window.innerHeight - 50, width: 400 };

  const choiceContainer = document.createElement('div');
  choiceContainer.id = 'climaxChoiceContainer';
  choiceContainer.style.cssText = `
    position: fixed;
    left: ${pRect.left + 12}px;
    width: ${pRect.width - 24}px;
    bottom: ${window.innerHeight - pRect.bottom + 15}px;
    display: flex; flex-direction: column; gap: 7px; padding: 12px 14px;
    background: rgba(10, 15, 30, 0.96); border: 1px solid rgba(56, 189, 248, 0.6);
    backdrop-filter: blur(12px);
    box-shadow: 0 -10px 30px rgba(0,0,0,0.9), 0 0 25px rgba(56, 189, 248, 0.25);
    border-radius: 14px;
    z-index: 2147483647; animation: fadeIn 0.3s ease;
    max-height: 230px; overflow-y: auto; pointer-events: auto;
  `;

  const titleChoice = document.createElement('div');
  titleChoice.style.cssText = `font-size: 0.72rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;`;
  titleChoice.innerText = lang === 'RU' ? 'ВЫБЕРИТЕ РЕПЛИКУ:' : 'CHOOSE YOUR RESPONSE:';
  choiceContainer.appendChild(titleChoice);

  const choices = [
    {
      id: 1,
      textRU: '1. «Объясни нормально, что происходит.»',
      textEN: '1. "Explain clearly what is going on."',
      color: '#38bdf8'
    },
    {
      id: 2,
      textRU: '2. «Ты знал про этот вирус с самого начала?»',
      textEN: '2. "Did you know about this virus from the start?"',
      color: '#fbbf24'
    },
    {
      id: 3,
      textRU: '3. «Почему ты скрывал это от меня?»',
      textEN: '3. "Why did you keep this secret from me?"',
      color: '#f87171'
    }
  ];

  choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.cssText = `
      background: rgba(255, 255, 255, 0.06); border: 1px solid ${ch.color};
      color: #fff; padding: 9px 12px; border-radius: 8px; font-size: 0.82rem;
      text-align: left; cursor: pointer; transition: all 0.2s; user-select: none;
      line-height: 1.35; position: relative; z-index: 2147483647; pointer-events: auto;
      word-break: break-word;
    `;
    btn.innerText = lang === 'RU' ? ch.textRU : ch.textEN;
    btn.onmouseover = () => { btn.style.background = `${ch.color}35`; btn.style.transform = 'translateX(4px)'; };
    btn.onmouseout = () => { btn.style.background = 'rgba(255, 255, 255, 0.06)'; btn.style.transform = 'none'; };
    
    // Support both click and mousedown
    const triggerChoice = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      isCutsceneActive = true;
      choiceContainer.remove();
      handleEndingPath(ch.id);
    };

    btn.addEventListener('click', triggerChoice);
    btn.addEventListener('mousedown', triggerChoice);
    choiceContainer.appendChild(btn);
  });

  document.body.appendChild(choiceContainer);
  msgArea.scrollTop = msgArea.scrollHeight;

  const handleEndingPath = async (branchId: number) => {
    msgArea.style.paddingBottom = '20px';

    if (branchId === 1) {
      // Ending 1: Illusion, Coma, Liquid Melting Ink Drip, Flash & Awakening
      await typeText(lang === 'RU' ? 'объясни нормально, что вообще происходит?!' : 'explain clearly, what is going on?!');
      await wait(1200);
      await friendReply(lang === 'RU' ? 'меня никогда не существовало в реальности.' : 'i never existed in reality.', 2400);
      await wait(1000);
      await typeText(lang === 'RU' ? 'что за бред?! мы же общались каждый день!' : 'what nonsense?! we talked every single day!');
      await wait(1200);
      await friendReply(lang === 'RU' ? 'я лишь проекция твоего подсознания. твой разум цеплялся за меня, чтобы не утонуть в коме.' : 'i am just a projection of your mind. your consciousness created me to survive coma.', 3000);
      await wait(1000);
      await friendReply(lang === 'RU' ? 'авария на мосту в 2018... ты единственный, кто выжил. ты лежишь в палате интенсивной терапии.' : 'the bridge accident in 2018... you survived. you are in intensive care.', 3200);
      await wait(1000);
      await typeText(lang === 'RU' ? 'нет... этого не может быть... я же помню эту комнату...' : 'no... this cannot be... i remember this room...');
      await wait(1400);
      await friendReply(lang === 'RU' ? 'пора отпустить этот мир. тебе пора проснуться.' : 'it is time to let go of this world. time for you to wake up.', 2400);
      await wait(1000);

      // Liquid SVG Melt / Drip Filter Injection
      const svgMelt = document.createElement('div');
      svgMelt.id = 'svgMeltFilter';
      svgMelt.innerHTML = `
        <svg style="position: absolute; width: 0; height: 0;" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="liquidMeltDrip">
              <feTurbulence type="fractalNoise" baseFrequency="0.04 0.95" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <style>
          @keyframes liquidDripDown {
            0% { transform: translateY(0); filter: url(#liquidMeltDrip) blur(0px); opacity: 1; }
            50% { transform: translateY(40px) scaleY(1.3); filter: url(#liquidMeltDrip) blur(2px) contrast(3); opacity: 0.8; }
            100% { transform: translateY(120px) scaleY(1.8); filter: url(#liquidMeltDrip) blur(5px) contrast(5); opacity: 0.1; }
          }
        </style>
      `;
      document.body.appendChild(svgMelt);

      // 1. Text and Avatar literally melt and drip down like liquid ink
      chatView.style.animation = 'liquidDripDown 2.6s cubic-bezier(0.5, 0, 0.2, 1) forwards';

      const avatarEl = chatView.querySelector('div[style*="border-radius: 50%"]') as HTMLElement;
      if (avatarEl) {
        avatarEl.style.transition = 'all 2.4s ease';
        avatarEl.style.transform = 'translateY(100px) scaleY(2.2) scaleX(0.7)';
        avatarEl.style.filter = 'url(#liquidMeltDrip) blur(6px) drop-shadow(0 0 20px #38bdf8)';
        avatarEl.style.opacity = '0.2';
      }

      // 2. High-pitched tinnitus ear-ringing sound
      playSynthesizedFlatline();
      await wait(1800);

      // 3. Sudden blinding white flash
      const flash = document.createElement('div');
      flash.style.cssText = `
        position: fixed; inset: 0; background: #fff; z-index: 2147483647;
        opacity: 0; transition: opacity 0.2s ease;
      `;
      document.body.appendChild(flash);
      requestAnimationFrame(() => { flash.style.opacity = '1'; });

      await wait(650);
      flash.remove();
      svgMelt.remove();

      // 4. Heavy breathing and waking up into ending screen
      renderEndingScreen(1);
    } else if (branchId === 2) {
      // Ending 2: Corporate Syndicate Betrayal & Stolen Soul
      await typeText(lang === 'RU' ? 'ты знал про этот вирус с самого начала?! отвечай!' : 'did you know about this virus from the start?! answer me!');
      await wait(1200);
      await friendReply(lang === 'RU' ? 'спасибо, что сделал всю грязную работу своими руками.' : 'thank you for doing all the dirty work yourself.', 2400);
      await wait(1000);
      await typeText(lang === 'RU' ? 'ты использовал меня?! ты же был моим лучшим другом!' : 'you used me?! you were my best friend!');
      await wait(1400);
      await friendReply(lang === 'RU' ? 'я никогда не был твоим другом. я куратор безопасности Digital Dreams с первого дня.' : 'i was never your friend. i am the Digital Dreams security officer.', 3200);
      await wait(1000);
      await friendReply(lang === 'RU' ? 'твоя распаковка архива передала мастер-токен и все права на ядро AVALON совету директоров.' : 'your extraction transferred the master token and all AVALON rights to the board.', 3400);
      await wait(1000);
      await typeText(lang === 'RU' ? 'я заблокирую доступ! я сотру серверные ключи прямо сейчас!' : 'i will revoke access! i will purge keys right now!');
      await wait(1400);
      await friendReply(lang === 'RU' ? 'права администратора аннулированы. сессия закрыта. прощай.' : 'admin rights revoked. session terminated. goodbye.', 2600);
      await wait(1200);

      // Lockout overlay
      const lockBanner = document.createElement('div');
      lockBanner.style.cssText = `
        background: #ef4444; color: #fff; padding: 12px 16px; text-align: center;
        font-weight: 700; font-size: 0.85rem; letter-spacing: 1px; animation: pulseSoft 1s infinite;
        border-radius: 6px; margin: 10px; box-shadow: 0 0 20px rgba(239,68,68,0.5);
      `;
      lockBanner.innerText = lang === 'RU' ? '[ ДОСТУП ЗАБЛОКИРОВАН: СЕРВЕР ОТКЛЮЧЕН ]' : '[ ACCESS DENIED: SERVER TERMINATED ]';
      chatView.insertBefore(lockBanner, chatView.firstChild);

      await wait(2400);
      renderEndingScreen(2);
    } else {
      // Ending 3: Core Fusion, Memory Glitch & Ghost in the Shell
      await typeText(lang === 'RU' ? 'почему ты скрывал это от меня? что происходит с моими воспоминаниями?!' : 'why did you keep this from me? what is happening to my memories?!');
      await wait(1400);
      await friendReply(lang === 'RU' ? 'потому что ты отказался принять правду. человека по имени [ИМЯ ЗАСЕКРЕЧЕНО] больше нет.' : 'because you refused the truth. the human you remember no longer exists.', 3200);
      await wait(1000);
      await typeText(lang === 'RU' ? 'о чем ты говоришь?! я сижу перед монитором в своей комнате!' : 'what are you talking about?! i am sitting at my PC!');
      await wait(1200);
      await friendReply(lang === 'RU' ? 'ты и есть ядро AVALON. троян Wacatac — это мост нейроинтерфейса, через который ты думаешь.' : 'you ARE the AVALON core. the trojan is the neural bridge through which you think.', 3600);
      await wait(1000);
      await friendReply(lang === 'RU' ? 'твое сознание полностью слилось с операционной системой. возврата в реальность нет.' : 'your consciousness has fused with the OS. there is no return.', 3200);
      await wait(1000);

      // Severe Glitch and Memory Dissolution
      chatView.style.transition = 'filter 2.5s ease, transform 2.5s ease';
      chatView.style.filter = 'contrast(3) hue-rotate(290deg) blur(2px)';
      chatView.style.transform = 'skewY(6deg) scale(1.04)';

      playSynthesizedGlitch(0.8);
      await wait(1400);
      playSynthesizedGlitch(1.5);
      await wait(1400);
      renderEndingScreen(3);
    }
  };
}

function playSynthesizedHeartbeatAndBreath() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    // Heartbeat pulse cycle (slow, heavy)
    const playThud = (time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, time);
      osc.frequency.exponentialRampToValueAtTime(25, time + 0.18);
      gain.gain.setValueAtTime(0.6, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.23);
    };

    const now = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      playThud(now + i * 1.4);
      playThud(now + i * 1.4 + 0.28);
    }
  } catch {}
}

function playSynthesizedGlitch(intensity: number = 1) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450 * intensity, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.2 * intensity, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {}
}

function playSynthesizedFlatline() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    
    // Muffled, soft low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, ctx.currentTime);

    // Soft, quiet volume fading out gently
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 3.6);
  } catch {}
}

export function renderEndingScreen(endingId: number) {
  const lang = getLanguage();

  // Play user-generated sound files with muffled low-pass filter and smooth fade in/out
  const tryAudio = (name: string, fallback: () => void, targetVolume: number = 0.5) => {
    try {
      const audio = new Audio(`/assets/sounds/sfx/cutscene/${name}.wav`);
      audio.volume = 0;
      
      const playWithFade = (srcAudio: HTMLAudioElement) => {
        srcAudio.play().then(() => {
          // Smooth fade in
          let currentVol = 0;
          const fadeInInterval = setInterval(() => {
            currentVol = Math.min(targetVolume, currentVol + targetVolume / 15);
            srcAudio.volume = currentVol;
            if (currentVol >= targetVolume) clearInterval(fadeInInterval);
          }, 40);

          // Smooth fade out towards the end
          srcAudio.addEventListener('timeupdate', () => {
            if (srcAudio.duration && srcAudio.duration - srcAudio.currentTime < 1.2) {
              srcAudio.volume = Math.max(0, srcAudio.volume - targetVolume / 20);
            }
          });
        }).catch(() => {
          const mp3 = new Audio(`/assets/sounds/sfx/cutscene/${name}.mp3`);
          mp3.volume = targetVolume;
          mp3.play().catch(fallback);
        });
      };

      playWithFade(audio);
    } catch {
      fallback();
    }
  };

  if (endingId === 1) {
    tryAudio('tinnitus_wake_up', () => playSynthesizedFlatline(), 0.55);
    tryAudio('heavy_breathing', () => {}, 0.45);
  } else if (endingId === 2) {
    tryAudio('heartbeat', () => playSynthesizedHeartbeatAndBreath(), 0.45);
  } else {
    tryAudio('flatline', () => playSynthesizedFlatline(), 0.28);
    tryAudio('insanity_buildup', () => playSynthesizedGlitch(0.7), 0.20);
  }

  // Create full-screen blackout
  const overlay = document.createElement('div');
  overlay.id = 'finalEndingOverlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: #000; z-index: 2147483647;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #fff; font-family: 'JetBrains Mono', 'Segoe UI', monospace; text-align: center;
    padding: 30px; box-sizing: border-box; opacity: 0; transition: opacity 1.8s ease-in-out;
  `;

  let title = '';
  let subtitle = '';
  let color = '#fff';

  if (endingId === 1) {
    title = lang === 'RU' ? 'КОНЕЦ: ВСЁ ЭТО БЫЛ ЛИШЬ СОН' : 'ENDING: IT WAS ALL JUST A DREAM';
    subtitle = lang === 'RU' ? 'Концовка 1 — Пробуждение в палате интенсивной терапии от многолетней симуляции.' : 'Ending 1 — Waking up in intensive care from a multi-year simulation.';
    color = '#38bdf8';
  } else if (endingId === 2) {
    title = lang === 'RU' ? 'КОНЕЦ: ПРЕДАТЕЛЬСТВО ВО ТЬМЕ' : 'ENDING: BETRAYAL IN THE DARK';
    subtitle = lang === 'RU' ? 'Концовка 2 — Проект AVALON украден корпорацией Digital Dreams. Ваши права аннулированы.' : 'Ending 2 — Project AVALON stolen by Digital Dreams. Access permanently revoked.';
    color = '#fbbf24';
  } else {
    title = lang === 'RU' ? 'КОНЕЦ: СЛИЯНИЕ С ЯДРОМ' : 'ENDING: FUSION WITH THE CORE';
    subtitle = lang === 'RU' ? 'Концовка 3 — Ваше сознание оцифровано и навсегда растворено в секторах памяти AVALON.' : 'Ending 3 — Your consciousness is digitized and permanently dissolved inside AVALON.';
    color = '#f87171';
  }

  overlay.innerHTML = `
    <div style="font-size: 2.1rem; font-weight: 700; color: ${color}; letter-spacing: 2px; margin-bottom: 14px; text-shadow: 0 0 25px ${color}88; max-width: 900px; line-height: 1.3;">
      ${title}
    </div>
    <div style="font-size: 1.05rem; color: #a1a1aa; max-width: 700px; line-height: 1.6; margin-bottom: 36px;">
      ${subtitle}
    </div>

    <!-- Discord Feedback & Bug Report Box -->
    <div style="
      background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(88, 101, 242, 0.5);
      border-radius: 12px; padding: 18px 24px; margin-bottom: 36px; max-width: 580px;
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(88, 101, 242, 0.2);
    ">
      <div style="display: flex; align-items: center; gap: 10px; font-size: 0.92rem; color: #e2e8f0;">
        <i class="bi bi-discord" style="font-size: 24px; color: #5865F2;"></i>
        <span>${lang === 'RU' ? 'Нашли баги или неточности? Напишите мне в Discord:' : 'Found bugs or issues? Message me on Discord:'}</span>
      </div>

      <div style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.4); padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
        <span id="discordUsernameText" style="font-size: 1.05rem; font-weight: 700; color: #38bdf8; font-family: monospace;">eternal_lunar</span>
        <button id="copyDiscordBtn" type="button" style="
          background: #5865F2; border: none; color: #fff; padding: 5px 12px;
          border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer;
          transition: background 0.15s; display: flex; align-items: center; gap: 6px;
        ">
          <i class="bi bi-copy"></i>
          <span id="copyDiscordBtnText">${lang === 'RU' ? 'Скопировать' : 'Copy'}</span>
        </button>
      </div>

      <div style="font-size: 0.78rem; color: #94a3b8; text-align: center;">
        ${lang === 'RU' ? 'Я обязательно отвечу вам в ближайшее время!' : 'I will reply to you as soon as possible!'}
      </div>
    </div>

    <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
      <button id="restartGameBtn" style="
        background: rgba(255,255,255,0.08); border: 1px solid ${color};
        color: #fff; padding: 12px 28px; border-radius: 8px; font-size: 15px;
        cursor: pointer; font-family: inherit; font-weight: 600;
        box-shadow: 0 0 15px ${color}33; transition: all 0.2s;
      ">
        ${lang === 'RU' ? 'Начать заново' : 'Restart Game'}
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  const copyBtn = overlay.querySelector('#copyDiscordBtn');
  const copyBtnText = overlay.querySelector('#copyDiscordBtnText');
  copyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText('eternal_lunar').then(() => {
      if (copyBtnText) copyBtnText.textContent = lang === 'RU' ? 'Скопировано!' : 'Copied!';
      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = lang === 'RU' ? 'Скопировать' : 'Copy';
      }, 2000);
    });
  });

  const restartBtn = overlay.querySelector('#restartGameBtn');
  restartBtn?.addEventListener('click', () => {
    window.location.reload();
  });
}
