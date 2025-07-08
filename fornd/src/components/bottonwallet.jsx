import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import api from "../api"

const coin = "https://res.cloudinary.com/dufl71suj/image/upload/v1751037405/tankcoin.png"

export default function BottomWallet({ open, onClose, telegramId, onTransferSuccess, updateBalance }) {
  if (!open) return null


  const [amount, setAmount] = useState("")
  const [username, setUsername] = useState("")
  const [userBalance, setUserBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isAmountFocused, setIsAmountFocused] = useState(false)
  const [isUsernameFocused, setIsUsernameFocused] = useState(false) // Добавлено состояние фокуса для имени пользователя

  useEffect(() => {
    if (open && telegramId) {
      api.get(`/users/${telegramId}`)
        .then(res => setUserBalance(res.data.coins))
        .catch(err => console.error("Ошибка загрузки баланса:", err))
    }
  }, [open, telegramId])
  useEffect(() => {
    if (!open) return

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
    const preventZoom = (e) => {
      e.target.style.fontSize = '16px'
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
    }

    document.addEventListener('focusin', preventZoom)

    return () => {
      if (footer) {
        footer.style.display = 'block'
      }
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
      
      document.removeEventListener('focusin', preventZoom)
      setKeyboardHeight(0)
    }
  }, [open])
  useEffect(() => {
    if (!open) {
      setAmount("")
      setUsername("")
      setError("")
      setSuccess("")
      setIsAmountFocused(false)
      setIsUsernameFocused(false) 
    }
  }, [open])
  const handleTransfer = async () => {
    if (!amount || !username) {
      setError("Заполните все поля")
      return
    }

    const transferAmount = parseInt(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Введите корректную сумму")
      return
    }

    if (transferAmount > userBalance) {
      setError("Недостаточно средств")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await api.post('/users/transfer_by_username', {
        sender_id: telegramId,
        receiver_username: username,
        amount: transferAmount
      })

      if (response.data.status === "success") {
        if (updateBalance) {
          updateBalance(response.data.sender_balance);
        }
        
        setSuccess(`Успешно отправлено ${response.data.amount_transferred} монет пользователю @${response.data.receiver_username}`)
        setUserBalance(response.data.sender_balance)
        setAmount("")
        setUsername("")
        
        if (onTransferSuccess) {
          onTransferSuccess()
        }
        
        onClose()
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Ошибка перевода"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

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
          bottom: keyboardHeight > 0 ? `${keyboardHeight + 388}px` : '240px',
          background:
            'linear-gradient(180deg, rgba(33, 36, 41, 0.5) 38.34%, rgba(0, 166, 255, 0.5) 100%)',
          zIndex: 60,
        }}
      />
      <Dialog.Panel
        className="fixed left-0 right-0 bg-[rgba(48,51,58,1)] rounded-t-[50px] pointer-events-auto transition-all duration-300"
        style={{ 
          bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px',
          height: '328px',
          zIndex: 70
        }}
      >
        <div className="pb-[15px] flex flex-col items-center justify-center h-full">
          <div className='flex flex-col gap-[9px] w-full'>
            <h2 className='font-bold text-[24px] leading-[110%] tracking-[-0.02em] text-center text-[rgba(255,254,253,1)]'>Отправить монеты:</h2>
            <div className='flex justify-center items-center'>
              <img src={coin} alt="" className='w-[46px] h-[46px]' />
              <p className='font-bold text-[40px] leading-[110%] tracking-[-0.02em] text-center text-[rgba(255,254,253,1)]'>
                {userBalance.toLocaleString()}
              </p>
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-[12px] mt-2 text-center px-4">
              Пользователь не найден
            </div>
          )}
          {success && (
            <div className="text-green-500 text-[12px] mt-2 text-center px-4">
              {success}
            </div>
          )}
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full flex mt-[18px] mb-[10px]">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onFocus={() => setIsAmountFocused(true)}
                onBlur={() => setIsAmountFocused(false)}
                className="w-[318.81329345703125px] h-[33px] mx-auto bg-[rgba(40,43,50,1)] text-white text-center placeholder-transparent outline-none rounded-[5px]"
                style={{ fontSize: '16px' }}
                disabled={isLoading}
              />
              {!amount && !isAmountFocused && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <img src={coin} alt="" className="w-[15px] h-[15px]" />
                    <span className="font-roboto font-semibold text-[13px] leading-[110%] tracking-[-0.02em] text-[rgba(99,99,99,1)]">Введите сумму</span>
                  </div>
                </div>
              )}
            </div>
            <div className="relative w-full flex mb-[22px]">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => setIsUsernameFocused(true)}
                onBlur={() => setIsUsernameFocused(false)}
                className="w-[318.81329345703125px] h-[33px] mx-auto bg-[rgba(40,43,50,1)] text-white text-center outline-none font-roboto font-semibold text-[13px] leading-[110%] tracking-[-0.02em] rounded-[5px] placeholder-transparent"
                style={{ fontSize: '16px' }}
                disabled={isLoading}
              />
              {!username && !isUsernameFocused && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="font-roboto font-semibold text-[13px] leading-[110%] tracking-[-0.02em] text-[rgba(99,99,99,1)]">Введите имя пользователя</span>
                </div>
              )}
            </div>
            <button
              onClick={handleTransfer}
              disabled={isLoading || !amount || !username}
              className={`w-[337.0467224121094px] h-[61px] rounded-[10px] text-white transition font-semibold ${
                isLoading || !amount || !username 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-[rgba(45,92,200,1)] hover:bg-[rgba(35,82,190,1)]'
              }`}
            >
              {isLoading ? "Отправляем..." : "Отправить"}
            </button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
