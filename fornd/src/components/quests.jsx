import { Dialog } from '@headlessui/react'
import { useState, useEffect } from 'react'
import api from "../api"

export default function Quests({ open, onClose, telegramId }) {
  const [promoCode, setPromoCode] = useState("")
  const [referralProgress, setReferralProgress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const ener = "https://res.cloudinary.com/dufl71suj/image/upload/v1750112142/Mask_group_s9hbfr.svg"
  const tg = "https://res.cloudinary.com/dufl71suj/image/upload/v1750112142/logos_telegram_slmyy6"
  const youtube = "https://res.cloudinary.com/dufl71suj/image/upload/v1750112142/logos_youtube-icon_ikjzoc"
  const time = "https://res.cloudinary.com/dufl71suj/image/upload/v1750112142/Group_17_jwu7h1"
  const done = "https://res.cloudinary.com/dufl71suj/image/upload/v1750112142/Group_17_1_xrijy8"
  const inprogress = "https://res.cloudinary.com/dufl71suj/image/upload/v1750112142/Group_17_2_o5apaf"
  const enegry = "https://res.cloudinary.com/dufl71suj/image/upload/v1750112142/Vector_24_juurpo"
  const people = "https://res.cloudinary.com/dufl71suj/image/upload/v1750112142/fa-solid_user-friends_zrlfyu"

  useEffect(() => {
    if (open && telegramId) {
      loadReferralProgress()
      const interval = setInterval(loadReferralProgress, 1000)
      return () => clearInterval(interval)
    }
  }, [open, telegramId])

  // Новый useEffect для автозакрытия сообщения
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadReferralProgress = async () => {
    try {
      const response = await api.get(`/users/${telegramId}/referral_progress`)
      setReferralProgress(response.data)
    } catch (error) {
      console.error('Error loading referral progress:', error)
    }
  }

  const handleClaimReward = async (questType) => {
    setLoading(true)
    try {
      const response = await api.post(`/users/${telegramId}/claim_referral_reward?quest_type=${questType}`)
      setMessage(response.data.message)
      loadReferralProgress()
    } catch (error) {
      setMessage(error.response?.data?.detail || "Ошибка при получении награды")
    } finally {
      setLoading(false)
    }
  }

  const handleYouTubeQuest = async () => {
    window.open("https://www.youtube.com/@gachacoin", '_blank')
    setLoading(true)
    try {
      await api.post(`/users/${telegramId}/youtube_subscribe`, {})
      loadReferralProgress()
    } catch (error) {
      setMessage(error.response?.data?.detail || "Ошибка при выполнении задания")
    } finally {
      setLoading(false)
    }
  }

  const handleTelegramQuest = async () => {
    window.open("https://t.me/gacha_coin", '_blank')
    setLoading(true)
    try {
      await api.post(`/users/${telegramId}/telegram_subscribe`, {})
      loadReferralProgress()
    } catch (error) {
      setMessage(error.response?.data?.detail || "Ошибка при выполнении задания")
    } finally {
      setLoading(false)
    }
  }

  const handleClaimYouTubeReward = async () => {
    setLoading(true)
    try {
      const response = await api.post(`/users/${telegramId}/claim_youtube_reward`)
      setMessage(response.data.message)
      loadReferralProgress()
    } catch (error) {
      setMessage(error.response?.data?.detail || "Ошибка при получении награды")
    } finally {
      setLoading(false)
    }
  }

  const handleClaimTelegramReward = async () => {
    setLoading(true)
    try {
      const response = await api.post(`/users/${telegramId}/claim_telegram_reward`)
      setMessage(response.data.message)
      loadReferralProgress()
    } catch (error) {
      setMessage(error.response?.data?.detail || "Ошибка при получении награды")
    } finally {
      setLoading(false)
    }
  }

  const formatTimeLeft = (seconds) => {
    if (!seconds || seconds <= 0) return ""
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getReferralQuestStatus = (questType) => {
    if (!referralProgress) {
      return (
        <span className="flex items-center gap-1">
          <img src={inprogress} alt="" className='max-w-[16px]' />
          <span className="text-white font-bold text-[13px]">Загрузка...</span>
        </span>
      )
    }

    const quest = questType === "5_friends" ? 
      referralProgress.quest_5_friends : 
      referralProgress.quest_10_friends
    
    if (quest.reward_claimed) {
      return (
        <span className="flex items-center gap-1">
          <img src={done} alt="" className='max-w-[12px]' />
          <span className="text-white font-bold text-[13px]">Выполнено!</span>
        </span>
      )
    } else if (quest.can_claim) {
      return (
        <button 
          onClick={() => handleClaimReward(questType)}
          disabled={loading}
          className="flex items-center gap-1 bg-green-600 w-full py-1 rounded"
        >
          <span className="text-white font-bold mx-auto text-[11px]">Забрать</span>
        </button>
      )
    } else {
      return (
        <span className="flex items-center gap-1">
          <img src={inprogress} alt="" className='max-w-[16px]' />
          <span className="text-white text-center font-bold text-[11px]">
            {referralProgress.referral_count}/{questType === "5_friends" ? "5" : "10"}
          </span>
        </span>
      )
    }
  }

  const getYouTubeQuestStatus = () => {
    if (!referralProgress) {
      return (
        <span className="flex items-center gap-1">
          <img src={inprogress} alt="" className='max-w-[16px]' />
          <span className="text-white font-bold text-[13px]">Загрузка...</span>
        </span>
      )
    }

    const quest = referralProgress.youtube_quest

    if (quest.reward_claimed) {
      return (
        <span className="flex items-center gap-1">
          <img src={done} alt="" className='max-w-[12px]' />
          <span className="text-white font-bold text-[13px]">Выполнено!</span>
        </span>
      )
    } else if (quest.can_claim) {
      return (
        <button 
          onClick={handleClaimYouTubeReward}
          disabled={loading}
          className="flex items-center gap-1 bg-green-600 w-full py-1 rounded"
        >
          <span className="text-white font-bold mx-auto text-[11px]">Забрать</span>
        </button>
      )
    } else if (quest.completed && quest.time_left) {
      return (
        <span className="flex items-center gap-1">
          <img src={inprogress} alt="" className='max-w-[16px]' />
          <span className="text-white font-bold text-[10px]">
            {formatTimeLeft(quest.time_left)}
          </span>
        </span>
      )
    } else if (quest.completed) {
      return (
        <span className="flex items-center gap-1">
          <img src={inprogress} alt="" className='max-w-[16px]' />
          <span className="text-white font-bold text-[11px]">Ожидание...</span>
        </span>
      )
    } else {
      return (
        <button 
          onClick={handleYouTubeQuest}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <img src={time} alt="" />
          <span className="text-white font-bold text-[13px]">Подписаться</span>
        </button>
      )
    }
  }

  const getTelegramQuestStatus = () => {
    if (!referralProgress) {
      return (
        <span className="flex items-center gap-1">
          <img src={inprogress} alt="" className='max-w-[16px]' />
          <span className="text-white font-bold text-[13px]">Загрузка...</span>
        </span>
      )
    }
    
    const quest = referralProgress.telegram_quest
    if (quest.reward_claimed) {
      return (
        <span className="flex items-center gap-1">
          <img src={done} alt="" className='max-w-[12px]' />
          <span className="text-white font-bold text-[13px]">Выполнено!</span>
        </span>
      )
    } else if (quest.can_claim) {
      return (
        <button 
          onClick={handleClaimTelegramReward}
          disabled={loading}
          className="flex items-center gap-1 bg-green-600 w-full py-1 rounded"
        >
          <span className="text-white font-bold mx-auto text-[11px]">Забрать</span>
        </button>
      )
    } else {
      return (
        <button 
          onClick={handleTelegramQuest}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <img src={time} alt="" />
          <span className="text-white font-bold text[13px]">Подписаться</span>
        </button>
      )
    }
  }

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post(`/users/${telegramId}/promocode?code=${encodeURIComponent(promoCode)}`);
      setMessage("Промокод применён!");
      setPromoCode('');
      loadReferralProgress();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage("Неверный промокод");
      } else {
        setMessage("Ошибка при применении промокода");
      }
    } finally {
      setLoading(false);
    }
  };

  const allQuests = [
    {
      id: 1,
      icon: <img src={people} alt="Друзья" />,
      title: "Пригласи 5 друзей",
      reward: (
        <span className="flex items-center gap-1 text-[#FFC700] font-bold text-[8px]">
          <img className='h-[8px]' src={enegry} alt="Энергия" /> 6500
        </span>
      ),
      status: getReferralQuestStatus("5_friends")
    },
    {
      id: 2,
      icon: <img src={people} alt="Друзья" />,
      title: "Пригласи 10 друзей",
      reward: (
        <span className="flex items-center gap-1 text-[#FFC700] font-bold text-[8px]">
          <img className='max-h-[8px]' src={enegry} alt="Энергия" /> 12000
        </span>
      ),
      status: getReferralQuestStatus("10_friends")
    },
    {
      id: 3,
      icon: <img src={youtube} alt="YouTube" />,
      title: "Подпишись на YouTube",
      reward: (
        <span className="text-white flex items-center font-bold text-[8px] gap-[2px]">
          <img src={ener} alt="Монеты" className='max-h-[12px]' />
          <p>+10 coin│10 Минут</p>
        </span>
      ),
      status: getYouTubeQuestStatus()
    },
    {
      id: 4,
      icon: <img src={tg} alt="Telegram" />,
      title: "Подпишись на Telegram",
      reward: (
        <span className="text-white flex items-center font-bold text-[8px] gap-[2px]">
          <img src={ener} alt="Монеты" className='max-h-[12px]' />
          <p>+10 coin│10 Минут</p>
        </span>
      ),
      status: getTelegramQuestStatus()
    }
  ]

  if (!open) return null

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      className="fixed inset-0 z-[200] pointer-events-none"
    >
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[rgba(33,36,41,0.5)] to-[rgba(0,166,255,0.5)] pointer-events-auto" 
        onClick={onClose} 
        style={{ zIndex: 190 }}
      />
      
      <Dialog.Panel
        className="fixed left-0 right-0 mx-auto bg-[rgba(48,51,58,1)] rounded-t-[32px] pointer-events-auto flex flex-col"
        style={{
          bottom: 0,
          maxWidth: 440,
          height: 644,
          zIndex: 200
        }}
      >
        <div className="flex flex-col h-full px-6 pt-6 pb-8">
          <h2 className="text-white text-[24px] font-bold text-center mb-[19px]">
            Выполняй задания:
          </h2>
          
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 mb-4">
            {allQuests.map((quest) => (
              <div
                key={quest.id}
                className="bg-[rgba(40,43,50,1)] rounded-[13px] flex flex-col justify-between p-3"
              >
                <div>
                  <div className="flex gap-2 mb-1">
                    <div className="flex items-center justify-center w-9 h-9">
                      {quest.icon}
                    </div>
                    <div>
                      <div className="text-white text-[9px] font-semibold leading-tight">
                        {quest.title}
                      </div>
                      <div className="text-[#A5AAB4] text-[7px] leading-tight">
                        Награда за выполнение:
                      </div>
                      <div className="mt-1">
                        {quest.reward}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#44474F] mt-1 pt-1">
                  {quest.status}
                </div>
              </div>
            ))}
          </div>
          
          <div className="w-full mt-auto">
            <form onSubmit={handlePromoSubmit}>
              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder="Введите промокод"
                className="w-full h-10 bg-[#232427] rounded-[8px] text-white text-center text-[14px] mb-3 placeholder-[#A5AAB4] font-medium outline-none"
                style={{ fontSize: 15 }}
                disabled={loading}
              />
              <button
                type="submit"
                className="w-full h-12 bg-[#3772FF] rounded-[10px] text-white text-[17px] font-bold"
                disabled={!promoCode.trim() || loading}
              >
                {loading ? "Проверка..." : "Ввести промо-код"}
              </button>
            </form>
            {message && (
              <div className="mt-2 text-center text-white font-semibold">{message}</div>
            )}
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
