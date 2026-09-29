import { useSnakeStore } from './store/useSnakeStore';
import { Preloader } from './components/Preloader';
import { MainMenu } from './components/MainMenu';
import { Countdown } from './components/Countdown';
import { SnakeGame } from './components/SnakeGame';
import { GameOver } from './components/GameOver';
import { GameWon } from './components/GameWon';

function App() {
  const currentScreen = useSnakeStore((state) => state.currentScreen);

  return (
    <div className="w-screen h-screen relative bg-background overflow-hidden">
      {currentScreen === 'PRELOADING' && <Preloader />}
      {currentScreen === 'MENU' && <MainMenu />}
      
      {/* Экран отсчета перед игрой */}
      {currentScreen === 'COUNTDOWN' && <Countdown />}
      
      {/* Игровой процесс */}
      {(currentScreen === 'PLAYING' || currentScreen === 'GAME_OVER' || currentScreen === 'GAME_WON') && (
        <SnakeGame />
      )}

      {/* Экран поражения (отображается поверх игрового поля) */}
      {currentScreen === 'GAME_OVER' && <GameOver />}
      
      {/* Экран победы */}
      {currentScreen === 'GAME_WON' && <GameWon />}
      
      {/* Версия игры */}
      <div className="absolute bottom-4 left-4 text-white/50 text-sm font-medium z-50 pointer-events-none">
        V1.1
      </div>
    </div>
  );
}

export default App;
