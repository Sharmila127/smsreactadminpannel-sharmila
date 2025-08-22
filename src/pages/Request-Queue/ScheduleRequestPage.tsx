import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FONTS } from '../../constants/uiConstants';
import { GetUnassignedScheduleReq, UpdateScheduleReq } from './Service';
import { ScheduleRequest } from './scheduleType';
import { FetchPartnerList } from '../../utils/CommonApiFetch';
import { toast } from 'react-toastify';
import { IoCall } from 'react-icons/io5';
import { MdOutlineMiscellaneousServices } from 'react-icons/md';
import { PiCarProfileFill } from 'react-icons/pi';
import { FaLocationDot } from 'react-icons/fa6';
import { FaCarAlt, FaUserAlt } from 'react-icons/fa';

interface Partner {
	id: ReactNode;
	_id: string;
	firstName: string;
	lastName: string;
	companyName: string;
	contact_info: {
		city: string;
		address1: string;
		address2: string;
		phoneNumber: string;
		state: string;
		id: string;
	};
	vehicle: {
		model: string;
		company: string;
	};
}

export default function ScheduleRequestPage() {
	const navigate = useNavigate();
	const [requests, setRequests] = useState<ScheduleRequest[]>([]);
	const [partners, setPartners] = useState<Partner[]>([]);
	const [selectedRequest, setSelectedRequest] =
		useState<ScheduleRequest | null>(null);
	const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState<string>('');
	// const [isLoading, setIsLoading] = useState(false);

	async function fetchUnassignedRequests() {
		try {
			// setIsLoading(true);
			const data = await GetUnassignedScheduleReq();
			setRequests(data.data);
		} catch (error) {
			toast.error('Failed to fetch schedule requests');
		} finally {
			// setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchUnassignedRequests();
	}, []);

	const openModal = async (request: ScheduleRequest) => {
		try {
			// setIsLoading(true);
			setSelectedRequest(request);
			const data = await FetchPartnerList();
			setPartners(data);
			setOpen(true);
		} catch (error) {
			toast.error('Failed to fetch partners');
		} finally {
			// setIsLoading(false);
		}
	};

	const closeModal = () => {
		setOpen(false);
		setSelectedPartnerId('');
		setSelectedRequest(null);
	};

	const assignPartner = async () => {
		if (!selectedRequest || !selectedPartnerId) return;

		try {
			// setIsLoading(true);
			const selectedPartner = partners.find((p) => p._id === selectedPartnerId);

			const updatedRequest = {
				...selectedRequest,
				status: 'Scheduled',
				assignedPartner: selectedPartnerId,
				partnerName:
					`${selectedPartner?.firstName} ${selectedPartner?.lastName}` ||
					'Unknown Partner',
			};

			await UpdateScheduleReq(
				{ partnerId: selectedPartnerId },
				selectedRequest._id
			);

			setRequests((prev) =>
				prev.filter((req) => req._id !== selectedRequest._id)
			);

			const existingScheduled = JSON.parse(
				localStorage.getItem('scheduledRequests') || '[]'
			);
			const updatedScheduled = [...existingScheduled, updatedRequest];
			localStorage.setItem(
				'scheduledRequests',
				JSON.stringify(updatedScheduled)
			);

			toast.success(
				`Successfully assigned ${selectedPartner?.firstName} to ${
					selectedRequest.customerId?.firstName || 'customer'
				}'s request!`
			);
			closeModal();
		} catch (error) {
			toast.error('Failed to assign partner');
		} finally {
			// setIsLoading(false);
		}
	};

	const selectedPartner = partners.find(
		(partner) => partner._id === selectedPartnerId
	);

	const filteredRequests = requests
		.filter((req) => req.customerId)
		.filter((req) => {
			if (!searchTerm) return true;
			const customerName = `${req.customerId?.firstName || ''} ${
				req.customerId?.lastName || ''
			}`.toLowerCase();
			return customerName.includes(searchTerm.toLowerCase());
		});

	return (
		<div className='bg-[#FAF3EB] min-h-screen p-8'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='!font-bold text-[#9b111e]' style={{ ...FONTS.header }}>
					Schedule Requests
				</h1>

				<div className='flex items-center gap-6'>
					<div className='relative group'>
						<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
							<svg
								className='h-5 w-5 text-gray-400 group-focus-within:text-[#9b111e] transition-colors'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
								/>
							</svg>
						</div>
						<input
							type='text'
							placeholder='Search by customer name...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='pl-12 pr-4 py-3 w-80 border-2 border-[#717171] placeholder:text-[#717171] rounded-xl focus-visible:ring-0 transition-all duration-300 bg-white shadow-sm hover:shadow-md'
							style={{ ...FONTS.paragraph }}
						/>
						{searchTerm && (
							<button
								onClick={() => setSearchTerm('')}
								className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 rounded-3xl'
							>
								<svg
									className='h-5 w-5'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						)}
					</div>

					<button
						onClick={() => navigate('/request-queue/scheduled')}
						className='inline-flex items-center border border-[#9b111e] gap-3 px-8 py-3 bg-white text-black rounded-3xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold'
						style={{ ...FONTS.paragraph }}
					>
						<svg
							className='w-5 h-5'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
							/>
						</svg>
						Scheduled
						<div className='bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs font-bold'>
							{
								JSON.parse(localStorage.getItem('scheduledRequests') || '[]')
									.length
							}
						</div>
					</button>
				</div>
			</div>

			<hr className='border-1 border-red-700 my-5' />

			{filteredRequests.length === 0 ? (
				<div className='flex justify-center items-center h-64'>
					{/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b111e]"></div> */}
					<p>No Requests Pending</p>
				</div>
			) : filteredRequests?.length === 0 ? (
				<div className='text-center py-12'>
					<div className='text-6xl mb-4'>🔍</div>
					<h3
						className='text-xl font-semibold text-gray-600 mb-2'
						style={{ ...FONTS.cardSubHeader }}
					>
						{searchTerm ? 'No matching requests found' : 'No pending requests'}
					</h3>
					<p className='text-gray-500' style={{ ...FONTS.paragraph }}>
						{searchTerm
							? 'Try adjusting your search terms'
							: 'All requests have been scheduled'}
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{filteredRequests?.map((req, index) => (
						<div
							key={index}
							className='bg-white rounded-3xl shadow-xl border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-2xl transition-all duration-300 cursor-pointer'
							onClick={() => openModal(req)}
						>
							<div className='flex items-center gap-6'>
								<div className='w-10 h-10 bg-[#9b111e] rounded-full flex items-center justify-center text-white font-bold text-base'>
									{req.customerId?.firstName?.charAt(0)}
									{req.customerId?.lastName?.charAt(0)}
								</div>

								<div className='flex-1 grid grid-cols-2 gap-y-2 gap-x-5 text-sm text-gray-700'>
									<div className='flex items-center gap-2'>
										<span>
											<FaUserAlt />
										</span>
										<span>
											{req.customerId?.firstName} {req.customerId?.lastName}
										</span>
									</div>

									<div className='flex items-center gap-2'>
										<span>
											<FaCarAlt />
										</span>
										<span className='truncate'>
											{req?.vehicle?.company || 'Not specified'}
										</span>
									</div>

									<div className='flex items-center gap-2'>
										<span>
											<IoCall />
										</span>
										<span>
											{req.customerId?.contact_info?.phoneNumber ||
												'Not specified'}
										</span>
									</div>

									<div className='flex items-center gap-2'>
										<span>
											<MdOutlineMiscellaneousServices />
										</span>
										<span>{req.requestType}</span>
									</div>

									<div className='flex items-center gap-2'>
										<span>
											<PiCarProfileFill />
										</span>
										<span>
											{req.service?.[0]?.service_name || 'Car Services'}
										</span>
									</div>

									<div className='flex items-center gap-2 break-words'>
										<span>
											<FaLocationDot />
										</span>
										<span className='break-words'>
											{req.customerId?.contact_info?.address1.substring(
												0,
												10
											) || 'Not specified'}
										</span>
									</div>
								</div>
							</div>

							<hr className='border-t border-gray-200 my-2' />

							<div className='flex items-center justify-between flex-wrap gap-2 text-sm text-gray-600 font-medium'>
								<div className='flex items-center gap-1'>
									<svg
										className='w-5 h-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
										/>
									</svg>
									<span>
										{new Date(req.schedule_date).toLocaleDateString()}
									</span>
								</div>

								{req.preferedTime?.startTime && req.preferedTime?.endTime && (
									<div className='text-gray-600 text-xs'>
										Time: {req.preferedTime.startTime} -{' '}
										{req.preferedTime.endTime}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{open && selectedRequest && (
				<div className='fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end'>
					<div className='w-full sm:w-1/2 h-full bg-[#FAF3EB] border-l-4 border-[#9b111e] shadow-2xl p-8 relative overflow-y-auto rounded-l-3xl transition-all duration-300'>
						<div className='flex justify-between items-center mb-6'>
							<h2
								className='text-3xl font-bold text-[#9b111e] tracking-wide'
								style={{ ...FONTS.header }}
							>
								Assign Partner
							</h2>
							<button
								onClick={closeModal}
								className='text-gray-500 hover:text-black text-3xl font-bold rounded-3xl'
							>
								&times;
							</button>
						</div>

						<div className='flex gap-4'>
							<div className='flex-shrink-0'>
								<div className='w-16 h-16 rounded-full bg-[#9b111e]/10 text-[#9b111e] text-3xl flex items-center justify-center font-bold shadow-md'>
									{selectedRequest.customerId?.firstName?.charAt(0)}
									{selectedRequest.customerId?.lastName?.charAt(0)}
								</div>
							</div>

							<div className='flex-1 space-y-4 text-gray-700'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-lg'>
									<p
										className='!text-gray-800 text-[14px]'
										style={{ ...FONTS.cardSubHeader }}
									>
										<span className='font-semibold'>Customer:</span>{' '}
										{selectedRequest.customerId?.firstName}{' '}
										{selectedRequest.customerId?.lastName}
									</p>
									<p
										className='!text-gray-800 text-[14px]'
										style={{ ...FONTS.cardSubHeader }}
									>
										<span className='font-semibold'>Mobile:</span>{' '}
										{selectedRequest.customerId?.contact_info?.phoneNumber ||
											'Not specified'}
									</p>
									<p
										className='!text-gray-800 text-[14px]'
										style={{ ...FONTS.cardSubHeader }}
									>
										<span className='font-semibold'>Car No:</span>{' '}
										{selectedRequest?.vehicle?.registerNumber ||
											'Not specified'}
									</p>
									<p
										className='!text-gray-800 text-[14px]'
										style={{ ...FONTS.cardSubHeader }}
									>
										<span className='font-semibold'>Vehicle:</span>{' '}
										{selectedRequest?.vehicle?.model || 'Not specified'}
									</p>
									<p
										className='!text-gray-800 text-[14px]'
										style={{ ...FONTS.cardSubHeader }}
									>
										<span className='font-semibold'>Service:</span>{' '}
										{selectedRequest?.service?.[0]?.service_name ||
											'General Service'}
									</p>
									<p
										className='!text-gray-800 text-[14px]'
										style={{ ...FONTS.cardSubHeader }}
									>
										<span className='font-semibold'>Location:</span>{' '}
										{selectedRequest?.customerId?.contact_info?.address1 ||
											'Not specified'}
									</p>
									<p
										className='!text-gray-800 text-[14px]'
										style={{ ...FONTS.cardSubHeader }}
									>
										<span className='font-semibold'>Scheduled Date:</span>{' '}
										{new Date(
											selectedRequest.schedule_date
										).toLocaleDateString()}
									</p>
									<p
										className='!text-gray-800 text-[14px]'
										style={{ ...FONTS.cardSubHeader }}
									>
										<span className='font-semibold'>Time Slot:</span>{' '}
										{selectedRequest.preferedTime?.startTime
											? `${selectedRequest.preferedTime.startTime} - ${selectedRequest.preferedTime.endTime}`
											: 'Not specified'}
									</p>
								</div>

								<div>
									<label
										className='block mb-2 font-semibold text-gray-700 text-sm'
										style={{ ...FONTS.cardSubHeader }}
									>
										Select Partner:
									</label>
									<select
										className='w-full border border-[#717171] p-3 rounded-lg !text-gray-800 focus:ring-[#9b111e] focus:border-[#9b111e] mb-4'
										value={selectedPartnerId}
										onChange={(e) => setSelectedPartnerId(e.target.value)}
										style={{ ...FONTS.paragraph }}
									>
										<option value=''>-- Choose a partner --</option>
										{partners.map((partner) => (
											<option key={partner._id} value={partner._id}>
												{partner.id} {partner.companyName}- (
												{partner.contact_info.city})
											</option>
										))}
									</select>

									{selectedPartner && (
										<div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
											<h3
												className='font-semibold text-[#9b111e] mb-2'
												style={{ ...FONTS.cardSubHeader }}
											>
												Selected Partner Details:
											</h3>
											<div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm'>
												<p>
													<span className='font-medium'>Name:</span>{' '}
													{selectedPartner.firstName} {selectedPartner.lastName}
												</p>
												<p>
													<span className='font-medium'>Phone:</span>{' '}
													{selectedPartner.contact_info.phoneNumber}
												</p>
												<p>
													<span className='font-medium'>City:</span>{' '}
													{selectedPartner.contact_info.city}
												</p>
												<p>
													<span className='font-medium'>State:</span>{' '}
													{selectedPartner.contact_info.state}
												</p>
												<p className='md:col-span-2'>
													<span className='font-medium'>Address:</span>{' '}
													{selectedPartner.contact_info.address1}
												</p>
											</div>
										</div>
									)}
								</div>

								<div className='flex justify-end gap-4 mt-6'>
									<button
										onClick={closeModal}
										className='px-5 py-2 bg-gray-200 !text-gray-800 rounded-3xl hover:!bg-gray-300'
										style={{ ...FONTS.paragraph }}
									>
										Cancel
									</button>
									<button
										onClick={assignPartner}
										className='px-5 py-2 !bg-[#9b111e] !text-white rounded-3xl hover:!bg-[#80101a]'
										style={{ ...FONTS.paragraph }}
									>
										Assign Partner
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
