import { Dialog } from '@headlessui/react'
import { useState, useEffect } from 'react'
import api from "../api"
import CountdownTimer from "./CountdownTimer"

export default function Market({ open, onClose, telegramId, onTransferSuccess, userRole, secondsLeft }) {
  if (!open) return null

  const [userBalance, setUserBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [amount, setAmount] = useState("")
  const [uid, setUid] = useState("")
  const [isAmountFocused, setIsAmountFocused] = useState(false)
  const [isUidFocused, setIsUidFocused] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState("Танки Блитц")
  const [requestStatus, setRequestStatus] = useState("") 
  const [requestMessage, setRequestMessage] = useState("")
  const [exchangeRate, setExchangeRate] = useState(1)

  const coin = "https://res.cloudinary.com/dufl71suj/image/upload/v1751037405/tankcoin.png"
  const currencyIcons = {
    "Танки Блитц": "https://res.cloudinary.com/dufl71suj/image/upload/v1751488496/gold.png",
    "Мир танков": "https://res.cloudinary.com/dufl71suj/image/upload/v1751488496/gold.png",
    "Wot Blitz": "https://res.cloudinary.com/dufl71suj/image/upload/v1751488496/gold.png"
  }

  const currencies = [
    { id: "Танки Блитц", name: "Танки Блитц" },
    { id: "Мир танков", name: "Мир танков" },
    { id: "Wot Blitz", name: "Wot Blitz" }
  ]

  useEffect(() => {
    if (open && telegramId) {
      fetchUserBalance()
    }
  }, [open, telegramId])

  useEffect(() => {
    if (open && selectedCurrency) {
      fetchExchangeRate(selectedCurrency)
    }
  }, [open, selectedCurrency])

  useEffect(() => {
    if (!open) {
      setAmount("")
      setUid("")
      setIsAmountFocused(false)
      setIsUidFocused(false)
      setRequestStatus("")
      setRequestMessage("")
    }
  }, [open])

  const fetchUserBalance = async () => {
    try {
      const response = await api.get(`/users/${telegramId}`)
      setUserBalance(response.data.coins)
    } catch (error) {
      console.error('Ошибка загрузки баланса:', error)
    }
  }

  const fetchExchangeRate = async (currencyId) => {
    try {
      const response = await api.get(`/exchange-rate?to_currency=${currencyId}`)
      setExchangeRate(response.data.rate || 1)
    } catch (error) {
      setExchangeRate(1)
      console.error('Ошибка загрузки курса:', error)
    }
  }

  const selectCurrency = (currencyId) => {
    setSelectedCurrency(currencyId)
  }
  const calculateTotalCrystals = () => {
    const amt = parseInt(amount)
    if (isNaN(amt) || amt <= 0) return 0
    return Math.floor(amt * exchangeRate)
  }
  const calculateBalanceCrystals = () => {
    return Math.floor(userBalance * exchangeRate)
  }

  const handleExchangeRequest = async () => {
    if (!amount || !uid) {
      setRequestStatus("error")
      setRequestMessage("Заполните все поля")
      return
    }
    const exchangeAmount = parseInt(amount)
    if (isNaN(exchangeAmount) || exchangeAmount <= 0) {
      setRequestStatus("error")
      setRequestMessage("Введите корректную сумму")
      return
    }
    if (exchangeAmount > userBalance) {
      setRequestStatus("error")
      setRequestMessage("Недостаточно монет")
      return
    }
    setIsLoading(true)
    setRequestStatus("")
    setRequestMessage("")
    try {
      const response = await api.post(`/users/${telegramId}/exchange`, {
        to_currency: selectedCurrency,
        amount: exchangeAmount,
        uid: uid
      })
      if (response.data.status === "pending") {
        setRequestStatus("pending")
        setRequestMessage("Заявка отправлена! Ожидайте подтверждения администратора.")
        setAmount("")
        setUid("")
        if (onTransferSuccess) onTransferSuccess()
      } else {
        setRequestStatus("error")
        setRequestMessage("Что-то пошло не так. Попробуйте позже.")
      }
    } catch (error) {
      setRequestStatus("error")
      setRequestMessage("Ошибка при создании заявки: " + (error.response?.data?.detail || error.message))
    } finally {
      setIsLoading(false)
    }
  }

  const currentCurrency = currencies.find(c => c.id === selectedCurrency)
  const isYoutuber = userRole === "youtuber"

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 pointer-events-auto" onClick={onClose}/>
      <div className="absolute left-0 right-0 h-full pointer-events-auto"
        style={{
          bottom: keyboardHeight > 0 ? `${keyboardHeight + 500}px` : '300px',
          background: 'linear-gradient(180deg, rgba(33, 36, 41, 0.5) 38.34%, rgba(0, 166, 255, 0.5) 100%)',
          zIndex: 60,
        }}
      />
      <Dialog.Panel
        className="fixed left-0 right-0 bg-[rgba(48,51,58,1)] rounded-t-[50px] pointer-events-auto transition-all duration-300 pb-[50px]"
        style={{
          bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px',
          height: '450px',
          zIndex: 70
        }}
      >
        <div className="market-content h-full flex flex-col px-[20px]">
          <div className="pt-[30px] text-center flex-shrink-0">
            <h2 className='font-bold text-[24px] leading-[110%] tracking-[-0.02em] text-white mb-[25px]'>
              Обмен монет на валюту:
            </h2>
          </div>
          <div className="flex justify-between gap-[10px] mb-[25px] flex-shrink-0">
            {currencies.map((currency) => (
              <button
                key={currency.id}
                onClick={() => selectCurrency(currency.id)}
                className={`flex-1 h-[45px] rounded-[10px] font-semibold text-[14px] leading-[110%] tracking-[-0.02em] transition-all ${
                  selectedCurrency === currency.id
                    ? 'bg-[rgba(45,92,200,1)] text-white'
                    : 'bg-[rgba(50,54,60,1)] text-white hover:bg-[rgba(60,64,70,1)]'
                }`}
              >
                {currency.name}
              </button>
            ))}
          </div>
          <div className="text-center mb-[25px] flex-shrink-0">
            <div className="flex justify-center items-center gap-[25px] text-[35px] text-white">
              <div className="flex items-center gap-[8px]">
                <img src={coin} alt="" className='w-[24px] h-[24px]' />
                <span className="font-semibold text-[27px]">{userBalance.toLocaleString()}</span>
              </div>
              <span className="text-[rgba(255,255,255,0.7)]"> ≈</span>
              <div className="flex items-center gap-[8px]">
                <img 
                  src={currencyIcons[selectedCurrency]} 
                  alt={currentCurrency?.name} 
                  className='w-[48px] h-[48px]' 
                />
                <span className="font-semibold text-[27px] text-[#ffcc15]">
                  {calculateBalanceCrystals()}
                </span>
              </div>
            </div>
          </div>
          {!isYoutuber && (
            <CountdownTimer secondsLeft={secondsLeft} />
          )}
          {requestStatus && (
            <div className={`mb-[15px] text-[12px] text-center p-[10px] rounded-[10px] flex-shrink-0 ${
              requestStatus === "pending" ? "bg-blue-100 text-blue-700" :
              requestStatus === "success" ? "bg-green-100 text-green-700" :
              "bg-red-100 text-red-700"
            }`}>
              {requestMessage}
            </div>
          )}
          <div className="flex-1 flex flex-col justify-end pb-[20px]">
            <div className="relative w-full flex mb-[10px]">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onFocus={() => setIsAmountFocused(true)}
                onBlur={() => setIsAmountFocused(false)}
                className="w-full h-[45px] bg-[rgba(40,43,50,1)] text-white text-center placeholder-transparent outline-none rounded-[10px]"
                style={{ fontSize: '16px' }}
                disabled={!isYoutuber || isLoading || requestStatus === "pending"}
              />
              {!amount && !isAmountFocused && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <img src={coin} alt="" className="w-[15px] h-[15px]" />
                    <span className="font-roboto font-semibold text-[14px] leading-[110%] tracking-[-0.02em] text-[rgba(99,99,99,1)]">Введите сумму</span>
                  </div>
                </div>
              )}
            </div>
            <div className="relative w-full flex mb-[15px]">
              <input
                type="text"
                value={uid}
                onChange={e => setUid(e.target.value)}
                onFocus={() => setIsUidFocused(true)}
                onBlur={() => setIsUidFocused(false)}
                className="w-full h-[45px] bg-[rgba(40,43,50,1)] text-white text-center outline-none font-roboto font-semibold text-[14px] leading-[110%] tracking-[-0.02em] rounded-[10px] placeholder-transparent"
                style={{ fontSize: '16px' }}
                disabled={!isYoutuber || isLoading || requestStatus === "pending"}
              />
              {!uid && !isUidFocused && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="font-roboto font-semibold text-[14px] leading-[110%] tracking-[-0.02em] text-[rgba(99,99,99,1)]">Введите почту</span>
                </div>
              )}
            </div>
            <button
              onClick={handleExchangeRequest}
              disabled={!isYoutuber || isLoading || !amount || !uid || requestStatus === "pending"}
              className={`w-full h-[50px] rounded-[10px] text-white transition font-semibold text-[16px] leading-[110%] tracking-[-0.02em] ${
                !isYoutuber || isLoading || !amount || !uid || requestStatus === "pending"
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-[rgba(45,92,200,1)] hover:bg-[rgba(35,82,190,1)]'
              }`}
            >
              {isLoading ? "Отправляем..." : requestStatus === "pending" ? "Заявка отправлена" : "Отправить заявку"}
            </button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
