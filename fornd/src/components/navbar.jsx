import group from '../assets/group.svg';
import click from '../assets/click.svg';
import home from '../assets/home.svg';
import change from '../assets/change.svg';

const coin3 = "https://res.cloudinary.com/dufl71suj/image/upload/v1751037405/tankcoin.png"

function NavBar({ onFriendsClick, onWalletClick, onQuestsClick, onMarketClick }) {
  return (
    <div className="px-[18px]">
      <div className="bg-[rgba(50,54,60,0.7)] flex items-center justify-between px-[10px] py-[5.5px] rounded-[10px]">
        <button className="flex flex-col items-center h-[49px] px-3 pt-1 bg-[rgba(44,47,53,0.66)] rounded-[10px] outline-none focus:outline-none">
          <img src={click} alt="" className="w-6 h-6" />
          <p className="text-xs text-white/50 font-medium">Ферма</p>
        </button>
        <button onClick={onQuestsClick} className="flex flex-col px-3 pt-1 items-center h-[49px] outline-none focus:outline-none">
          <img src={home} alt="Задания" className="w-6 h-6" />
          <p className="text-xs text-white/50 font-medium">Задания</p>
        </button>
        <button onClick={onFriendsClick} className="flex flex-col px-3 pt-1 items-center h-[49px] outline-none focus:outline-none">
          <img src={group} alt="" className="w-6 h-6" />
          <p className="text-xs text-white/50 font-medium">Друзья</p>
        </button>
        <button onClick={onWalletClick} className="flex flex-col px-3 pt-1 items-center h-[49px] outline-none focus:outline-none">
          <img src={change} alt="" className="w-6 h-6" />
          <p className="text-xs text-white/50 font-medium">Кошелек</p>
        </button>
        <button onClick={onMarketClick} className="flex flex-col px-3 pt-1 items-center h-[49px] outline-none focus:outline-none">
          <img src={coin3} alt="" className="w-6 h-6" />
          <p className="text-xs text-white/50 font-medium">Рынок</p>
        </button>
      </div>
    </div>
  );
}

export default NavBar;
