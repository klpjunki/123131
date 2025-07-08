import React, { useEffect, useState } from "react";
import right from '../assets/right.svg';
import api from "../api";

function Balance({ telegramId, updateTrigger, onOpenLevelModal }) {
    const [balance, setBalance] = useState(0);
    const [level, setLevel] = useState(1);
    const [totalClicks, setTotalClicks] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const getRequiredClicksForLevel = (level) => {
        return level <= 1 ? 0 : 10000 * (level - 1);
    };

    const coin1 = "https://res.cloudinary.com/dufl71suj/image/upload/v1751037405/tankcoin.png"

    const calculateProgressPercent = () => {
        const currentLevelClicks = getRequiredClicksForLevel(level);
        const nextLevelClicks = getRequiredClicksForLevel(level + 1);
        if (nextLevelClicks === currentLevelClicks) return 100;
        const percent = ((totalClicks - currentLevelClicks) / (nextLevelClicks - currentLevelClicks)) * 100;
        return Math.min(Math.max(percent, 0), 100);
    };

    useEffect(() => {
        if (!telegramId) return;
        setIsLoading(true);
        api.get(`/users/${telegramId}`)
            .then(res => {
                setBalance(res.data.coins);
                setLevel(res.data.level);
                setTotalClicks(res.data.total_clicks);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [telegramId, updateTrigger]);

    const procent = `${calculateProgressPercent()}%`;

    return (
        <div className='px-[18px]'>
            <div className='flex items-center gap-2 justify-center mt-[25px] mb-2'>
                <img className='w-[42px] h-[42px]' src={coin1} alt="" />
                <p className={`text-[rgba(255,254,253,1)] font-roboto font-bold text-[40px] leading-[110%] tracking-[-0.02em] transition-all duration-300 ${isLoading ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}`}>
                    {balance?.toLocaleString() || 0}
                </p>
            </div>
            <div onClick={onOpenLevelModal}>
            <div>
                <div className='flex items-center justify-between mb-[7px]'>
                    <div 
                        className='font- text-[7px] leading-[110%] tracking-[-0.02em] text-white flex gap-[3px]'
                        onClick={onOpenLevelModal}
                    >
                        Прапорщик <img src={right} alt="right" />
                    </div>
                    <div className='font- text-[7px] leading-[110%] tracking-[-0.02em] flex items-center justify-center gap-0.5'>
                        <p className='text-[rgba(255,255,255,0.5)]'>Level</p>
                        <p className={`text-[rgba(255,255,255,1)] transition-all duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
                            {level}/10
                        </p>
                    </div>
                </div>
            </div>
            <div className='w-full h-[9px] bg-[rgba(50,54,60,1)] border-[rgba(85,85,85,0.75)] border-[1px] rounded-[30px] relative'>
                <div 
                    className='absolute top-0 left-0 bg-gradient-to-r from-[rgba(65,217,247,1)] to-[rgba(238,141,233,1)] h-full rounded-[30px] transition-all duration-500 ease-in-out' 
                    style={{width: procent }}
                />
            </div>
            </div>
        </div>
    );
}

export default Balance;
