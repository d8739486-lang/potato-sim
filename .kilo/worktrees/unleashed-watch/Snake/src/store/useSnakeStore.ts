import { create } from 'zustand';
import { updateStats } from '../features/auth/authService';

export type GameScreen = 'PRELOADING' | 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'GAME_OVER' | 'GAME_WON';
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export interface Apple extends Point {
  type: 'NORMAL' | 'GOLDEN';
}

interface SnakeState {
  currentScreen: GameScreen;
  setScreen: (screen: GameScreen) => void;
  
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  setMasterVolume: (val: number) => void;
  setMusicVolume: (val: number) => void;
  setSfxVolume: (val: number) => void;

  playSfx: (type: 'click' | 'slider' | 'crash' | 'game_over') => void;
  resetProject: () => void;

  // Игровые данные
  snakeBody: Point[];
  direction: Direction;
  nextDirection: Direction;
  apple: Apple | null;
  score: number;
  baseSpeed: number; // мс на тик
  currentSpeed: number;
  isGameOver: boolean;
  isPaused: boolean;
  isShaking: boolean;       // Флаг тряски камеры
  applesEatenThisGame: number;

  // Игровые экшены
  startGame: () => void;
  togglePause: () => void;
  setDirection: (dir: Direction) => void;
  tick: () => void;
  spawnApple: () => void;
  gameOver: () => void;
  gameWon: () => void;
}

const INITIAL_SPEED = 150; // Базовая скорость
const GOLDEN_APPLE_BOOST = 0.8; // На 20% быстрее (150 * 0.8 = 120ms)

