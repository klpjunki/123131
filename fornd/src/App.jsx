import React, { useEffect, useState, useCallback } from 'react';
import Balance from "./components/balance";
import Quests from "./components/quests";
import Header from "./components/header";
import Stats from "./components/stats";
import MainCoin from "./components/maincoin";
import NavBar from "./components/navbar";
import EnergyBar from "./components/energybar";
import BottomFriend from "./components/bottomfriend";
import BottomWallet from "./components/bottonwallet";
import Market from "./components/market";
import AdminPanel from "./components/AdminPanel";
import DailyBonusModal from "./components/dailybonusmodal";
import EnergyInfo from "./components/energyinfo";
import CoinInfo from "./components/coininfo";
import Lvlinfo from "./components/lvlinfo";
import api from "./api";

function App() {
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [tgUser, setTgUser] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [balanceUpdateFunction, setBalanceUpdateFunction] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [userRole, setUserRole] = useState("player");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const openModal = useCallback((modalName) => {
    setActiveModal(modalName);
  }, []);
  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const triggerUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const checkAdminKey = useCallback(async (key) => {
    try {
      const response = await api.post('/admin/check', { admin_secret: key });
      if (response.data.status === 'valid') {
        sessionStorage.setItem('admin_secret', key);
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
      alert('Неверный ключ админа!');
    }
  }, []);

  useEffect(() => {
    const savedKey = sessionStorage.getItem('admin_secret');
    if (savedKey) checkAdminKey(savedKey);

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        api.post("/users/", {
          telegram_id: user.id,
          username: user.username
        }).catch(() => {});
        setTgUser(user);
      }
    }
  }, [checkAdminKey]);

  useEffect(() => {
    if (isAdmin) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAdmin]);

  useEffect(() => {
    if (tgUser) {
      api.get(`/users/${tgUser.id}`)
        .then(res => {
          setUserRole(res.data.role);
          setSecondsLeft(res.data.seconds_left || 0);
        })
        .catch(() => {
          setUserRole("player");
          setSecondsLeft(0);
        });
    }
  }, [tgUser, updateTrigger]);

  if (!tgUser && !isAdmin) {
    return (
      <div className="w-[393px] h-[852px] mx-auto flex flex-col items-center justify-center">
        <input 
          type="password" 
          placeholder="Введите админский ключ"
          className="mb-4 p-2 border rounded"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
        />
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => checkAdminKey(adminKey)}
        >
          Войти как админ
        </button>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="">
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="w-[393px] h-[852px] mx-auto flex flex-col relative">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header telegramId={tgUser.id} />
      </div>
      <div className="flex-1 overflow-auto mt-[78px] mb-[130px]">
        <Stats 
          telegramId={tgUser.id} 
          updateTrigger={updateTrigger}
          onOpenDailyBonus={() => openModal('daily-bonus')}
          onOpenCoinInfo={() => openModal('coin-info')}
          onOpenEnergyInfo={() => openModal('energy-info')}
        />
        <Balance
          telegramId={tgUser.id}
          updateTrigger={updateTrigger}
          onBalanceChange={setBalanceUpdateFunction}
          onOpenLevelModal={() => openModal('level')}
        />
        <MainCoin telegramId={tgUser.id} onCoinClick={triggerUpdate}/>
      </div>
      <div className="fixed bottom-[25px] left-0 right-0 z-50">
        <EnergyBar telegramId={tgUser.id} updateTrigger={updateTrigger}/>
        <NavBar
          onFriendsClick={() => setIsFriendsOpen(true)}
          onWalletClick={() => setIsWalletOpen(true)}
          onQuestsClick={() => openModal('quests')}
          onMarketClick={() => setIsMarketOpen(true)}
        />
      </div>
      
      <BottomFriend
        open={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        telegramId={tgUser.id}
      />
      <BottomWallet
        open={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        telegramId={tgUser.id}
        onTransferSuccess={triggerUpdate}
        updateBalance={balanceUpdateFunction}
      />
      <Quests
        open={activeModal === 'quests'}
        onClose={closeModal}
        telegramId={tgUser.id}
      />
      <Market
        open={isMarketOpen}
        onClose={() => setIsMarketOpen(false)}
        telegramId={tgUser.id}
        onTransferSuccess={triggerUpdate}
        updateBalance={balanceUpdateFunction}
        userRole={userRole}
        secondsLeft={secondsLeft}
      />
      
      <Lvlinfo
        open={activeModal === 'level'}
        onClose={closeModal}
        onQuestsClick={() => openModal('quests')}
      />
      
      <CoinInfo
        open={activeModal === 'coin-info'}
        onClose={closeModal}
        onQuestsClick={() => openModal('quests')}
      />
      
      <DailyBonusModal
        open={activeModal === 'daily-bonus'}
        onClose={closeModal}
        onQuestsClick={() => openModal('quests')}
      />
      
      <EnergyInfo
        open={activeModal === 'energy-info'}
        onClose={closeModal}
        onQuestsClick={() => openModal('quests')}
      />
    </div>
  );
}

export default App;
