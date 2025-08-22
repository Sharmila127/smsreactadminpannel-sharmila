'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Search, ArrowLeft, Plus, EllipsisVertical } from 'lucide-react';
import Client from '../../api';
import { FONTS } from '../../constants/uiConstants';
import {
	getSpareparts,
	updateSpare,
} from '../../features/ServiceCenter/Service';
import {
	createsparepartscategory,
	deletesparepartscategory,
	getAllsparepartscategory,
	updatesparepartscategory,
} from '../../features/ServiceCenter/service/index';
import { toast } from 'react-toastify';
import { FiMoreVertical } from 'react-icons/fi';
import { FaRegEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

interface ApiSparePart {
	units: any;
	_id: string;
	productName: string;
	price: string;
	slug: string;
	brand: string;
	image: string;
	stock: string;
	inStock: boolean;
	category: string;
	warrantyPeriod: string;
	reStockAuto: boolean;
	reStockDate: string | null;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	uuid: string;
	__v: number;
}

interface SparePart {
	stock: string | number;
	productName: string;
	_id: string;
	id: string;
	name: string;
	image: string;
	price: string;
	quantity: number;
	units: string;
	category: string;
	brand: string;
	rating: number;
	reviews: number;
	inStock: boolean;
	discount?: number;
	active?: boolean;
	warrantyPeriod: string;
	slug: string;
}

interface ApiResponse {
	success: boolean;
	data: ApiSparePart[];
}

interface Category {
	_id: string;
	uuid: string;
	name: string;
	gstRate: number | null;
	__v: number;
}

type ReactComponent = {
	handleBack: () => void;
	partnerId: string;
};

const ServiceSpareParts: React.FC<ReactComponent> = ({
	partnerId,
	handleBack,
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [showSearch, setShowSearch] = useState(false);
	const [Spareparts, setSpareparts] = useState<any[]>([]);
	const [showAddModal, setShowAddModal] = useState(false);
	const [spareParts, setSpareParts] = useState<SparePart[]>([]);
	const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
	const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [newPart, setNewPart] = useState<
		Omit<SparePart, 'id' | 'inStock' | 'reviews' | 'rating' | '_id'>
	>({
		stock: '',
		productName: '',
		name: '',
		image: '',
		price: '0',
		quantity: 0,
		units: '',
		category: '',
		brand: '',
		discount: 0,
		active: true,
		warrantyPeriod: '',
		slug: '',
	});
	const [editPart, setEditPart] = useState<SparePart | null>(null);
	const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
	const [newCategory, setNewCategory] = useState({
		name: '',
		gstRate: null as number | null,
	});
	const [sparePartCategory, setSparePartCategory] = useState<Category[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
	const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
	const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

	// Click outside handler to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setMenuOpenId(null);
			}
		};
		if (menuOpenId) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [menuOpenId]);

	const handleEdit = (part: any) => {
		setEditPart(part);
	};

	const handleDelete = async (part: any) => {
		const confirmDelete = toast.success(`Spare Part deleted`);
		if (confirmDelete) {
			const filtered = Spareparts?.filter((item: any) => item._id !== part._id);
			setSpareparts(filtered);
			const response = await new Client().admin.spareparts.delete(part._id);
			if (response) {
				fetchAllsparepartscategory();
				fetchAllSpareParts();
			}
		}
	};

	const fetchAllSpareParts = async () => {
		const data: any = await getSpareparts(partnerId);
		setSpareparts(data.data.data);
	};

	const fetchAllsparepartscategory = async () => {
		const response: any = await getAllsparepartscategory();
		if (response) {
			setSparePartCategory(response?.data?.data);
		}
	};

	const handleEditCategory = (category: Category) => {
		setCurrentCategory(category);
		setShowEditCategoryModal(true);
		setMenuOpenId(null);
	};

	const handleDeleteCategory = (category: Category) => {
		setCurrentCategory(category);
		setShowDeleteCategoryModal(true);
		setMenuOpenId(null);
	};

	const confirmDeleteCategory = async () => {
		if (!currentCategory) return;
		try {
			const data: any = { uuid: currentCategory.uuid };
			const response: any = await deletesparepartscategory(data);
			if (response) {
				toast.success('Category deleted successfully!');
				fetchAllsparepartscategory();
				fetchAllSpareParts();
			}
		} catch (error) {
			console.error('Failed to delete category:', error);
			toast.error('Error deleting category');
		} finally {
			setShowDeleteCategoryModal(false);
			setCurrentCategory(null);
		}
	};

	const handleUpdateCategory = async () => {
		if (!currentCategory) return;
		try {
			const data: any = {
				uuid: currentCategory.uuid,
				name: currentCategory.name,
				gstRate: currentCategory.gstRate,
			};
			const response: any = await updatesparepartscategory(data);
			if (response) {
				toast.success('Category updated successfully!');
				fetchAllsparepartscategory();
				fetchAllSpareParts();
				setShowEditCategoryModal(false);
			}
		} catch (error) {
			console.error('Failed to update category:', error);
			toast.error('Error updating category');
		}
	};

	useEffect(() => {
		let apiData: ApiSparePart[] = [];
		fetchAllSpareParts();
		fetchAllsparepartscategory();
		if (Array.isArray(Spareparts)) {
			apiData = Spareparts;
		} else if (
			Spareparts &&
			typeof Spareparts === 'object' &&
			'data' in Spareparts
		) {
			apiData = (Spareparts as ApiResponse).data || [];
		}
		if (apiData && apiData.length > 0) {
			const transformedData: SparePart[] = apiData.map((item) => ({
				id: item._id,
				_id: item._id,
				name: item.productName,
				productName: item.productName,
				image: item.image,
				price: item.price || '0',
				quantity: Number.parseInt(item.stock) || 0,
				units: item.units,
				stock: item.stock,
				category: item.category,
				brand: item.brand,
				rating: 4.5,
				reviews: Math.floor(Math.random() * 100) + 10,
				inStock: item.inStock,
				discount: Math.floor(Math.random() * 20),
				active: !item.isDeleted,
				warrantyPeriod: item.warrantyPeriod,
				slug: item.slug,
			}));
			setSpareParts(transformedData);
		}
	}, []);

	const calculateDiscountedPrice = (price: string, discount: number) => {
		return Number.parseInt(price) - (Number.parseInt(price) * discount) / 100;
	};

	const filteredParts = Spareparts.filter(
		(part: any) =>
			(selectedCategory ? part.category === selectedCategory : true) &&
			(part.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				part.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
				part.brand.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	const handleAddPart = async () => {
		const newSparePart: SparePart = {
			...newPart,
			id: `new-${Date.now()}`,
			inStock: newPart.quantity > 0,
			reviews: 0,
			rating: 0,
			_id: '',
		};
		const data: any = {
			productName: newPart.name,
			stock: String(newPart.quantity),
			price: newPart.price,
			brand: newPart.brand,
			units: newPart.units,
			category: newPart.category,
			warrantyPeriod: newPart.warrantyPeriod,
			image: newPart.image,
			partnerId,
		};
		const response: any = await new Client().admin.spareparts.create(data);
		if (response) {
			toast.success('Spare Part added successfully!');
			setSpareParts([...spareParts, newSparePart]);
			setNewPart({
				stock: '',
				productName: '',
				name: '',
				image: '',
				price: '0',
				quantity: 0,
				units: '',
				category: '',
				brand: '',
				discount: 0,
				active: true,
				warrantyPeriod: '',
				slug: '',
			});
			setShowAddModal(false);
			fetchAllSpareParts();
			fetchAllsparepartscategory();
		}
	};

	const handleAddCategory = async () => {
		try {
			const response = await createsparepartscategory(newCategory);
			if (response) {
				setNewCategory({ name: '', gstRate: null });
				setShowAddCategoryModal(false);
				fetchAllsparepartscategory();
				fetchAllSpareParts();
				toast.success('Category added successfully!');
			}
		} catch (error) {
			console.error('Failed to add category:', error);
			toast.error('Error adding category');
		}
	};

	const toggleMenu = (id: string) => {
		setMenuOpenId((prev) => (prev === id ? null : id));
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header */}
			<div className='sticky top-0 z-20 bg-[#FAF3EB] border-b '>
				<div className='container px-4 py-3 flex'>
					<button
						onClick={() => {
							setMenuOpenId(null);
							handleBack();
						}}
						className='hover:bg-gray-100 rounded-3xl transition-colors'
						aria-label='Go back'
					>
						<ArrowLeft className='text-red-800 w-6 h-6' />
					</button>
					<div className='flex-1 ml-4'>
						<h1 className='font-bold text-xl pb-1' style={{ ...FONTS.header }}>
							Spare Parts
						</h1>
					</div>
					<div className='flex items-center space-x-3'>
						<button
							className='p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-3xl transition-colors'
							onClick={() => {
								setMenuOpenId(null);
								setShowSearch(!showSearch);
							}}
							aria-label='Search'
						>
							<Search className='w-5 h-5' />
						</button>
						<button
							style={{ ...FONTS.paragraph }}
							className='flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 !text-white rounded-3xl font-medium transition-colors'
							onClick={() => {
								setMenuOpenId(null);
								setShowAddCategoryModal(true);
							}}
						>
							<Plus className='w-5 h-5' />
							<span>Add Category</span>
						</button>
						<button
							style={{ ...FONTS.paragraph }}
							className='flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 !text-white rounded-3xl font-medium transition-colors'
							onClick={() => {
								setMenuOpenId(null);
								setShowAddModal(true);
							}}
						>
							<Plus className='w-5 h-5' />
							<span>Add Spare Part</span>
						</button>
					</div>
				</div>
				{/* Category Filter */}
				<div className='container px-4 py-2'>
					<div className='flex pb-2 space-x-2'>
						{/* Fixed 'All Categories' Button */}
						<div className='flex-none'>
							<button
								onClick={() => {
									setMenuOpenId(null);
									setSelectedCategory(null);
								}}
								className={`px-4 py-2 rounded-full whitespace-nowrap ${
									!selectedCategory
										? 'bg-red-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
								}`}
							>
								All Categories
							</button>
						</div>
						{/* Scrollable Category Buttons */}
						<div className='flex overflow-x-auto space-x-2 scrollbar-thin scrollbar-hide'>
							{sparePartCategory.map((category) => (
								<div
									key={category._id}
									className='flex-none relative'
									ref={menuOpenId === category._id ? dropdownRef : null}
								>
									<button
										onClick={() => {
											if (selectedCategory !== category.name) {
												setMenuOpenId(null);
											}
											setSelectedCategory(category.name);
										}}
										className={`relative px-4 py-2 rounded-full w-40 text-center whitespace-nowrap flex justify-center items-center ${
											selectedCategory === category.name
												? 'bg-red-600 text-white'
												: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
									>
										<span className='truncate'>{category.name}</span>
										{/* 3-dot icon only visible when selected */}
										{selectedCategory === category.name && (
											<span
												className='ml-2 cursor-pointer absolute right-3'
												onClick={(e) => {
													e.stopPropagation();
													toggleMenu(category._id);
												}}
											>
												<FiMoreVertical />
											</span>
										)}
									</button>
									{/* Dropdown Menu */}
									{menuOpenId === category._id && (
										<div className='absolute top-0 right-0 z-50 mt-1 bg-white border rounded shadow-md flex'>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleEditCategory(category);
												}}
												className='block w-full py-2 px-2 text-sm hover:bg-gray-100'
											>
												<FaRegEdit />
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteCategory(category);
												}}
												className='block w-full py-2 px-2 text-sm hover:bg-gray-100'
											>
												<MdDelete />
											</button>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
				{/* Search Bar */}
				{showSearch && (
					<div className='container mx-auto px-4 pb-3'>
						<div className='relative'>
							<input
								type='text'
								className='w-full px-4 py-2 pl-10 border border-red-200 focus:border-red-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all'
								placeholder='Search parts, brands, categories...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onClick={() => setMenuOpenId(null)}
								autoFocus
							/>
							<Search className='absolute left-3 top-2.5 w-4 h-4 text-gray-400' />
							{searchTerm && (
								<button
									className='absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 rounded-3xl'
									onClick={() => {
										setMenuOpenId(null);
										setSearchTerm('');
									}}
									aria-label='Clear search'
								>
									×
								</button>
							)}
						</div>
					</div>
				)}
			</div>
			{/* Main Content */}
			<div
				className='container mx-auto px-4 py-6'
				onClick={() => setMenuOpenId(null)}
			>
				{/* Loading/Empty State */}
				{filteredParts.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-16'>
						<div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
							<Search className='w-8 h-8 text-gray-400' />
						</div>
						<h3 className='text-xl font-semibold text-gray-900 mb-2'>
							No spare parts data
						</h3>
						<p className='text-gray-600 mb-6 text-center'>
							{Spareparts &&
							(Array.isArray(Spareparts)
								? Spareparts.length === 0
								: !(Spareparts as ApiResponse).data?.length)
								? 'No spare parts available'
								: 'Loading spare parts...'}
						</p>
					</div>
				) : filteredParts.length > 0 ? (
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{filteredParts.map((part: any, index: number) => (
							<div
								key={index}
								className='group relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-red-200 transition-all duration-300 overflow-hidden cursor-pointer'
								onClick={() => {
									setMenuOpenId(null);
									setSelectedPart(part);
								}}
							>
								<div className='relative'>
									<button
										className='absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-white rounded-3xl shadow-md transition-all duration-200'
										aria-label='Quick view'
										onClick={(e) => {
											e.stopPropagation();
											setMenuOpenId(menuOpenId === part._id ? null : part._id);
										}}
									>
										<EllipsisVertical className='w-4 h-4 text-black' />
									</button>
									{menuOpenId === part._id && (
										<div className='absolute right-3 top-12 z-20 w-32 bg-white border border-gray-200 rounded-3xl shadow-lg'>
											<button
												className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-3xl'
												onClick={(e) => {
													e.stopPropagation();
													handleEdit(part);
													setMenuOpenId(null);
												}}
											>
												Edit
											</button>
											<button
												className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-3xl'
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(part);
													setMenuOpenId(null);
												}}
											>
												Delete
											</button>
										</div>
									)}
								</div>
								<div className='relative h-48 bg-gray-50 overflow-hidden'>
									<img
										className='w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300'
										src={part.image || '/placeholder.svg'}
										alt={part.productName}
										loading='lazy'
									/>
								</div>
								<div className='p-5'>
									<div className='flex items-center justify-between mb-2'>
										<span
											className='inline-block bg-gray-100 !text-gray-700 px-2 py-1 rounded-md text-xs font-medium'
											style={{ ...FONTS.paragraph }}
										>
											{part.category}
										</span>
										<span
											className='text-xs text-gray-500 font-medium'
											style={{ ...FONTS.paragraph }}
										>
											{part.brand}
										</span>
									</div>
									<h3
										className='!font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-700 transition-colors'
										style={{ ...FONTS.cardheader }}
									>
										{part.productName}
									</h3>
									<div className='flex   justify-between'>
										<span
											className='!text-xs  mb-3 p-1 !text-white rounded-md px-2 bg-green-600'
											style={{ ...FONTS.paragraph }}
										>
											Quantity: {part.stock}
										</span>
										{part.units && (
											<span
												className='!text-xs text-white'
												style={{ ...FONTS.paragraph }}
											>
												Units: {part.units}
											</span>
										)}
									</div>
									<div className='mb-3'>
										<span
											className='inline-block bg-blue-50 !text-blue-700 px-2 py-1 rounded-md text-xs font-medium'
											style={{ ...FONTS.paragraph }}
										>
											Warranty: {part.warrantyPeriod}
										</span>
									</div>
									<div className='space-y-3'>
										<div className='flex items-center gap-2'>
											{part.discount && part.discount > 0 ? (
												<>
													<span
														className='text-2xl font-bold !text-gray-900'
														style={{ ...FONTS.paragraph }}
													>
														&#8377;
														{calculateDiscountedPrice(
															part.price,
															part.discount
														).toLocaleString()}
													</span>
													<span className='text-sm text-gray-500 line-through'>
														₹{part.price.toLocaleString()}
													</span>
												</>
											) : (
												<span className='text-2xl font-bold text-gray-900'>
													₹{part.price.toLocaleString()}
												</span>
											)}
										</div>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<div
													className={`w-2 h-2 rounded-full ${
														part.inStock ? 'bg-green-500' : 'bg-red-500'
													}`}
												></div>
												<span
													className='!text-gray-600'
													style={{ ...FONTS.paragraph }}
												>
													{part.inStock ? 'In Stock' : 'Out of Stock'}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className='flex flex-col items-center justify-center py-16'>
						<div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
							<Search className='w-8 h-8 text-gray-400' />
						</div>
						<h3 className='text-xl font-semibold text-gray-900 mb-2'>
							No spare parts found
						</h3>
						<p className='text-gray-600 mb-6 text-center'>
							{searchTerm
								? `No results for "${searchTerm}"`
								: 'No parts match your criteria'}
						</p>
						{searchTerm && (
							<button
								className='px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-medium transition-colors'
								onClick={() => {
									setMenuOpenId(null);
									setSearchTerm('');
								}}
							>
								Clear Search
							</button>
						)}
					</div>
				)}
			</div>
			{/* Add Spare Part Modal */}
			{showAddModal && (
				<div
					className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'
					onClick={() => setShowAddModal(false)}
				>
					<div
						className='bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'
						onClick={(e) => e.stopPropagation()}
					>
						<div className='p-6'>
							<div className='flex items-center justify-between mb-6'>
								<h2
									className='text-2xl font-bold !text-gray-900'
									style={{ ...FONTS.header }}
								>
									Add New Spare Part
								</h2>
								<button
									onClick={() => setShowAddModal(false)}
									className='p-2 text-gray-400 hover:text-gray-600 rounded-3xl hover:bg-gray-100'
								>
									×
								</button>
							</div>
							<div
								className='grid grid-cols-1 md:grid-cols-2 gap-6 !text-gray-900'
								style={{ ...FONTS.paragraph }}
							>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Part Name*
									</label>
									<input
										type='text'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={newPart.name}
										onChange={(e) =>
											setNewPart({ ...newPart, name: e.target.value })
										}
										placeholder='Enter part name'
										required
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Image URL*
									</label>
									<input
										type='file'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={newPart.image}
										onChange={(e) =>
											setNewPart({ ...newPart, image: e.target.value })
										}
										placeholder='Enter image URL'
										required
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Price (₹)*
									</label>
									<input
										type='number'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={newPart.price || ''}
										onChange={(e) =>
											setNewPart({ ...newPart, price: e.target.value })
										}
										placeholder='Enter price'
										min='0'
										required
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Stock Quantity*
									</label>
									<input
										type='number'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={newPart.quantity || ''}
										onChange={(e) =>
											setNewPart({
												...newPart,
												quantity: Number(e.target.value),
											})
										}
										placeholder='Enter stock quantity'
										min='0'
										required
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Units*
									</label>
									<select
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={newPart.units}
										onChange={(e) =>
											setNewPart({ ...newPart, units: e.target.value })
										}
										required
									>
										<option value=''>Select Units</option>
										<option>Ltr</option>
										<option>Pcs</option>
										<option>Kg</option>
										<option>ml</option>
										<option>M</option>
										<option>Box</option>
										<option>Bundle</option>
										<option>packet</option>
									</select>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Category*
									</label>
									<select
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={newPart.category}
										onChange={(e) =>
											setNewPart({ ...newPart, category: e.target.value })
										}
										required
									>
										<option value=''>Select Category</option>
										{sparePartCategory.map((category) => (
											<option key={category._id} value={category.name}>
												{category.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Brand*
									</label>
									<input
										type='text'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={newPart.brand}
										onChange={(e) =>
											setNewPart({ ...newPart, brand: e.target.value })
										}
										placeholder='Enter brand'
										required
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Warranty Period*
									</label>
									<input
										type='text'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={newPart.warrantyPeriod}
										onChange={(e) =>
											setNewPart({ ...newPart, warrantyPeriod: e.target.value })
										}
										placeholder='e.g., 6 months'
										required
									/>
								</div>
								<div className='flex items-center'>
									<input
										type='checkbox'
										id='active-status'
										className='h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded'
										checked={newPart.active}
										onChange={(e) =>
											setNewPart({ ...newPart, active: e.target.checked })
										}
									/>
									<label
										htmlFor='active-status'
										className='ml-2 block text-sm text-gray-700'
									>
										Active Part
									</label>
								</div>
							</div>
							<div className='mt-8 flex justify-end gap-3'>
								<button
									type='button'
									onClick={() => setShowAddModal(false)}
									className='px-6 py-2 border border-gray-300 rounded-3xl font-medium text-gray-700 hover:bg-gray-50 transition-colors'
								>
									Cancel
								</button>
								<button
									type='button'
									onClick={handleAddPart}
									className='px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-medium transition-colors'
									disabled={
										!newPart.name ||
										!newPart.price ||
										!newPart.quantity ||
										!newPart.category ||
										!newPart.brand ||
										!newPart.warrantyPeriod
									}
								>
									Add Part
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Add Category Modal */}
			{showAddCategoryModal && (
				<div
					className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'
					onClick={() => setShowAddCategoryModal(false)}
				>
					<div
						className='bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto'
						onClick={(e) => e.stopPropagation()}
					>
						<div className='p-6'>
							<div className='flex items-center justify-between mb-6'>
								<h2
									className='text-2xl font-bold !text-gray-900'
									style={{ ...FONTS.header }}
								>
									Add New Category
								</h2>
								<button
									onClick={() => setShowAddCategoryModal(false)}
									className='p-2 text-gray-400 hover:text-gray-600 rounded-3xl hover:bg-gray-100'
								>
									×
								</button>
							</div>
							<div
								className='grid grid-cols-1 gap-6 !text-gray-900'
								style={{ ...FONTS.paragraph }}
							>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Category Name*
									</label>
									<input
										type='text'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={newCategory.name}
										onChange={(e) =>
											setNewCategory({ ...newCategory, name: e.target.value })
										}
										placeholder='Enter category name'
										required
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										GST Rate (%)*
									</label>
									<div className='relative'>
										<input
											type='number'
											inputMode='decimal'
											className='w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
											value={
												newCategory.gstRate !== null &&
												newCategory.gstRate !== undefined
													? newCategory.gstRate
													: ''
											}
											onChange={(e) =>
												setNewCategory({
													...newCategory,
													gstRate:
														e.target.value === ''
															? null
															: Number.parseFloat(e.target.value),
												})
											}
											placeholder='Enter GST rate'
											min='0'
											max='100'
											step='0.1'
											required
										/>
										<span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm'>
											%
										</span>
									</div>
								</div>
							</div>
							<div className='mt-8 flex justify-end gap-3'>
								<button
									type='button'
									onClick={() => setShowAddCategoryModal(false)}
									className='px-6 py-2 border border-gray-300 rounded-3xl font-medium text-gray-700 hover:bg-gray-50 transition-colors'
								>
									Cancel
								</button>
								<button
									type='button'
									onClick={handleAddCategory}
									className='px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-medium transition-colors'
									disabled={!newCategory.name || newCategory.gstRate === null}
								>
									Add Category
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Edit Category Modal */}
			{showEditCategoryModal && currentCategory && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-xl shadow-lg w-full max-w-md'>
						<div className='p-6'>
							<div className='flex items-center justify-between mb-6'>
								<h2 className='text-2xl font-bold text-gray-900'>
									Edit Category
								</h2>
								<button
									onClick={() => setShowEditCategoryModal(false)}
									className='p-2 text-gray-400 hover:text-gray-600 rounded-3xl hover:bg-gray-100'
								>
									×
								</button>
							</div>
							<div className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Category Name*
									</label>
									<input
										type='text'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={currentCategory.name}
										onChange={(e) =>
											setCurrentCategory({
												...currentCategory,
												name: e.target.value,
											})
										}
										required
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										GST Rate (%)*
									</label>
									<input
										type='number'
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={currentCategory.gstRate || ''}
										onChange={(e) =>
											setCurrentCategory({
												...currentCategory,
												gstRate:
													e.target.value === '' ? 0 : Number(e.target.value),
											})
										}
										min='0'
										max='100'
										step='0.1'
										required
									/>
								</div>
							</div>
							<div className='mt-8 flex justify-end gap-3'>
								<button
									onClick={() => setShowEditCategoryModal(false)}
									className='px-6 py-2 border border-gray-300 rounded-3xl font-medium text-gray-700 hover:bg-gray-50'
								>
									Cancel
								</button>
								<button
									onClick={handleUpdateCategory}
									className='px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-medium'
								>
									Save Changes
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Delete Category Confirmation Modal */}
			{showDeleteCategoryModal && currentCategory && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-xl shadow-lg w-full max-w-md'>
						<div className='p-6'>
							<div className='flex items-center justify-between mb-6'>
								<h2 className='text-xl font-bold text-gray-900'>
									Delete Category
								</h2>
								<button
									onClick={() => setShowDeleteCategoryModal(false)}
									className='p-2 text-gray-400 hover:text-gray-600 rounded-3xl hover:bg-gray-100'
								>
									×
								</button>
							</div>
							<p className='text-gray-700 mb-6'>
								Are you sure you want to delete the category "
								{currentCategory.name}"?
							</p>
							<div className='flex justify-end gap-3'>
								<button
									onClick={() => setShowDeleteCategoryModal(false)}
									className='px-6 py-2 border border-gray-300 rounded-3xl font-medium text-gray-700 hover:bg-gray-50'
								>
									Cancel
								</button>
								<button
									onClick={confirmDeleteCategory}
									className='px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-medium'
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{selectedPart && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-md shadow-lg w-full max-w-xl'>
						<div className='p-4'>
							<div className='flex items-center justify-end mb-4'>
								<button
									onClick={() => setSelectedPart(null)}
									className='px-2 font-bold text-gray-400 text-xl hover:text-gray-600 rounded-3xl hover:bg-gray-100'
								>
									×
								</button>
							</div>
							<img
								src={selectedPart.image || '/placeholder.svg'}
								alt={selectedPart.name}
								loading='lazy'
								className='w-full h-64 object-cover mb-4 bg-gray-50 rounded'
							/>
							<div
								className='text-md text-gray-800 grid grid-cols-2 gap-4'
								style={{ ...FONTS.paragraph }}
							>
								<p>
									<span className='font-bold text-gray-700'>Product Name:</span>{' '}
									<span className='text-gray-900'>{selectedPart.productName}</span>
								</p>
								<p>
									<span className='font-bold text-gray-700'>Category:</span>{' '}
									<span className='text-gray-900'>{selectedPart.category}</span>
								</p>
								<p>
									<span className='font-bold text-gray-700'>Brand:</span>{' '}
									<span className='text-gray-900'>{selectedPart.brand}</span>
								</p>
								<p>
									<span className='font-bold text-gray-700'>Units:</span>{' '}
									<span className='text-gray-900'>{selectedPart.units}</span>
								</p>
								<p>
									<span className='font-bold text-gray-700'>Quantity:</span>{' '}
									<span className='text-gray-900'>{selectedPart.stock}</span>
								</p>
								<p>
									<span className='font-bold text-gray-700'>Warranty:</span>{' '}
									<span className='text-blue-700'>
										{selectedPart.warrantyPeriod}
									</span>
								</p>
								<p>
									<span className='font-bold text-gray-700'>Stock:</span>{' '}
									<span
										className={
											selectedPart.stock && Number(selectedPart.stock) > 5
												? 'text-green-600'
												: selectedPart.stock &&
												  Number(selectedPart.stock) > 0 &&
												  Number(selectedPart.stock) < 5
												? 'text-orange-500'
												: 'text-red-600'
										}
									>
										{selectedPart.stock &&
										Number(selectedPart.stock) >= 1 &&
										selectedPart.inStock
											? `In Stock`
											: 'out of stock'}
									</span>
								</p>
								<p>
									<span className='font-bold text-gray-700'>Price:</span>{' '}
									<span className='text-red-600 font-semibold'>
										₹{selectedPart.price}
									</span>
								</p>
								{/* {selectedPart.discount ? (
                  <p>
                    <span className="font-bold text-gray-700">Discounted Price:</span>{" "}
                    <span className="text-green-700 font-bold">
                      ₹{calculateDiscountedPrice(selectedPart.price, selectedPart.discount)}
                      ₹{selectedPart.price}
                    </span>
                  </p>
                ) : null} */}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* SparePats Edit Modal */}
			{editPart && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 '>
					<div className='bg-white rounded-md shadow-lg w-full max-w-xl m-12'>
						<div className='p-4'>
							<div className='flex items-center justify-between mb-4'>
								<h2
									className='text-xl font-semibold !text-gray-800'
									style={{ ...FONTS.header }}
								>
									Edit Part
								</h2>
								<button
									onClick={() => setEditPart(null)}
									className='px-2 font-bold text-gray-400 text-xl hover:text-gray-600 rounded-3xl hover:bg-gray-100'
								>
									×
								</button>
							</div>
							<div
								className='grid grid-cols-2 gap-4 !text-gray-700'
								style={{ ...FONTS.paragraph }}
							>
								<div className='col-span-2'>
									<label className='block text-sm font-medium text-gray-700'>
										Product Image
									</label>
									<input
										type='file'
										accept='image/*'
										title='Upload Image'
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												const imageUrl = URL.createObjectURL(file);
												setEditPart({ ...editPart, image: imageUrl });
											}
										}}
										className='mt-1 block w-full text-sm file:bg-red-50 file:border file:border-red-300 file:rounded file:px-3 file:py-1 file:text-black hover:file:bg-red-100'
									/>
								</div>
								<div className='col-span-2'>
									<label className='block text-sm font-medium text-gray-700'>
										Name
									</label>
									<input
										title='Part Name'
										type='text'
										value={editPart.name || editPart.productName}
										onChange={(e) =>
											setEditPart({
												...editPart,
												name: e.target.value,
												productName: e.target.value,
											})
										}
										className='mt-1 block w-full border-gray-300 shadow-sm outline-none focus:border-b-2 focus:border-b-red-500'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Units*
									</label>
									<select
										className='w-full px-4 py-2 border border-gray-300 rounded-lg'
										value={editPart.units || ''}
										onChange={(e) =>
											setEditPart({
												...editPart,
												units: e.target.value,
											})
										}
										required
									>
										<option value=''>Select Units</option>
										<option>Ltr</option>
										<option>Pcs</option>
										<option>Kg</option>
										<option>ml</option>
										<option>M</option>
										<option>Box</option>
										<option>Bundle</option>
										<option>packet</option>
									</select>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700'>
										Category
									</label>
									<select
										className='mt-1 block w-full border-gray-300 shadow-sm outline-none focus:border-b-2 focus:border-b-red-500'
										value={editPart.category}
										onChange={(e) =>
											setEditPart({ ...editPart, category: e.target.value })
										}
									>
										<option value=''>{editPart.category}</option>
										{sparePartCategory.map((category) => (
											<option key={category._id} value={category.name}>
												{category.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700'>
										Brand
									</label>
									<input
										title='Brand'
										type='text'
										value={editPart.brand}
										onChange={(e) =>
											setEditPart({ ...editPart, brand: e.target.value })
										}
										className='mt-1 block w-full border-gray-300 shadow-sm outline-none focus:border-b-2 focus:border-b-red-500'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700'>
										Warranty Period
									</label>
									<input
										title='Warranty Period'
										type='text'
										value={editPart.warrantyPeriod}
										onChange={(e) =>
											setEditPart({
												...editPart,
												warrantyPeriod: e.target.value,
											})
										}
										className='mt-1 block w-full border-gray-300 shadow-sm outline-none focus:border-b-2 focus:border-b-red-500'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700'>
										Quantity
									</label>
									<input
										title='Quantity'
										type='number'
										value={editPart.stock}
										onChange={(e) =>
											setEditPart((prevEditPart) => {
												if (!prevEditPart) return null;
												const newQuantity = Number.parseInt(e.target.value, 10);
												return {
													...prevEditPart,
													quantity: isNaN(newQuantity) ? 0 : newQuantity,
													stock: isNaN(newQuantity) ? '0' : String(newQuantity),
												};
											})
										}
										className='mt-1 block w-full rounded-md shadow-sm outline-none focus:border-b-2 focus:border-b-red-500 px-2 py-1'
										disabled={!editPart.inStock}
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700'>
										Price
									</label>
									<input
										title='Price'
										type='number'
										value={editPart.price}
										onChange={(e) =>
											setEditPart({ ...editPart, price: e.target.value })
										}
										className='mt-1 block w-full border-gray-300 shadow-sm outline-none focus:border-b-2 focus:border-b-red-500'
									/>
								</div>
								<div className='col-span-2'>
									<label className='block text-sm font-medium text-gray-700'>
										Status
									</label>
									<select
										title='Active Status'
										value={editPart.inStock ? 'true' : 'false'}
										onChange={(e) =>
											setEditPart((prevEditPart) => {
												if (!prevEditPart) return null;
												const newInStock = e.target.value === 'true';
												return {
													...prevEditPart,
													inStock: newInStock,
													quantity: newInStock ? prevEditPart.quantity : 0, // Set quantity to 0 if out of stock
													stock: newInStock
														? String(prevEditPart.quantity)
														: '0', // Also update stock string
												};
											})
										}
										className='mt-1 block w-full border-gray-300 shadow-sm outline-none focus:border-b-2 focus:border-b-red-500'
									>
										<option value='true'>In stock</option>
										<option value='false'>Out of stock</option>
									</select>
								</div>
							</div>
							<div className='mt-6 flex justify-end gap-3'>
								<button
									className='px-4 py-2 bg-gray-100 text-gray-700 rounded-3xl hover:bg-gray-200'
									onClick={() => setEditPart(null)}
								>
									Cancel
								</button>
								<button
									className='px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700'
									onClick={async () => {
										try {
											const data = {
												brand: editPart.brand,
												category: editPart.category,
												image: editPart.image,
												inStock: editPart.inStock,
												units: editPart.units,
												price: editPart.price,
												productName: editPart.name || editPart.productName,
												stock: String(editPart.stock),
												warrantyPeriod: editPart.warrantyPeriod,
												slug: editPart.slug,
											};
											console.log('Sending data to updateSpare:', data);
											// Call the API to update the spare part
											await updateSpare(data, editPart._id);
											// Update the local state to reflect the changes
											const updatedSpareparts = Spareparts.map((part: any) =>
												part._id === editPart._id
													? {
															...part,
															productName:
																editPart.name || editPart.productName,
															brand: editPart.brand,
															category: editPart.category,
															image: editPart.image,
															inStock: editPart.inStock,
															units: editPart.units,
															price: editPart.price,
															stock: String(editPart.stock),
															warrantyPeriod: editPart.warrantyPeriod,
															slug: editPart.slug,
													  }
													: part
											);
											// Update both state arrays
											setSpareparts(updatedSpareparts);
											// Also update the spareParts array for consistency
											const updatedSpareParts = spareParts.map(
												(part: SparePart) =>
													part._id === editPart._id
														? {
																...part,
																name: editPart.name || editPart.productName,
																productName:
																	editPart.name || editPart.productName,
																brand: editPart.brand,
																category: editPart.category,
																image: editPart.image,
																inStock: editPart.inStock,
																price: editPart.price,
																quantity: Number(editPart.quantity),
																units: editPart.units,
																stock: editPart.stock,
																warrantyPeriod: editPart.warrantyPeriod,
														  }
														: part
											);
											setSpareParts(updatedSpareParts);
											// Show success message
											toast.success('Spare part updated successfully!');
											// Close the modal
											setEditPart(null);
										} catch (error) {
											console.error('Error updating spare part:', error);
											toast.error('Error updating spare part');
										}
									}}
								>
									Save Changes
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ServiceSpareParts;