const GRID_SIZE = 20;

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const useSnakeStore = create<SnakeState>((set, get) => ({
  currentScreen: 'PRELOADING',
  setScreen: (screen) => set({ currentScreen: screen }),
  
  masterVolume: 1,
  musicVolume: 0.5,
  sfxVolume: 1,
  
  setMasterVolume: (val) => set({ masterVolume: val }),
  setMusicVolume: (val) => set({ musicVolume: val }),
  setSfxVolume: (val) => set({ sfxVolume: val }),

  playSfx: (type) => {
    const { masterVolume, sfxVolume } = get();
    let finalVolume = masterVolume * sfxVolume;
    
    // Сделали клик экстремально тихим
    if (type === 'click') {
      finalVolume *= 0.15;
    }
    // Сделали звук game_over на 80% тише
    if (type === 'game_over') {
      finalVolume *= 0.2;
    }
    
    if (finalVolume <= 0) return;
    
    let url = '';
    if (type === 'click') url = '/assets/sfx/click.wav';
    else if (type === 'slider') url = '/assets/sfx/slider.wav';
    else if (type === 'crash') url = '/assets/sfx/crash.wav';
    else if (type === 'game_over') url = '/assets/sfx/game_over.wav';

    const audio = new Audio(url);
    audio.volume = finalVolume;
    audio.play().catch(e => console.log('SFX blocked', e));
  },

  resetProject: () => {
    set({
      masterVolume: 1,
      musicVolume: 0.5,
      sfxVolume: 1,
    });
    alert('Проект сброшен!');
  },

  // Игровое состояние
  snakeBody: [{ x: 10, y: 10 }],
  direction: 'UP',
  nextDirection: 'UP',
  apple: null,
  score: 0,
  baseSpeed: INITIAL_SPEED,
  currentSpeed: INITIAL_SPEED,
  isGameOver: false,
  isPaused: false,
  isShaking: false,
  applesEatenThisGame: 0,

  startGame: () => {
    set({
      snakeBody: [{ x: 10, y: 10 }],
      direction: 'UP',
      nextDirection: 'UP',
      score: 0,
      baseSpeed: INITIAL_SPEED,
      currentSpeed: INITIAL_SPEED,
      isGameOver: false,
      isPaused: false,
      isShaking: false,
      applesEatenThisGame: 0,
      currentScreen: 'PLAYING'
    });
    get().spawnApple();
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  setDirection: (dir) => {
    const { direction } = get();
    // Предотвращаем поворот на 180 градусов
    const isOpposite = 
      (dir === 'UP' && direction === 'DOWN') ||
      (dir === 'DOWN' && direction === 'UP') ||
      (dir === 'LEFT' && direction === 'RIGHT') ||
      (dir === 'RIGHT' && direction === 'LEFT');
    
    if (!isOpposite) {
      set({ nextDirection: dir });
    }
  },

  spawnApple: () => {
    const { snakeBody } = get();
    let newX = 0;
    let newY = 0;
    let isOnSnake = true;
    
    while (isOnSnake) {
      newX = getRandomInt(0, GRID_SIZE - 1);
      newY = getRandomInt(0, GRID_SIZE - 1);
      
      // eslint-disable-next-line no-loop-func
      isOnSnake = snakeBody.some(segment => segment.x === newX && segment.y === newY);
    }

    const isGolden = Math.random() < 0.05; // 5% шанс
    set({ apple: { x: newX, y: newY, type: isGolden ? 'GOLDEN' : 'NORMAL' } });
  },

  gameOver: () => {
    // Сразу ставим isGameOver чтобы tick() перестал вызываться и звуки не дублировались
    set({ isGameOver: true, isShaking: true });
    get().playSfx('crash');
    
    // Сохраняем статистику в Supabase (если авторизован)
    const { applesEatenThisGame } = get();
    updateStats({ deaths: 1, apples: applesEatenThisGame }).catch(() => {});
    
    // Убираем тряску через 600мс
    setTimeout(() => set({ isShaking: false }), 600);
    
    // Звук проигрыша и переход на экран поражения
    setTimeout(() => {
      get().playSfx('game_over');
      set({ currentScreen: 'GAME_OVER' });
    }, 500);
  },

  gameWon: () => {
    const { applesEatenThisGame } = get();
    updateStats({ wins: 1, apples: applesEatenThisGame }).catch(() => {});
    set({ currentScreen: 'GAME_WON', isGameOver: true });
  },

  tick: () => {
    const { snakeBody, nextDirection, apple, score, isGameOver, isPaused } = get();
    if (isGameOver || isPaused) return;

    // Обновляем текущее направление на то, которое было задано последним (чтобы избежать двойных нажатий за один тик)
    set({ direction: nextDirection });

    const head = { ...snakeBody[0] };
    switch (nextDirection) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    // Проверка столкновений со стенами
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      get().gameOver();
      return;
    }

    // Проверка столкновения с собой
    if (snakeBody.some(segment => segment.x === head.x && segment.y === head.y)) {
      get().gameOver();
      return;
    }

    const newBody = [head, ...snakeBody];
    
    // Проверка съедания яблока
    if (apple && head.x === apple.x && head.y === apple.y) {
      // Змейка растет (хвост не удаляется в этот тик)
      
      // Проверка на победу (если змейка заняла всё поле)
      if (newBody.length === GRID_SIZE * GRID_SIZE) {
        set({ snakeBody: newBody, score: score + (apple.type === 'GOLDEN' ? 50 : 10) });
        get().gameWon();
        return;
      }

      if (apple.type === 'GOLDEN') {
        // Ускоряемся на 20%
        const newSpeed = Math.max(50, get().currentSpeed * GOLDEN_APPLE_BOOST);
        set({ score: score + 50, currentSpeed: newSpeed, applesEatenThisGame: get().applesEatenThisGame + 1 });
      } else {
        set({ score: score + 10, applesEatenThisGame: get().applesEatenThisGame + 1 });
      }
      
      get().playSfx('click'); // Звук съедания можно сделать отдельным, но пока юзаем клик или добавим 'eat' позже. Лучше добавим 'eat'
      get().spawnApple();
    } else {
      // Если не съели, удаляем хвост
      newBody.pop();
    }

    set({ snakeBody: newBody });
  }
}));
