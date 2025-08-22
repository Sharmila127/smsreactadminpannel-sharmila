/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullscreenButton from './Fullscreen';
import { ProfileModal } from './ProfileModal';
import { useAuth } from '../../../pages/auth/AuthContext';
import { FONTS } from '../../../constants/uiConstants';
import { useSocket } from '../../../context/adminSocket';
import {
	getByUserNotification,
	markAsReadNotification,
} from '../Notification/services';
import { getProfile } from '../../../features/Auth/service';
interface User {
	name: string;
	phone: string;
	email: string;
	avatar: string;
	role: string;
	location: string;
	joinDate: string;
	status: string;
}

interface Notification {
	id: number;
	_id: string;
	message: string;
	created_at: string;
	is_read: boolean;
	priority: string;
	action_type: string;
	title: string;
	is_active: boolean;
	uuid: string;
	recipient_type: string;
	type: string;
}

interface ProfileModalProps {
	user: User;
}

export const Navbar: React.FC<ProfileModalProps> = () => {
	const [isBellActive, setIsBellActive] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [showProfileDetails, setShowProfileDetails] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);

	const { logout } = useAuth();
	const navigate = useNavigate();
	const socket = useSocket();

	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const notificationRef = useRef<HTMLDivElement | null>(null);

	const [notifications, setNotifications] = useState<Notification[]>([]);

	const [user, setuser] = useState<any>({
		firstName: '',
		image: '',
	});

	const fetchProfile = async () => {
		try {
			const data: any = await getProfile('');
			setuser(data.data.data);
		} catch (error) {
			console.error('Failed to fetch profile:', error);
		}
	};

	// Handle outside clicks for dropdown & notifications
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsDropdownOpen(false);
			}
			if (
				notificationRef.current &&
				!notificationRef.current.contains(e.target as Node)
			) {
				setShowNotifications(false);
			}
		};
		fetchProfile();
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleBellClick = () => {
		setIsBellActive(true);
		setShowNotifications((prev) => !prev);
		setTimeout(() => setIsBellActive(false), 150);
	};

	const handleViewAllNotifications = () => {
		setShowNotifications(false);
		navigate('/notifications');
	};

	const handleSosClick = () => {
		navigate('/sos');
	};

	const toggleDropdown = () => {
		setIsDropdownOpen((prev) => !prev);
	};

	const handleUserUpdate = (_updatedUser: User) => {};

	const unreadCount = notifications.filter((n) => !n.is_read).length;

	const filtered = notifications.filter((n) => {
		if (n.recipient_type !== 'admin') return false;
		return n;
	});

	const handleLogout = () => {
		logout();
		navigate('/');
		console.log('User logged out');
	};

	useEffect(() => {
		const fetchNotifications = async () => {
			const userId: any = localStorage.getItem('adminobjectid');
			try {
				const res: any = await getByUserNotification(userId);
				console.log('resUserNotify', res);
				setNotifications(res.data?.data?.notifications || []);
			} catch (err) {
				console.error('Fetch error', err);
			}
		};
		fetchNotifications();
	}, []);

	useEffect(() => {
		if (!socket) return;

		const handleNotify = (data: any) => {
			console.log('Notification from Customer ', data);
			setNotifications((prev) => [data, ...prev]);
		};

		socket.on('newNotification', handleNotify);

		return () => {
			socket.off('newNotification', handleNotify);
		};
	}, [socket]);

	const getDateLabel = (isoDateStr: string): string => {
		const inputDate = new Date(isoDateStr);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);

		const isSameDay = (d1: Date, d2: Date): boolean =>
			d1.getDate() === d2.getDate() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getFullYear() === d2.getFullYear();

		const time = inputDate.toLocaleTimeString('en-IN', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});

		if (isSameDay(inputDate, today)) return `Today at ${time}`;
		if (isSameDay(inputDate, yesterday)) return `Yesterday at ${time}`;

		const date = inputDate.toLocaleDateString('en-IN', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		});

		return `${date} at ${time}`;
	};

	const notifyHandle = async (n: Notification) => {
		if (!n.is_read) {
			await markAsReadNotification(n.uuid);
			if (n.type === 'serviceReq') {
				await navigate('/bookings');
			} else if (n.type === 'orderReq') {
				await navigate('/order');
			} else {
				await navigate('/service');
			}
			setNotifications((prev) =>
				prev.map((m) => (m._id === n._id ? { ...m, is_read: true } : m))
			);
		} else if (n.type === 'serviceReq') {
			await navigate('/bookings');
		} else if (n.type === 'orderReq') {
			await navigate('/order');
		} else {
			await navigate('/service');
		}
	};

	return (
		<>
			<nav
				style={{ backgroundColor: '#9b111e', height: '64px' }}
				className='flex items-center px-4'
			>
				<div className='flex items-center ml-5 gap-2'>
					<input
						type='text'
						placeholder='Search...'
						className='bg-white text-black placeholder-gray-500 rounded-full px-4 py-2 w-60 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b1b1b] transition-all'
					/>
					<button
						type='submit'
						className='bg-white rounded-full p-3 hover:scale-105 transition-transform'
					>
						<svg
							className='w-4 h-4 text-[#9b111e]'
							fill='none'
							stroke='currentColor'
							strokeWidth={3}
							strokeLinecap='round'
							strokeLinejoin='round'
							viewBox='0 0 24 24'
						>
							<path d='M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z' />
						</svg>
					</button>
				</div>

				{/* Fullscreen */}
				<div className='relative w-full'>
					<div className='absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-4'>
						{/* Fullscreen Button */}
						<FullscreenButton />

						{/* SOS Emergency Icon */}
						<div className='relative'>
							{/* <span className="absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75 animate-ping"></span> */}
							{/* <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-500 border-2 border-white rounded-full z-20" /> */}
							<button
								onClick={handleSosClick}
								className='relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white !text-[#9b111e]  !shadow-lg hover:!scale-105 transition-transform'
								style={{ ...FONTS.cardSubHeader }}
							>
								SOS
							</button>
						</div>
					</div>
				</div>

				<div className='ml-auto flex items-center space-x-4 pr-4'>
					<div className='relative' ref={notificationRef}>
						<button
							aria-label='Notifications'
							onClick={handleBellClick}
							className={`relative p-2.5 rounded-full bg-white focus:outline-none transform transition-transform duration-200 ease-in-out ${
								isBellActive ? 'scale-90' : 'scale-100'
							}`}
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={1.8}
								stroke='currentColor'
								className='w-5 h-5 text-[#9b111e]'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6V11c0-3.3-2.2-6.1-5.3-6.8V4a.7.7 0 00-1.4 0v.2C8.2 4.9 6 7.7 6 11v5l-1.7 1.7a1 1 0 00.7 1.7h14a1 1 0 00.7-1.7L18 16z'
								/>
							</svg>
							{unreadCount > 0 && (
								<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full'>
									{unreadCount}
								</span>
							)}
						</button>

						{showNotifications && (
							<div className='absolute right-0 mt-2 w-80 rounded-lg shadow-xl bg-white z-50 overflow-hidden'>
								<div className='bg-gradient-to-r from-red-600 to-red-800 p-3'>
									<h3
										className='!text-white '
										style={{ ...FONTS.cardSubHeader }}
									>
										Notifications
									</h3>
								</div>
								<div className='max-h-80 overflow-y-auto'>
									{filtered.length > 0 ? (
										filtered
											.sort(
												(a, b) =>
													new Date(b.created_at).getTime() -
													new Date(a.created_at).getTime()
											)
											.map((notification) => (
												<div
													key={notification.id}
													className={`group relative p-3 border-b hover:bg-gray-50 transition-colors duration-150 ${
														notification.is_read ? 'bg-white' : 'bg-red-50'
													}`}
												>
													{/* This vertical red line will now appear on hover */}
													<div className='absolute left-0 top-0 h-full w-1 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>

													<div
														className='flex justify-between items-start cursor-pointer'
														onClick={async () =>
															await notifyHandle(notification)
														}
													>
														<p className='text-sm text-black'>
															{notification.title}
														</p>
														{!notification.is_read && (
															<span className='w-2 h-2 rounded-full bg-red-600 mt-1 ml-2 '></span>
														)}
													</div>
													<p className='text-xs text-gray-500 mt-1 cursor-pointer'>
														{getDateLabel(notification.created_at)}
													</p>
												</div>
											))
									) : (
										<p className='p-3 text-gray-500 text-sm'>
											No notifications
										</p>
									)}
								</div>
								<div className='p-3 bg-gray-50 text-center border-t'>
									<button
										onClick={handleViewAllNotifications}
										className='!text-red-600 hover:!text-red-800 rounded-3xl  !transition-colors'
										style={{
											fontFamily: FONTS.cardSubHeader.fontfamily,
											fontWeight: FONTS.cardSubHeader.fontWeight,
											fontSize: FONTS.cardSubHeader.fontSize,
										}}
									>
										View All Notifications
									</button>
								</div>
							</div>
						)}
					</div>

					<div className='relative' ref={dropdownRef}>
						<div
							className='flex items-center space-x-3 cursor-pointer max-w-xs'
							onClick={toggleDropdown}
						>
							<div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0'>
								<img
									src={user.image}
									alt={user.firstName}
									className='w-full h-full object-cover'
								/>
							</div>
							<div className='flex flex-col flex-nowrap overflow-hidden'>
								<span
									className='text-white font-medium truncate whitespace-nowrap'
									style={{
										fontFamily: "'Figtree-Medium', sans-serif",
										fontWeight: 400,
										fontSize: '14px',
										color: 'white',
									}}
								>
									{user.firstName}
								</span>
								<div
									className='flex items-center whitespace-nowrap'
									style={{
										fontFamily: "'Figtree', sans-serif",
										fontWeight: 300,
										fontSize: '12px',
										color: 'white',
									}}
								>
									Admin
									<svg
										className='w-4 h-6 ml-1 text-[#c13340]'
										fill='none'
										stroke='currentColor'
										strokeWidth={2}
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M19 9l-7 7-7-7'
										/>
									</svg>
								</div>
							</div>
						</div>

						{isDropdownOpen && (
							<div className='absolute right-0 mt-2 w-24 rounded-md shadow-lg z-50 bg-gradient-to-br from-yellow-50 to-yellow-100'>
								<ul className='py-1 text-sm text-[#9b111e]'>
									<li>
										<button
											onClick={() => {
												setShowProfileDetails(true);
												setIsDropdownOpen(false);
											}}
											className='block w-full text-center px-4 py-1 rounded-lg transition-colors duration-200 hover:text-white hover:bg-[#d14c4c]'
										>
											Profile
										</button>
									</li>
									<li>
										<button
											onClick={() => {
												setShowLogoutConfirm(true);
												setIsDropdownOpen(false);
											}}
											className='block w-full text-center px-4 py-1 rounded-lg transition-colors duration-200 hover:text-white hover:bg-[#d14c4c]'
										>
											Logout
										</button>
									</li>
								</ul>
							</div>
						)}
					</div>
				</div>
			</nav>

			{/* Profile Modal Component */}
			<ProfileModal
				isOpen={showProfileDetails}
				onClose={() => setShowProfileDetails(false)}
				onUserUpdate={handleUserUpdate}
				user={user}
			/>

			{/* Logout Confirmation Modal */}
			{showLogoutConfirm && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'>
					<div className='bg-white rounded-xl shadow-lg w-80 p-6 space-y-4 text-center'>
						<h2 className='text-lg font-semibold text-red-600'>
							Are you sure you want to logout?
						</h2>
						<div className='flex justify-center gap-4 mt-4'>
							<button
								onClick={() => setShowLogoutConfirm(false)}
								className='px-4 py-2 rounded-3xl bg-gray-200 hover:bg-gray-300 text-gray-800'
							>
								Cancel
							</button>
							<button
								onClick={() => {
									setShowLogoutConfirm(false);
									setShowLogoutSuccess(true);
									setTimeout(() => {
										setShowLogoutSuccess(false);
										console.log('Redirect or clear session here');
										handleLogout();
									}, 1000);
								}}
								className='px-4 py-2 rounded-3xl bg-red-600 text-white hover:bg-red-700'
							>
								OK
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Logout Success Modal */}
			{showLogoutSuccess && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'>
					<div className='bg-white rounded-xl shadow-xl w-80 p-6 flex flex-col items-center space-y-4 text-center animate-fade-in'>
						{/* Animated Checkmark with Tailwind */}
						<svg
							className='w-16 h-16 text-green-600 animate-draw-check'
							viewBox='0 0 52 52'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<circle
								cx='26'
								cy='26'
								r='25'
								stroke='currentColor'
								strokeWidth='2'
								className='stroke-current'
							/>
							<path
								d='M14 27L22 35L38 19'
								stroke='currentColor'
								strokeWidth='4'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='animate-draw-path'
							/>
						</svg>
						<p className='text-green-700 text-lg font-semibold'>
							Logout Successfully!
						</p>
					</div>

					{/* Tailwind custom animation via <style> tag (works well for small scoped styles) */}
					<style>
						{`
              @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }

              .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
              }

              @keyframes draw-path {
                from { stroke-dasharray: 48; stroke-dashoffset: 48; }
                to { stroke-dashoffset: 0; }
              }

              .animate-draw-path {
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                animation: draw-path 0.5s ease-out forwards;
              }

              @keyframes draw-check {
                from { stroke-dasharray: 166; stroke-dashoffset: 166; }
                to { stroke-dashoffset: 0; }
              }

              .animate-draw-check circle {
                stroke-dasharray: 166;
                stroke-dashoffset: 166;
                animation: draw-check 0.6s ease-out forwards;
              }
            `}
					</style>
				</div>
			)}
		</>
	);
};
