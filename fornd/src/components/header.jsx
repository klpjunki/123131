import React, { useEffect, useState } from 'react';
import defaultAvatar from '../assets/f1.svg';
import news from '../assets/news.svg';

function Header({ telegramId }) {
    const [username, setUsername] = useState("Загрузка...");
    const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);

    const supportUrl = "https://t.me/lerchikwot"; 
    const newsUrl = "https://t.me/gacha_coin";

    useEffect(() => {
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
            setUsername(tgUser.username || "Пользователь");
            setAvatarUrl(tgUser.photo_url || defaultAvatar);
        }
    }, []);
    const openLink = (url) => {
        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(url);
        } else {
            window.open(url, '_blank');
        }
    };

    return (
        <header className='text-white flex justify-between pt-[16px] px-[18px] pb-[27px] '>
            <div className='flex items-center gap-[9px] justify-center'>
                <img src={avatarUrl} alt="avatar" className="w-[32px] h-[32px] rounded-[10px] object-cover" />
                <p className='text-[12px] font-semibold'>{username}</p>
            </div>
            <div className='flex items-center justify-center gap-[6px]'>
                <button
                    onClick={() => openLink(supportUrl)}
                    className='text-[12px] font-semibold bg-[linear-gradient(180deg,_rgba(255,255,255,0.06)_0%,_rgba(78,73,73,0.2)_100%)] w-[81.28px] h-[35px] rounded-[10px]'
                >
                    Поддержка
                </button>
                <button
                    onClick={() => openLink(newsUrl)}
                    className='flex items-center text-[12px] font-semibold w-[97.42px] h-[35px] bg-[linear-gradient(180deg,_rgba(255,255,255,0.06)_0%,_rgba(78,73,73,0.2)_100%)] justify-between px-[8px] rounded-[10px]'
                >
                    <img className='w-[26px] h-[25px] text-[rgba(0,0,0,1)] ' src={news} alt="news" />
                    <p>Новости</p>
                </button>
            </div>
        </header>
    );
}

export default Header;
