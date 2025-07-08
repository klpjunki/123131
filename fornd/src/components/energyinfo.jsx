import { Dialog } from '@headlessui/react'

export default function EnergyInfo({ open, onClose, onQuestsClick }) {
  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-opacity-40 pointer-events-auto" onClick={onClose} />
      <div
        className="absolute left-0 right-0 h-full pointer-events-auto"
        style={{
          bottom: '228px',
          background: 'linear-gradient(180deg, rgba(33, 36, 41, 0.5) 38.34%, rgba(0, 166, 255, 0.5) 100%)',
          zIndex: 60,
        }}
      />
      <Dialog.Panel
        className="fixed left-0 right-0 bg-[rgba(48,51,58,1)] rounded-t-[50px] pointer-events-auto transition-all duration-300 mx-auto p-8 z-70"
        style={{ bottom: 0, height: '280px' }}
      >
        <div className="flex flex-col items-center justify-between h-full">
          <h1 className='text-[18px] text-white font-bold text-center'>Количество потраченной энергии за 1 клик по монете</h1>
          <p className='text-[13px] text-white font-bold text-center'>Энергия восстанавливается со временем. Кол-во энергии зависит от твоего уровня. Энергию можно получать за выполнение заданий и приглашение друзей</p>
          <button
            className='text-[16px] text-white text-center bg-[rgba(45,92,200,1)] w-full py-[16px] rounded-[10px]'
            onClick={() => {
              onClose();
              onQuestsClick();
            }}
          >
            Список заданий
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
