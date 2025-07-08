import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "https://tank-coin.ru/api";
const ADMIN_API_URL = "https://tank-coin.ru/api/admin";


const initialForm = {
  telegram_id: '',
  amount: '',
  new_level: '',
  clicks: '',
  energy: '',
  role: ''
};

export default function AdminPanel() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const adminSecret = sessionStorage.getItem('admin_secret');
  const [promoForm, setPromoForm] = useState({ 
    code: '', 
    reward_type: 'coins', 
    value: '', 
    uses_left: 1 
  });
  const [promoMsg, setPromoMsg] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchExchangeRequests();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users?admin_secret=${encodeURIComponent(adminSecret)}`);
      setUsers(res.data);
    } catch (error) {
      setMessage('Ошибка загрузки пользователей: ' + (error.response?.data?.detail || error.message));
    }
  };

  const fetchExchangeRequests = async () => {
    try {
      const res = await axios.get(
        `${ADMIN_API_URL}/exchange-requests?admin_secret=${encodeURIComponent(adminSecret)}`
      );
      setExchangeRequests(res.data);
    } catch (error) {
      setMessage('Ошибка загрузки заявок: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePromoChange = e => {
    setPromoForm({ ...promoForm, [e.target.name]: e.target.value });
  };

  const handleCreatePromo = async () => {
    setPromoMsg('');
    try {
      await axios.post(
        `${ADMIN_API_URL}/create-promocode?admin_secret=${encodeURIComponent(adminSecret)}`,
        {
          code: promoForm.code || undefined,
          reward_type: promoForm.reward_type,
          value: Number(promoForm.value),
          uses_left: Number(promoForm.uses_left)
        }
      );
      setPromoMsg('Промокод создан!');
      setPromoForm({ code: '', reward_type: 'coins', value: '', uses_left: 1 });
    } catch (error) {
      setPromoMsg('Ошибка: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleAction = async (endpoint, data, label) => {
    setLoading(true);
    setMessage('');
    try {
      await axios.post(
        `${ADMIN_API_URL}/${endpoint}?admin_secret=${encodeURIComponent(adminSecret)}`,
        data
      );
      setMessage(`${label} успешно!`);
      fetchUsers();
    } catch (error) {
      setMessage(
        'Ошибка: ' +
        (error.response?.data?.detail || error.message || 'Неизвестная ошибка')
      );
    }
    setLoading(false);
  };

  const handleExchangeAction = async (requestId, action) => {
    setLoading(true);
    setMessage('');
    try {
      await axios.post(
        `${ADMIN_API_URL}/exchange-requests/${requestId}/${action}?admin_secret=${encodeURIComponent(adminSecret)}`
      );
      setMessage(`Заявка ${action === 'approve' ? 'подтверждена' : 'отклонена'}!`);
      fetchExchangeRequests();
      fetchUsers();
    } catch (error) {
      setMessage(
        'Ошибка: ' +
        (error.response?.data?.detail || error.message || 'Неизвестная ошибка')
      );
    }
    setLoading(false);
  };


  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-2 min-h-screen">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-indigo-900">TANKCOIN Admin Panel</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 w-full max-w-xl mx-auto mb-8">
          <h2 className="font-semibold text-lg text-indigo-700 mb-2">Создать промокод</h2>
          <input
            name="code"
            placeholder="Промокод (опционально)"
            value={promoForm.code}
            onChange={handlePromoChange}
            className="p-3 rounded border"
          />
          <select
            name="reward_type"
            value={promoForm.reward_type}
            onChange={handlePromoChange}
            className="p-3 rounded border"
          >
            <option value="coins">Коины</option>
            <option value="energy">Энергия</option>
          </select>
          <input
            name="value"
            type="number"
            placeholder="Значение"
            value={promoForm.value}
            onChange={handlePromoChange}
            className="p-3 rounded border"
          />
          <input
            name="uses_left"
            type="number"
            placeholder="Лимит использований"
            value={promoForm.uses_left}
            onChange={handlePromoChange}
            className="p-3 rounded border"
          />
          <button
            onClick={handleCreatePromo}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-2 rounded"
          >
            Создать
          </button>
          {promoMsg && <div className="mt-2 text-center">{promoMsg}</div>}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="font-semibold text-lg text-indigo-700 mb-4">
            Все пользователи <span className="text-gray-500">({users.length})</span>
          </h2>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Username</th>
                  <th className="text-left p-2">Коины</th>
                  <th className="text-left p-2">Уровень</th>
                  <th className="text-left p-2"></th>
                  <th className="text-left p-2"></th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.telegram_id} className="hover:bg-indigo-50">
                    <td className="p-2">{user.telegram_id}</td>
                    <td className="p-2">{user.username}</td>
                    <td className="p-2">{user.coins}</td>
                    <td className="p-2">{user.level}</td>
                    <td className="p-2">
                      <button
                        className="text-indigo-600 underline"
                        onClick={() => setSelectedUser(user)}
                      >
                        Подробнее
                      </button>
                    </td>
                    <td className="p-2">
                     
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="font-semibold text-lg text-indigo-700 mb-4">Заявки на обмен валюты</h2>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Пользователь</th>
                  <th className="text-left p-2">UID</th>
                  <th className="text-left p-2">Сумма</th>
                  <th className="text-left p-2">Валюта</th>
                  <th className="text-left p-2">Статус</th>
                  <th className="text-left p-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {exchangeRequests.map(request => (
                  <tr key={request.id} className="hover:bg-indigo-50">
                    <td className="p-2">{request.id}</td>
                    <td className="p-2">
                      {request.user?.username} (ID: {request.user_id})
                    </td>
                    <td className="p-2">{request.uid}</td>
                    <td className="p-2">
                      {request.amount} → {request.received_amount}
                    </td>
                    <td className="p-2">{request.to_currency}</td>
                    <td className="p-2">{request.status}</td>
                    <td className="p-2">
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleExchangeAction(request.id, 'approve')}
                            className="text-green-600 underline"
                            disabled={loading}
                          >
                            Подтвердить
                          </button>
                          <button
                            onClick={() => handleExchangeAction(request.id, 'reject')}
                            className="text-red-600 underline"
                            disabled={loading}
                          >
                            Отклонить
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {selectedUser && (
          <div
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 border-r border-gray-200 transition-transform duration-300"
            style={{ transform: selectedUser ? 'translateX(0)' : 'translateX(-100%)' }}
          >
            <button
              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-700"
              onClick={() => setSelectedUser(null)}
            >×</button>
            <h2 className="text-xl font-bold mb-4 text-indigo-700 mt-8 ml-6">Информация о пользователе</h2>
            <div className="space-y-2 text-sm max-h-[calc(100vh-100px)] overflow-y-auto px-6 pb-6">
              {Object.entries(selectedUser).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b py-1">
                  <span className="font-semibold text-gray-700">{key}:</span>
                  <span className="text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 w-full">
            <h2 className="font-semibold text-lg text-indigo-700 mb-2">Монеты</h2>
            <input
              type="number"
              name="telegram_id"
              placeholder="Telegram ID"
              className="p-3 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-400"
              value={form.telegram_id}
              onChange={handleChange}
            />
            <input
              type="number"
              name="amount"
              placeholder="Сумма"
              className="p-3 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-400"
              value={form.amount}
              onChange={handleChange}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('add-coins', { telegram_id: Number(form.telegram_id), amount: Number(form.amount) }, 'Коины начислены')}
                className="flex-1 bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition"
                disabled={loading}
              >+ Коины</button>
              <button
                onClick={() => handleAction('remove-coins', { telegram_id: Number(form.telegram_id), amount: Number(form.amount) }, 'Коины списаны')}
                className="flex-1 bg-pink-500 hover:bg-pink-700 text-white font-semibold py-2 rounded transition"
                disabled={loading}
              >- Коины</button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 w-full">
            <h2 className="font-semibold text-lg text-indigo-700 mb-2">Уровень</h2>
            <input
              type="number"
              name="telegram_id"
              placeholder="Telegram ID"
              className="p-3 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-400"
              value={form.telegram_id}
              onChange={handleChange}
            />
            <input
              type="number"
              name="new_level"
              placeholder="Новый уровень"
              className="p-3 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-400"
              value={form.new_level}
              onChange={handleChange}
            />
            <button
              onClick={() => handleAction('set-level', { telegram_id: Number(form.telegram_id), new_level: Number(form.new_level) }, 'Уровень обновлён')}
              className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
              disabled={loading}
            >Изменить уровень</button>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 w-full">
            <h2 className="font-semibold text-lg text-indigo-700 mb-2">Клики</h2>
            <input
              type="number"
              name="telegram_id"
              placeholder="Telegram ID"
              className="p-3 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-400"
              value={form.telegram_id}
              onChange={handleChange}
            />
            <input
              type="number"
              name="clicks"
              placeholder="Новое количество кликов"
              className="p-3 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-400"
              value={form.clicks}
              onChange={handleChange}
            />
            <button
              onClick={() => handleAction('set-clicks', { telegram_id: Number(form.telegram_id), clicks: Number(form.clicks) }, 'Клики обновлены')}
              className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-semibold py-2 rounded transition"
              disabled={loading}
            >Изменить клики</button>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 w-full">
            <h2 className="font-semibold text-lg text-indigo-700 mb-2">Энергия</h2>
            <input
              type="number"
              name="telegram_id"
              placeholder="Telegram ID"
              className="p-3 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-400"
              value={form.telegram_id}
              onChange={handleChange}
            />
            <input
              type="number"
              name="energy"
              placeholder="Новое значение энергии"
              className="p-3 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-400"
              value={form.energy}
              onChange={handleChange}
            />
            <button
              onClick={() => handleAction('set-energy', { telegram_id: Number(form.telegram_id), energy: Number(form.energy) }, 'Энергия обновлена')}
              className="bg-blue-400 hover:bg-blue-600 text-white font-semibold py-2 rounded transition"
              disabled={loading}
            >Изменить энергию</button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 w-full max-w-2xl mx-auto mb-8">
          <h2 className="font-semibold text-lg text-indigo-700 mb-2">Роль</h2>
          <input
            type="number"
            name="telegram_id"
            placeholder="Telegram ID"
            className="p-3 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-400"
            value={form.telegram_id}
            onChange={handleChange}
          />
          <select
            name="role"
            className="p-3 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-400"
            value={form.role}
            onChange={handleChange}
          >
            <option value="">Выберите роль</option>
            <option value="player">player</option>
            <option value="youtuber">youtuber</option>
          </select>
          <button
            onClick={() => handleAction('set-role', { telegram_id: Number(form.telegram_id), new_role: form.role }, 'Роль обновлена')}
            className="bg-purple-500 hover:bg-purple-700 text-white font-semibold py-2 rounded transition"
            disabled={loading}
          >Изменить роль</button>
        </div>
        {message && (
          <div className={`mt-8 p-4 rounded-xl text-center font-semibold shadow ${message.startsWith('Ошибка') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
