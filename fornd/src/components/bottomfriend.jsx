import { Dialog } from '@headlessui/react'
import { useState, useEffect } from 'react'
import addfriend from '../assets/addF.svg'
import enegry from '../assets/energy.svg'
import api from "../api"

export default function BottomFriend({ open, onClose, telegramId }) {
  if (!open) return null
  
  const [referralData, setReferralData] = useState({
    referral_code: '',
    referral_count: 0,
    referrals: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (open && telegramId) {
      fetchReferralData()
    }
  }, [open, telegramId])

  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'

    const handleResize = () => {
      const windowHeight = window.innerHeight
      const visualViewport = window.visualViewport
      
      if (visualViewport) {
        const keyboardHeight = windowHeight - visualViewport.height
        setKeyboardHeight(keyboardHeight > 0 ? keyboardHeight : 0)
      }
    }

    const footer = document.querySelector('[class*="fixed bottom-0"]')
    if (footer) {
      footer.style.display = 'none'
    }

    const preventScroll = (e) => {
      if (!e.target.closest('.friends-content')) {
        e.preventDefault()
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
    }

    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('wheel', preventScroll, { passive: false })

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''

      if (footer) {
        footer.style.display = 'block'
      }
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
      
      document.removeEventListener('touchmove', preventScroll)
      document.removeEventListener('wheel', preventScroll)
      setKeyboardHeight(0)
    }
  }, [open])

  const fetchReferralData = async () => {
    try {
      const response = await api.get(`/users/${telegramId}/referrals`)
      setReferralData(response.data)
    } catch (error) {
      console.error('Ошибка загрузки данных о рефералах:', error)
    }
  }

  const copyReferralLink = async () => {
    if (!referralData.referral_code) return
    
    const referralLink = `https://t.me/fdfkdkfkddfk_bot?start=${referralData.referral_code}`
    
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      const textArea = document.createElement('textarea')
      textArea.value = referralLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const checkAndClaimReferralReward = async () => {
    if (referralData.referral_count >= 5) {
      setIsLoading(true)
      try {
        const response = await api.post(`/users/${telegramId}/claim_referral_reward`)
        if (response.data.status === 'success') {
          alert(`Поздравляем! Вы получили ${response.data.energy_reward} энергии за приглашение друзей!`)
          fetchReferralData()
        }
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('Награда уже получена')
        } else {
          console.error('Ошибка при получении награды:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (referralData.referral_count >= 5) {
      checkAndClaimReferralReward()
    }
  }, [referralData.referral_count])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      <div
        className="absolute inset-0 pointer-events-auto"
        onClick={onClose}
      />
      <div
        className="absolute left-0 right-0 h-full pointer-events-auto"
        style={{
          bottom: keyboardHeight > 0 ? `${keyboardHeight + 333}px` : '248px',
          background:
            'linear-gradient(180deg, rgba(33, 36, 41, 0.5) 38.34%, rgba(0, 166, 255, 0.5) 100%)',
          zIndex: 60,
        }}
      />
      <Dialog.Panel
        className="fixed left-0 right-0 bg-[rgba(48,51,58,1)] rounded-t-[50px] pointer-events-auto transition-all duration-300"
        style={{ 
          bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px',
          height: '333px',
          zIndex: 70
        }}
      >
        <div className="friends-content">
          <div className='pt-[40px]'>
            <h2 className='font-bold text-[24px] leading-[110%] tracking-[-0.02em] text-center text-white mb-[17px]'>
              Приглашай друзей <br /> получай энергию
            </h2>
            <div className='flex justify-center items-center gap-[7px] py-[8px] mb-[36px]'>
              <img src={addfriend} alt="add" />
              <div className='flex items-center '>
                <img className='h-[40.34px]' src={enegry} alt="energy" />
                <p className='font-bold text-[40px] leading-[110%] tracking-[-0.02em] text-center text-white'>500</p>
              </div>
            </div>
            <div>
              <p className='font-rubik font-normal text-[10px] leading-[110%] tracking-[-0.02em] text-center text-white'>
                ПРИГЛАШЕНО ДРУЗЕЙ <span className='font-normal text-[10px] leading-[110%] tracking-[-0.02em] text-center text-[rgba(45,92,200,1)]'>
                  {referralData.referral_count}
                </span>
                {referralData.referral_count >= 5 && (
                  <span className='text-green-400 ml-2 text-[12px]'>Награда получена!</span>
                )}
              </p>
            </div>
          </div>
          <div className='flex items-center justify-center mt-[9px]'>
            <button 
              onClick={copyReferralLink}
              disabled={isLoading || !referralData.referral_code}
              className={`w-[337.0467224121094px] h-[61px] text-white font-semibold text-[16px] leading-[110%] tracking-[-0.02em] text-center rounded-[10px] transition-all ${
                copySuccess 
                  ? 'bg-green-500' 
                  : 'bg-[rgba(45,92,200,1)] hover:bg-[rgba(35,82,190,1)]'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {copySuccess ? 'Ссылка скопирована!' : 'Скопировать ссылку'}
            </button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
