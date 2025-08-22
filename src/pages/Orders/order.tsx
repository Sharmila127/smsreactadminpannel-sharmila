/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrdersHistory } from './Services';
import { FONTS } from '../../constants/uiConstants';
import { useNavigate } from 'react-router-dom';
import { statusOrderHistory } from './Services/index';
import { toast } from 'react-toastify';

const Order = () => {
	// State management
	const [orders, setOrders] = useState<any[]>([]);
	const navigate = useNavigate();
	const [showViewModal, setShowViewModal] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedOrder, setSelectedOrder] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [dateFilter, setDateFilter] = useState('');
	const [trackingId, setTrackingId] = useState('');
	const [file, setFile] = useState<File | null>(null);
	const [filePreview, setFilePreview] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				// setIsLoading(true);
				const response: any = await getOrdersHistory('');

				// Handle different response structures
				if (response?.data?.data) {
					setOrders(response.data.data);
				} else if (response?.data) {
					setOrders(response.data);
				} else if (Array.isArray(response)) {
					setOrders(response);
				} else {
					setOrders([]);
				}
			} catch (error) {
				console.log('Error fetching orders:', error);
				setOrders([]);
				toast.error('Failed to load orders');
			} finally {
				setIsLoading(false);
			}
		};
		fetchOrders();
	}, []);

	const getstatus = async (data: any, id: string) => {
		try {
			setIsLoading(true);
			const formData = new FormData();
			formData.append('status', data.status);
			formData.append('track_id', trackingId);
			if (filePreview) {
				formData.append('trackslip_image', filePreview);
			}

			const response = await statusOrderHistory(id, formData);

			if (response) {
				const updatedResponse: any = await getOrdersHistory('');
				setOrders(
					updatedResponse.data?.data || updatedResponse.data || updatedResponse
				);

				setShowViewModal(false);
				toast.success('Order updated successfully');
			}
		} catch (error) {
			console.error('Error updating order:', error);
			toast.error('Failed to update order');
		} finally {
			setIsLoading(false);
		}
	};

	const ordersPerPage = 10;
	const filteredOrders = orders.filter((order) => {
		const matchesSearch =
			(order?.orderId?.toLowerCase() || '').includes(
				searchTerm.toLowerCase()
			) ||
			(order?.customer_name?.toLowerCase() || '').includes(
				searchTerm.toLowerCase()
			);

		const matchesDate = dateFilter
			? new Date(order.date).toISOString().split('T')[0] === dateFilter
			: true;

		return matchesSearch && matchesDate;
	});

	const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
	const currentOrders = filteredOrders.slice(
		(currentPage - 1) * ordersPerPage,
		currentPage * ordersPerPage
	);

	const handleViewOrder = (order: any) => {
		setSelectedOrder(order);
		setTrackingId(order.track_id);
		setFilePreview(order.trackslip_image);
		setFile(null);
		setShowViewModal(true);
	};

	const closeModal = () => {
		setShowViewModal(false);
		setFile(null);
		setFilePreview(null);
	};

	const clearDateFilter = () => {
		setDateFilter('');
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0];
			setFile(selectedFile);
			setFilePreview(selectedFile.name);
		}
	};

	const handleSave = async () => {
		if (!selectedOrder) return;

		if (
			selectedOrder.status === 'Dispatched to Courier' &&
			(!trackingId || !filePreview)
		) {
			toast.error('Please enter the tracking ID & upload the receipt image');
			return;
		}

		await getstatus(selectedOrder, selectedOrder._id);
	};

	// Animation variants
	const fadeIn = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { duration: 0.3 } },
	};

	const slideUp = {
		hidden: { y: 50, opacity: 0 },
		visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
	};

	const handleChange = () => {
		navigate('/order/orders-history');
	};

	const handleShowOrders = (items: any) => {
		if (!items || !Array.isArray(items)) return '';
		const showItem = items.map((item: any) => item.name);
		return items.length > 1 ? `${showItem[0]}...` : showItem;
	};

	const formatDate = (timestamp: string) => {
		try {
			const date = new Date(timestamp);
			return date.toLocaleDateString('en-IN');
		} catch {
			return timestamp;
		}
	};

	return (
		<div className='p-4 md:p-6 h-full min-h-screen'>
			<div className='flex justify-between'>
				<h1
					className='!font-bold text-[#9b111e] mb-3'
					style={{ ...FONTS.header }}
				>
					Car Spare Parts Orders
				</h1>
				<button
					onClick={handleChange}
					style={{
						backgroundColor: '#9b111e',
						color: 'white',
						padding: '8px 12px',
						borderRadius: '26px',
						marginBottom: '18px',
					}}
				>
					Completed orders
				</button>
			</div>

			{/* Summary Cards */}
			<motion.div
				initial='hidden'
				animate='visible'
				variants={fadeIn}
				className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'
			>
				<div className='bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500'>
					<h3
						className='!text-gray-500 text-sm font-medium'
						style={{ ...FONTS.cardSubHeader }}
					>
						Total Orders
					</h3>
					<p className='text-2xl font-bold text-gray-800'>{orders.length}</p>
				</div>
				<div className='bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500'>
					<h3
						className='!text-gray-500 text-sm font-medium'
						style={{ ...FONTS.cardSubHeader }}
					>
						Completed Orders
					</h3>
					<p className='text-2xl font-bold text-gray-800'>
						{orders.filter((o) => o.status === 'Completed').length}
					</p>
				</div>
				<div className='bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500'>
					<h3
						className='!text-gray-500 text-sm font-medium'
						style={{ ...FONTS.cardSubHeader }}
					>
						Processing Orders
					</h3>
					<p className='text-2xl font-bold text-gray-800'>
						{orders.filter((o) => o.status === 'Processing').length}
					</p>
				</div>
			</motion.div>

			{/* Header and Filters */}
			<motion.div
				variants={slideUp}
				className='flex justify-end md:items-center mb-6 gap-4'
			>
				<div className='flex flex-col md:flex-row gap-3 w-full items-end md:w-auto'>
					<div className='relative'>
						<input
							type='text'
							style={{ ...FONTS.cardSubHeader }}
							placeholder='Search by ID or Name...'
							className='pl-10 pr-4 py-2 border border-[#717171] placeholder:text-[#717171] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9b111e] w-full'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<svg
							className='absolute left-3 top-2.5 h-5 w-5 text-gray-400'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
							/>
						</svg>
					</div>

					<div className='relative'>
						<input
							type='date'
							style={{ ...FONTS.paragraph }}
							className='px-4 py-2 border border-[#717171] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9b111e] !text-black pr-10'
							value={dateFilter}
							onChange={(e) => setDateFilter(e.target.value)}
						/>
						{dateFilter && (
							<button
								onClick={clearDateFilter}
								className='absolute right-2 top-2 text-gray-400 hover:text-gray-600'
								title='Clear date filter'
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
										strokeWidth='2'
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						)}
					</div>
				</div>
			</motion.div>

			{/* Orders Table */}
			<motion.div
				variants={slideUp}
				className='bg-white rounded-xl shadow-md overflow-hidden'
			>
				<div className='overflow-x-auto'>
					<table className='min-w-full divide-y divide-gray-200'>
						<thead className='bg-[#e9e9e9]'>
							<tr>
								<th
									className='px-2 py-3 text-center text-xs font-bold text-[#717171] tracking-wider'
									style={{ ...FONTS.tableHeader }}
								>
									S.No
								</th>
								<th
									className='px-6 py-3 text-left text-xs font-bold text-[#717171] tracking-wider'
									style={{ ...FONTS.tableHeader }}
								>
									Order id
								</th>
								<th
									className='px-6 py-3 text-left text-xs font-bold text-[#717171] tracking-wider'
									style={{ ...FONTS.tableHeader }}
								>
									Customer
								</th>
								<th
									className='px-6 py-3 text-left text-xs font-bold text-[#717171] tracking-wider'
									style={{ ...FONTS.tableHeader }}
								>
									Orders
								</th>
								<th
									className='px-6 py-3 text-left text-xs font-bold text-[#717171] tracking-wider'
									style={{ ...FONTS.tableHeader }}
								>
									Date
								</th>
								<th
									className='px-6 py-3 text-left text-xs font-bold text-[#717171] tracking-wider'
									style={{ ...FONTS.tableHeader }}
								>
									Location
								</th>
								<th
									className='px-6 py-3 text-left text-xs font-bold text-[#717171] tracking-wider'
									style={{ ...FONTS.tableHeader }}
								>
									Status
								</th>
								<th
									className='px-6 py-3 text-left text-xs font-bold text-[#717171] tracking-wider'
									style={{ ...FONTS.tableHeader }}
								>
									Total
								</th>
								<th
									className='px-6 py-3 text-left text-xs font-bold text-[#717171] tracking-wider'
									style={{ ...FONTS.tableHeader }}
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className='bg-white divide-y divide-gray-200'>
							{isLoading ? (
								<tr>
									<td colSpan={9} className='px-6 py-4 text-center'>
										<div className='flex justify-center'>
											<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b111e]'></div>
										</div>
									</td>
								</tr>
							) : currentOrders?.length > 0 ? (
								currentOrders.map((order, index) => (
									<motion.tr
										key={index}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: index * 0.05 }}
										className='hover:bg-gray-50 transition-colors'
									>
										<td
											className='px-6 py-4 text-center whitespace-nowrap text-sm font-medium !text-gray-900'
											style={{ ...FONTS.paragraph }}
										>
											{(currentPage - 1) * ordersPerPage + index + 1}
										</td>
										<td
											className='px-6 py-4 whitespace-nowrap text-sm font-medium !text-gray-900'
											style={{ ...FONTS.paragraph }}
										>
											{order.orderId}
										</td>
										<td
											className='px-6 py-4 whitespace-nowrap text-sm !text-gray-500'
											style={{ ...FONTS.paragraph }}
										>
											<div className='flex items-center'>
												<div className='flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center'>
													{order.customer_name?.charAt(0) || '?'}
												</div>
												<div className='ml-4'>
													<div className='text-sm font-medium text-gray-900'>
														{order.customer_name}
													</div>
													<div className='text-sm text-gray-500'>
														{order.email}
													</div>
												</div>
											</div>
										</td>
										<td
											className='px-6 py-4 whitespace-nowrap text-sm !text-gray-500'
											style={{ ...FONTS.paragraph }}
										>
											{handleShowOrders(order?.details?.items)}
										</td>
										<td
											className='px-6 py-4 whitespace-nowrap text-sm !text-gray-500'
											style={{ ...FONTS.paragraph }}
										>
											{formatDate(order.date)}
										</td>
										<td
											className='px-6 py-4 whitespace-nowrap text-sm !text-gray-500'
											style={{ ...FONTS.paragraph }}
										>
											{order?.customerId?.contact_info?.city}
										</td>
										<td
											className='px-6 py-4 whitespace-nowrap'
											style={{ ...FONTS.paragraph }}
										>
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-3xl 
                        ${
													order.status === 'Dispatched to Courier'
														? 'bg-green-100 text-green-800'
														: order.status === 'Confirm Order'
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{order.status === 'Dispatched to Courier'
													? order.status.substring(0, 10)
													: order.status}
											</span>
										</td>
										<td
											className='px-6 py-4 whitespace-nowrap text-sm font-semibold !text-gray-900'
											style={{ ...FONTS.paragraph }}
										>
											{order.total}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
											<button
												onClick={() => handleViewOrder(order)}
												className='!text-[#9b111e] hover:text-[#7a0d19] mr-3 rounded-3xl transition-colors'
												style={{ ...FONTS.paragraph }}
											>
												View
											</button>
										</td>
									</motion.tr>
								))
							) : (
								<tr>
									<td
										colSpan={9}
										className='px-6 py-4 text-center text-sm !text-gray-500'
										style={{ ...FONTS.paragraph }}
									>
										No orders found matching your criteria
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</motion.div>

			{/* Pagination */}
			{filteredOrders.length > 0 && (
				<motion.div
					variants={fadeIn}
					className='flex flex-col md:flex-row justify-between items-center mt-4 gap-4'
				>
					<div
						className='text-sm !text-gray-500'
						style={{ ...FONTS.paragraph }}
					>
						Showing {(currentPage - 1) * ordersPerPage + 1} to{' '}
						{Math.min(currentPage * ordersPerPage, filteredOrders.length)} of{' '}
						{filteredOrders.length} orders
					</div>
					<div className='flex space-x-2' style={{ ...FONTS.paragraph }}>
						<button
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
							className={`px-4 py-2 rounded-3xl ${
								currentPage === 1
									? 'bg-gray-200 text-gray-500 cursor-not-allowed'
									: 'bg-[#9b111e] text-white hover:bg-[#7a0d19]'
							} transition-colors`}
						>
							Previous
						</button>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<button
								key={page}
								onClick={() => setCurrentPage(page)}
								className={`w-10 h-10 rounded-3xl ${
									currentPage === page
										? 'bg-[#9b111e] text-white'
										: 'bg-white text-gray-700 hover:bg-gray-100'
								} transition-colors`}
							>
								{page}
							</button>
						))}

						<button
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}
							className={`px-4 py-2 rounded-3xl ${
								currentPage === totalPages
									? 'bg-gray-200 text-gray-500 cursor-not-allowed'
									: 'bg-[#9b111e] text-white hover:bg-[#7a0d19]'
							} transition-colors`}
						>
							Next
						</button>
					</div>
				</motion.div>
			)}

			{/* View Order Modal */}
			<AnimatePresence>
				{showViewModal && selectedOrder && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className='bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'
						>
							<div className='flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10'>
								<h3
									className='text-xl font-semibold !text-gray-900'
									style={{ ...FONTS.subHeader }}
								>
									Order Details - {selectedOrder.orderId}
								</h3>
								<button
									onClick={closeModal}
									className='text-gray-400 hover:text-gray-500 transition-colors rounded-3xl'
								>
									<svg
										className='w-6 h-6'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M6 18L18 6M6 6l12 12'
										></path>
									</svg>
								</button>
							</div>

							<div className='p-6' style={{ ...FONTS.paragraph }}>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
									<div>
										<h4
											className='text-lg font-medium !text-gray-900 mb-3'
											style={{ ...FONTS.cardheader }}
										>
											Customer Information
										</h4>
										<div className='space-y-2'>
											<p className='!text-gray-600'>
												<span
													className='font-medium !text-gray-600'
													style={{ ...FONTS.paragraph }}
												>
													Name:
												</span>{' '}
												{selectedOrder.customer_name}
											</p>
											<p className='!text-gray-600'>
												<span
													className='font-medium !text-gray-600'
													style={{ ...FONTS.paragraph }}
												>
													Email:
												</span>{' '}
												{selectedOrder?.customerId?.email}
											</p>
											<p className='!text-gray-600'>
												<span
													className='font-medium !text-gray-600'
													style={{ ...FONTS.paragraph }}
												>
													Phone Number:
												</span>{' '}
												{selectedOrder?.customerId?.contact_info?.phoneNumber}
											</p>

											<div className='!text-gray-600'>
												<label
													className='font-medium !text-gray-600 mr-2'
													style={{ ...FONTS.paragraph }}
												>
													Status:
												</label>
												<select
													value={selectedOrder.status}
													onChange={(e) => {
														const newStatus = e.target.value;
														setSelectedOrder({
															...selectedOrder,
															status: newStatus,
														});
													}}
													className={`ml-2 px-4 py-2 rounded-2xl text-sm font-medium
                          shadow-sm border transition-all duration-300 ease-in-out
                          focus:ring-1 focus:ring-offset-1 focus:ring-[#9b111e] focus:outline-none
                          ${
														selectedOrder.status === 'Dispatched to Courier'
															? 'bg-green-100 text-green-800 border-green-200'
															: selectedOrder.status === 'Confirm Order'
															? 'bg-blue-100 text-blue-800 border-blue-200'
															: selectedOrder.status === 'Pending'
															? 'bg-orange-100 text-red-800 border-orange-200'
															: 'bg-yellow-100 text-yellow-800 border-yellow-200'
													}`}
													style={{ ...FONTS.paragraph }}
												>
													<option value='Pending'>Pending</option>
													<option value='Confirm Order'>Confirm Order</option>
													<option value='Dispatched to Courier'>
														Dispatched to Courier
													</option>
												</select>
											</div>
										</div>
									</div>
									<div>
										<h4
											className='text-lg font-medium !text-gray-900 mb-3'
											style={{ ...FONTS.cardheader }}
										>
											Order Information
										</h4>
										<div className='space-y-2'>
											<p className='text-gray-600'>
												<span
													className='font-medium !text-gray-600'
													style={{ ...FONTS.paragraph }}
												>
													Date:
												</span>{' '}
												{formatDate(selectedOrder.date)}
											</p>
											<p className='text-gray-600'>
												<span
													className='font-medium !text-gray-600'
													style={{ ...FONTS.paragraph }}
												>
													Total:
												</span>{' '}
												{selectedOrder.total}
											</p>

											{/* Tracking fields - shown for both Confirm Order and Dispatched statuses */}
											{selectedOrder.status === 'Dispatched to Courier' && (
												<div className='mt-4 space-y-3'>
													<div>
														<label className='block text-sm font-medium !text-gray-700 mb-1'>
															Tracking ID
														</label>
														<input
															type='text'
															value={trackingId}
															onChange={(e) => setTrackingId(e.target.value)}
															className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9b111e]'
															placeholder='Enter tracking ID'
														/>
													</div>

													<div>
														<label className='block text-sm font-medium !text-gray-700 mb-1'>
															Tracking Receipt
														</label>
														<div className='flex items-center gap-2'>
															<label className='cursor-pointer bg-[#9b111e] text-white px-3 py-1.5 rounded-md hover:bg-[#7a0d19] transition-colors'>
																{filePreview ? 'Change File' : 'Upload File'}
																<input
																	type='file'
																	onChange={handleFileChange}
																	accept='.pdf,.jpg,.jpeg,.png'
																	className='hidden'
																/>
															</label>
															{file && (
																<span className='text-sm !text-gray-600'>
																	{file.name}
																</span>
															)}
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>

								<h4
									className='text-lg font-medium !text-gray-900 mb-3'
									style={{ ...FONTS.cardheader }}
								>
									Order Items
								</h4>
								<div className='overflow-x-auto mb-6'>
									<table className='min-w-full divide-y divide-gray-200'>
										<thead className='bg-gray-50'>
											<tr>
												<th
													className='px-6 py-3 text-left text-xs font-medium !text-gray-500 uppercase tracking-wider'
													style={{ ...FONTS.paragraph }}
												>
													Item
												</th>
												<th
													className='px-6 py-3 text-left text-xs font-medium !text-gray-500 uppercase tracking-wider'
													style={{ ...FONTS.paragraph }}
												>
													Quantity
												</th>
												<th
													className='px-6 py-3 text-left text-xs font-medium !text-gray-500 uppercase tracking-wider'
													style={{ ...FONTS.paragraph }}
												>
													Price
												</th>
												<th
													className='px-6 py-3 text-left text-xs font-medium !text-gray-500 uppercase tracking-wider'
													style={{ ...FONTS.paragraph }}
												>
													Subtotal
												</th>
											</tr>
										</thead>
										<tbody className='bg-white divide-y divide-gray-200'>
											{selectedOrder.details.items.map(
												(item: any, index: number) => {
													const price = parseInt(item.price);
													return (
														<tr key={index}>
															<td
																className='px-6 py-4 whitespace-nowrap text-sm font-medium !text-gray-900'
																style={{ ...FONTS.paragraph }}
															>
																{item.name}
															</td>

															<td
																className='px-6 py-4 whitespace-nowrap text-sm !text-gray-500'
																style={{ ...FONTS.paragraph }}
															>
																{item.quantity}
															</td>
															<td
																className='px-6 py-4 whitespace-nowrap text-sm !text-gray-500'
																style={{ ...FONTS.paragraph }}
															>
																{item.price}
															</td>
															<td
																className='px-6 py-4 whitespace-nowrap text-sm !text-gray-500'
																style={{ ...FONTS.paragraph }}
															>
																&#8377;
																{(price * item.quantity).toLocaleString()}
															</td>
														</tr>
													);
												}
											)}
										</tbody>
									</table>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div>
										<h4
											className='text-lg font-medium !text-gray-900 mb-3'
											style={{ ...FONTS.cardheader }}
										>
											Shipping Address
										</h4>
										<p
											className='!text-gray-600'
											style={{ ...FONTS.cardSubHeader }}
										>
											{selectedOrder.details.address}
										</p>
									</div>
									<div>
										<h4
											className='text-lg font-medium !text-gray-900 mb-3'
											style={{ ...FONTS.cardheader }}
										>
											Order Summary
										</h4>
										<div className='bg-gray-50 p-4 rounded-lg'>
											<div className='flex justify-between mb-2'>
												<span
													className='!text-gray-600'
													style={{ ...FONTS.cardSubHeader }}
												>
													Subtotal:
												</span>
												<span
													className='font-medium !text-gray-600'
													style={{ ...FONTS.cardSubHeader }}
												>
													{selectedOrder.total}
												</span>
											</div>
											<div className='flex justify-between border-t pt-2 mt-2'>
												<span
													className='!text-gray-900 font-medium'
													style={{ ...FONTS.cardSubHeader }}
												>
													Total:
												</span>
												<span
													className='!text-[#9b111e] font-bold'
													style={{ ...FONTS.cardSubHeader }}
												>
													{selectedOrder.total}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className='flex justify-end p-4 border-t sticky bottom-0 bg-white gap-3'>
								<button
									onClick={handleSave}
									disabled={isLoading}
									className={`px-4 py-2 bg-[#9b111e] !text-white rounded-3xl hover:bg-[#7a0d19] transition-colors ${
										isLoading ? 'opacity-70 cursor-not-allowed' : ''
									}`}
									style={{ ...FONTS.paragraph }}
								>
									{isLoading ? (
										<div className='flex items-center justify-center gap-2'>
											<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
											Saving...
										</div>
									) : (
										'Save'
									)}
								</button>
								<button
									onClick={closeModal}
									disabled={isLoading}
									className='px-4 py-2 bg-gray-200 !text-gray-700 rounded-3xl hover:bg-gray-300 transition-colors'
									style={{ ...FONTS.paragraph }}
								>
									Close
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Order;
