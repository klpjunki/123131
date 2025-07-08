import { useState, useEffect } from 'react'
import api from '../api'
import energe from '../assets/energi.svg'

function Stats({ telegramId, updateTrigger, onOpenDailyBonus, onOpenCoinInfo, onOpenEnergyInfo }) {
  const coin = "https://res.cloudinary.com/dufl71suj/image/upload/v1751037405/tankcoin.png"

  const [userBoost, setUserBoost] = useState({
    boost_active: false,
    boost_multiplier: 1
  })
  const [userInfo, setUserInfo] = useState({ 
    daily_streak: 0,
    level: 1
  })

  useEffect(() => {
    if (telegramId) {
      fetchUserInfo()
    }
  }, [telegramId, updateTrigger])

  const fetchUserInfo = async () => {
    try {
      const response = await api.get(`/users/${telegramId}`)
      setUserBoost({
        boost_active: response.data.boost_active || false,
        boost_multiplier: response.data.boost_multiplier || 1
      })
      setUserInfo({
        daily_streak: response.data.daily_streak || 0,
        level: response.data.level || 1
      })
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const todayBonus = (userInfo.level || 1) * 1000

  const stats = [
    {
      title: "Coin за клик",
      price: userBoost.boost_active ? `+${userBoost.boost_multiplier}` : "+1",
      img: coin,
      color: userBoost.boost_active ? "rgba(230,143,228,1)" : "rgba(116,191,231,1)",
      onClick: onOpenCoinInfo
    },
    {
      title: "Энергия за клик",
      price: "-10",
      img: energe,
      color: "rgba(132,203,105,1)",
      onClick: onOpenEnergyInfo
    },
    {
      title: "Фарм в день",
      price: `+${todayBonus.toLocaleString('ru-RU')}`,
      img: coin,
      color: "rgba(255, 215, 0, 1)",
      onClick: onOpenDailyBonus
    },
  ]

  return (
    <>
      <div className='flex text-[11px] justify-between px-[18px]'>
        {stats.map((stat, index) => (
          <div
            key={index}
            className='flex flex-col items-center justify-between py-[8px] h-[50px] w-[115px] bg-[rgba(50,54,60,1)] rounded-[8px] cursor-pointer'
            onClick={stat.onClick}
          >
            <p style={{ color: stat.color }} className='font-medium'>{stat.title}</p>
            <div className='flex items-center justify-center gap-[3px]'>
              <img src={stat.img} alt="img" className='max-w-[17px]' />
              <p className='font-semibold text-white'>{stat.price}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Stats;
