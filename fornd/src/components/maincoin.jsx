import { useState } from 'react';
import api from "../api";


const bigcoin = "https://res.cloudinary.com/dufl71suj/image/upload/v1751037405/tankcoin.png"

function MainCoin({ telegramId, onCoinClick }) {
    const [isShaking, setIsShaking] = useState(false);

    const handleSubmit = () => {
        if (!telegramId) return;
        
        setIsShaking(true);
        
        api.post(`/users/${telegramId}/click`, {})
            .then(() => {
                if (onCoinClick) onCoinClick();
            })
            
        setTimeout(() => {
            setIsShaking(false);
        }, 200);
    };

    return (
        <div className='flex items-center justify-center mt-[30px]'>
            <button onClick={handleSubmit}>
                <img 
                    src={bigcoin} 
                    alt="click" 
                    className={`transition-transform duration-200 ${
                        isShaking ? 'animate-gentle-shake' : ''
                    }`}
                />
            </button>
        </div>
    );
}

export default MainCoin;
