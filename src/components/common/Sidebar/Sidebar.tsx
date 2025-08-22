/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import mainLogo from '../../../assets/Admin logo.png';
import MiniLogo from '../../../assets/Admin Logo (1).png';
import { RiMenu2Line, RiMenu3Line } from 'react-icons/ri';
import { FONTS } from '../../../constants/uiConstants';
import Dashboardwhite from '../../../assets/Dashboard1.svg';
import Dashboardgrey from '../../../assets/Dashboard2.svg';
import schedulewhite from '../../../assets/Schedule Queue2.svg';
import schedulegrey from '../../../assets/Schedule Queue1.svg';
import requestwhite from '../../../assets/Request Queue1.svg';
import requestgrey from '../../../assets/Request Queue2.svg';
import orderwhite from '../../../assets/Orders2.svg';
import ordergrey from '../../../assets/Orders1.svg';
import partnerwhite from '../../../assets/Partner2.svg';
import partnergrey from '../../../assets/Partner1.svg';
import jobcardwhite from '../../../assets/Job Cards2.svg';
import jobcardgray from '../../../assets/Job Cards1.svg';
import citywhite from '../../../assets/City2.svg';
import citygray from '../../../assets/City1.svg';
import vehiclewhite from '../../../assets/Vehicle2.svg';
import vehiclegray from '../../../assets/Vehicle1.svg';
import soswhite from '../../../assets/SOS2.svg';
import sosgray from '../../../assets/SOS1.svg';
import querieswhite from '../../../assets/Queries2.svg';
import queriesgray from '../../../assets/Queries1.svg';
import customerwhite from '../../../assets/Customers2.svg';
import customergray from '../../../assets/Customers1.svg';
import settingswhite from '../../../assets/Settings2.svg';
import settingsgray from '../../../assets/Settings1.svg';
import announcementwhite from '../../../assets/Announcement2.svg';
import announcementgray from '../../../assets/Announcement1.svg';
import notificationwhite from '../../../assets/Notifications2.svg';
import notificationgray from '../../../assets/Notifications1.svg';

