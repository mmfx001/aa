import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();
    const formRef = useRef(null);

    useEffect(() => {
        // localStorage dan 'hasVisited' ni tekshirish
        const hasVisited = localStorage.getItem('hasVisited');

        if (!hasVisited) {
            alert("Bu web siteda bazi xatolar va kechikishlar mavjud! Biror xato topsangiz, shu chatApp ning ozidan barcha usersdan qidirib (_sherbek_off) ga yozing.");
            // 'hasVisited' ni localStorage ga qo'shish
            localStorage.setItem('hasVisited', 'true');
        }
    }, []); 

    const clearMessage = () => {
        setTimeout(() => {
            setMessage('');
        }, 5000);
    };

    const toggleForm = () => {
        setIsSignUp((prev) => !prev);
        setMessage(''); // Clear message when toggling
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form submission
        if (isSignUp) {
            await handleSignUp();
        } else {
            await handleLogin();
        }
    };

    const handleLogin = async () => {
        try {
            const { data: users } = await axios.get('https://insta-2-e60y.onrender.com/users');
            const user = users.find(v => v.email == email && v.password == password);

            if (user) {
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                navigate('/live');
                return;
            }

            setMessage('Foydalanuvchi topilmadi.');
            clearMessage();
        } catch (error) {
            console.error('Error:', error);
            setMessage('Tarmoq xatosi. Iltimos qayta urinib ko\'ring.');
            clearMessage();
        }
    };

    const handleSignUp = async () => {
        try {
            const { data: users } = await axios.get('https://insta-2-e60y.onrender.com/users');
            const existingUser = users.find(v => v.email == email);

            if (existingUser) {
                setMessage('Email allaqachon ishlatilmoqda.');
                clearMessage();
                return;
            }

            const response = await axios.post('https://insta-2-e60y.onrender.com/users', { email, password });

            if (response.status == 201) {
                setMessage('Hisob muvaffaqiyatli yaratildi.'); 
                clearMessage();
                setIsSignUp(false); // Switch to login mode
                setEmail('');
                setPassword('');
            } else {
                setMessage('Hisob muvaffaqiyatli yaratildi.'); 
                setIsSignUp(false); // Switch to login mode

                clearMessage();
            }
        } catch (error) {
            console.error('parol sonda bolsin', error);
            setMessage('Tarmoq xatosi. yoki parolni sonda kiriting va Iltimos qayta urinib ko\'ring.');
            clearMessage();
        }
    };

    return (
        <div ref={formRef} className="flex items-center justify-center md:mr-64 min-h-screen bg-white">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    {isSignUp ? 'Ro‘yxatdan o‘tish' : 'Kirish'}
                </h1>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="password"
                    placeholder="Parol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {message && (
                    <p className={`block mb-4 ${message.includes('muvaffaqiyatli') ? 'text-green-500' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}
                <button
                    type="submit"
                    className={`w-full ${isSignUp ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                >
                    {isSignUp ? 'Ro‘yxatdan o‘tish' : 'Kirish'}
                </button>

                <div className='flex gap-2 mt-6 justify-center'>
                    <p>{isSignUp ? 'Hisob mavjudmi?' : "Hisob yo'qmi?"}</p>
                    <button
                        type="button"
                        onClick={toggleForm}
                        className='text-blue-600'>
                        {isSignUp ? 'Kirish' : 'Ro‘yxatdan o‘tish'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;
