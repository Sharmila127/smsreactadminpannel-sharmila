/* eslint-disable @typescript-eslint/no-explicit-any */
import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar/Navbar.tsx';
import { Sidebar } from '../../components/common/Sidebar/Sidebar.tsx';
import { COLORS } from '../../constants/uiConstants.ts';
import { SocketProvider } from '../../context/adminSocket';
import Client from '../../api/index.ts';

export const MainLayout = () => {
	const publicVapidKey = import.meta.env.VITE_PUBLIC_VAPI_KEY;

	function urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/\\-/g, '+')
			.replace(/_/g, '/');
		const rawData = atob(base64);
		return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
	}

	if ('serviceWorker' in navigator && 'PushManager' in window) {
		navigator.serviceWorker
			.register('/ServiceWorker.js')
			.then(async (register: any) => {
				const sub = await register.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
				});

				await new Client().admin.Subcription.post(sub);
			});
	}

	return (
		<SocketProvider role='admin'>
			<div className='flex h-screen bg-gray-100 scrollbar-hide'>
				{/* Sidebar takes up 1/9 of the width */}
				<div className='w-1/7'>
					<Sidebar />
				</div>

				{/* Main content takes up the remaining 8/9 of the width */}
				<div className='flex-1 flex flex-col overflow-hidden'>
					<Navbar
						user={{
							name: '',
							phone: '',
							email: '',
							avatar: '',
							role: '',
							location: '',
							joinDate: '',
							status: '',
						}}
					/>
					<main className='flex-1 overflow-auto scrollbar-hide'>
						<div
							className='p-4 rounded shadow px-8'
							style={{ backgroundColor: COLORS.bgColor }}
						>
							<Outlet />
						</div>
					</main>
				</div>
			</div>
		</SocketProvider>
	);
};