const COLOR = {
	primary: '#9b111e',
	bgColor: '#faf3eb',
	secondary: '#E6A895',
};

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(true);
	const [showMainLogo, setShowMainLogo] = useState(isOpen);

	useEffect(() => {
		let timer: any;

		if (isOpen) {
			setShowMainLogo(true);
		} else {
			timer = setTimeout(() => {
				setShowMainLogo(false);
			}, 500);
		}

		return () => clearTimeout(timer);
	}, [isOpen]);

	const handleLinkClick = () => {
		setIsOpen(false);
	};

	return (
		<div className='flex h-screen '>
			<div
				className='bg-white border-r shadow-md p-2 transition-all duration-500 ease-in-out fixed top-0 left-0 h-screen z-40 flex flex-col items-center '
				style={{ width: isOpen ? '240px' : '64px' }}
			>
				<div
					className={`flex justify-center items-center h-20 transition-all duration-500 ease-in-out overflow-hidden`}
					style={{ width: isOpen ? '160px' : '48px' }}
				>
					<img
						src={showMainLogo ? mainLogo : MiniLogo}
						alt='YES Mechanic Logo'
						className={`object-contain transition-all duration-500 ease-in-out`}
						style={{
							width: showMainLogo ? '150px' : '36px',
							height: '38px',
							transition: 'width 0.5s ease, opacity 0.5s ease',
						}}
					/>
				</div>

				<div className='w-full flex justify-end px-2 mt-2'>
					<button
						onClick={() => setIsOpen(!isOpen)}
						className='text-gray-600 hover:text-black p-2 rounded-3xl transition-all duration-200 hover:bg-gray-100'
						title='Toggle Sidebar'
					>
						{isOpen ? (
							<RiMenu3Line size={20} style={{ color: COLOR.primary }} />
						) : (
							<RiMenu2Line size={20} style={{ color: COLOR.primary }} />
						)}
					</button>
				</div>

				<nav className='flex flex-col gap-4 mt-4 w-full items-center overflow-y-auto overflow-x-hidden flex-1 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 overflow-auto scrollbar-hide'>
					<SidebarLink
						to='/'
						icon={[
							<img
								src={Dashboardwhite}
								alt='Dashboard Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={Dashboardgrey}
								alt='Dashboard Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Dashboard'
						tooltip='Dashboard'
						isOpen={isOpen}
						onClick={handleLinkClick}
					/>
					<SidebarLink
						to='/bookings'
						icon={[
							<img
								src={requestwhite}
								alt='Request Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={requestgrey}
								alt='Request Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Service Request'
						isOpen={isOpen}
						onClick={handleLinkClick}
						tooltip='Service Request'
					/>
					<SidebarLink
						to='/request-queue'
						icon={[
							<img
								src={schedulewhite}
								alt='Schedule Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={schedulegrey}
								alt='Schedule Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Schedule Request'
						isOpen={isOpen}
						onClick={handleLinkClick}
						tooltip='Schedule Request'
					/>
					<SidebarLink
						to='/order'
						icon={[
							<img
								src={orderwhite}
								alt='Order Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={ordergrey}
								alt='Order Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Orders'
						isOpen={isOpen}
						tooltip='Orders'
						onClick={handleLinkClick}
					/>
					<SidebarLink
						to='/service'
						icon={[
							<img
								src={partnerwhite}
								alt='Partner Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={partnergrey}
								alt='Partner Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Partner'
						isOpen={isOpen}
						tooltip='Partner'
						onClick={handleLinkClick}
					/>
					<SidebarLink
						to='/job-cards'
						icon={[
							<img
								src={jobcardwhite}
								alt='Job Cards Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={jobcardgray}
								alt='Job Cards Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Job Cards'
						isOpen={isOpen}
						tooltip='Job Cards'
						onClick={handleLinkClick}
					/>
					<SidebarLink
						to='/city'
						icon={[
							<img
								src={citywhite}
								alt='City Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={citygray}
								alt='City Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='City'
						isOpen={isOpen}
						tooltip='City'
						onClick={handleLinkClick}
					/>
					<SidebarLink
						to='/vehicle'
						icon={[
							<img
								src={vehiclewhite}
								alt='Vehicle Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={vehiclegray}
								alt='Vehicle Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Vehicle'
						isOpen={isOpen}
						tooltip='Vehicle'
						onClick={handleLinkClick}
					/>
					<SidebarLink
						to='/sos'
						icon={[
							<img
								src={soswhite}
								alt='SOS Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={sosgray}
								alt='SOS Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='SOS'
						isOpen={isOpen}
						tooltip='SOS'
						onClick={handleLinkClick}
					/>
					<SidebarLink
						to='/queries'
						icon={[
							<img
								src={querieswhite}
								alt='Queries Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={queriesgray}
								alt='Queries Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Queries'
						isOpen={isOpen}
						tooltip='Queries'
						onClick={handleLinkClick}
					/>
					<SidebarLink
						to='/customer'
						icon={[
							<img
								src={customerwhite}
								alt='Customers Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={customergray}
								alt='Customers Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Customers'
						isOpen={isOpen}
						tooltip='Customers'
						onClick={handleLinkClick}
					/>
					<SidebarLink
						to='/settings'
						icon={[
							<img
								src={settingswhite}
								alt='Settings Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={settingsgray}
								alt='Settings Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Settings'
						isOpen={isOpen}
						tooltip='Settings'
						onClick={handleLinkClick}
					/>
					<SidebarLink
						to='/announcement'
						icon={[
							<img
								src={announcementwhite}
								alt='Announcement Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={announcementgray}
								alt='Announcement Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Announcement'
						isOpen={isOpen}
						tooltip='Announcement'
						onClick={handleLinkClick}
					/>
					<SidebarLink
						to='/notifications'
						icon={[
							<img
								src={notificationwhite}
								alt='Notifications Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
							<img
								src={notificationgray}
								alt='Notifications Icon'
								className='w-5 h-5 text-[#9b111e]'
							/>,
						]}
						label='Notifications'
						isOpen={isOpen}
						tooltip='Notifications'
						onClick={handleLinkClick}
					/>
				</nav>
			</div>

			<div
				className={`transition-all duration-500 ease-in-out ${
					isOpen ? 'ml-60' : 'ml-16'
				} flex-1`}
			>
				{/* Your main content goes here */}
			</div>
		</div>
	);
};

const SidebarLink = ({
	to,
	icon,
	label,
	isOpen,
	onClick,
	tooltip,
}: {
	to: string;
	icon: any;
	label: string;
	isOpen: boolean;
	tooltip: string;
	onClick: () => void;
}) => {
	const location = useLocation();
	const [isHovered, setIsHovered] = useState(false);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const isActive = location.pathname === to;

	const backgroundColor = isActive
		? COLOR.primary
		: isHovered
		? COLOR.bgColor
		: 'transparent';

	const textColor = isActive ? COLOR.bgColor : 'gray';

	const handleMouseMove = (e: React.MouseEvent) => {
		setMousePosition({ x: e.clientX, y: e.clientY });
	};

	return (
		<div className='relative w-full flex justify-center'>
			<Link
				to={to}
				onClick={onClick}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onMouseMove={handleMouseMove}
				style={{ backgroundColor }}
				className={`flex items-center transition-all duration-500 ease-in-out py-1 
          ${
						isOpen
							? 'justify-start gap-5 w-[200px] py-2.5 px-4'
							: 'justify-center w-10 h-10 py-2'
					} 
          rounded-full
        `}
			>
				{/* Icon Container */}
				<div className='text-xl' style={{ color: textColor }}>
					{isActive ? icon[0] : icon[1]}
				</div>
				{isOpen && (
					<span
						style={{
							...FONTS.cardSubHeader,
							color: textColor,
							fontWeight: 500,
						}}
						className='transition-all duration-500 ease-in-out'
					>
						{label}
					</span>
				)}
			</Link>

			{/* Tooltip on cursor position */}
			{!isOpen && isHovered && (
				<div
					className='fixed bg-gray-200 text-black text-xs rounded px-2 py-1 z-50 whitespace-nowrap shadow-md pointer-events-none transition-all duration-200 ease-in-out'
					style={{
						top: mousePosition.y + 30,
						left: mousePosition.x - 20,
					}}
				>
					{tooltip}
				</div>
			)}
		</div>
	);
};
