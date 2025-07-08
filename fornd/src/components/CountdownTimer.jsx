import { useEffect, useState } from "react";

export default function CountdownTimer({ secondsLeft: initialSeconds }) {
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, initialSeconds));

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="mb-4 text-center text-lg font-bold text-red-400">
      {secondsLeft > 0 ? (
        <>До разблокировки: {days}д {hours}ч {minutes}м {seconds}с</>
      ) : (
        <>Таймер завершён: 0д 0ч 0м 0с</>
      )}
    </div>
  );
}
