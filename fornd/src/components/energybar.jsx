import React, { useState, useEffect } from 'react';
import enegry from '../assets/energy.svg';
import que from '../assets/que.svg';
import api from "../api";

function EnergyBar({ telegramId, updateTrigger }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeUntilFull, setTimeUntilFull] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!telegramId) return;
            
            try {
                const response = await api.get(`/users/${telegramId}`);
                setUserData(response.data);
                if (response.data.energy < response.data.max_energy) {
                    const energyPerSecond = 1/6;
                    const energyNeeded = response.data.max_energy - response.data.energy;
                    const timeNeeded = energyNeeded / energyPerSecond;
                    setTimeUntilFull(timeNeeded);
                } else {
                    setTimeUntilFull(0);
                }
                
                setError(null);
            } catch (err) {
                setError(err.response?.data?.detail || "Ошибка загрузки данных");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const timerInterval = setInterval(() => {
            setTimeUntilFull(prevTime => {
                if (prevTime <= 0) return 0;
                return prevTime - 1;
            });
        }, 1000);
        const dataInterval = setInterval(fetchData, 30000);
        
        return () => {
            clearInterval(timerInterval);
            clearInterval(dataInterval);
        };

    }, [telegramId, updateTrigger]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    };

    if (loading) {
        return <div className="text-white">Загрузка...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className='px-[18px] flex items-center justify-between mb-[19.4px]'>
            <div className='flex items-center gap-[5px]'>  
                <img src={enegry} alt="energy" />
                <p className='font-[600] text-[14px] leading-[110%] tracking-[-0.02em] text-white'>
                    {userData.energy}/{userData.max_energy}
                </p>
            </div>
            <div className='flex items-center justify-center gap-[6px]'>
                <p className='font-[500] text-[11px] text-center leading-[110%] tracking-[-0.02em] text-[rgba(255,255,255,0.5)]'>
                    {timeUntilFull > 0 ? formatTime(timeUntilFull) : "Полная"}
                </p>
                <img className='h-[14px] align-middle -mt-[2px]' src={que} alt="que" />
            </div>
        </div>
    );
}

export default EnergyBar;
