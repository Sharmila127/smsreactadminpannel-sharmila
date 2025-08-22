import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, Plus, X, Edit3, Trash2 } from 'lucide-react';
import Client from '../../api';
import { FONTS } from '../../constants/uiConstants';
import { toast } from 'react-toastify';

interface Service {
	_id: string;
	service_name: string;
	slug: string;
	description?: string;
	price?: number;
	category_id?: string;
	partner_id?: string;
	is_active?: boolean;
	is_deleted?: boolean;
	created_at?: string;
	updated_at?: string;
	uuid?: string;
	image?: string;
	duration?: string;
}

interface Category {
	_id: string;
	id: number;
	category_name: string;
	slug: string;
	is_active: boolean;
	is_deleted: boolean;
	services: Service[];
	uuid: string;
	createdAt: string;
	updatedAt: string;
	__v?: number;
}

type ServiceCenterServicesProps = {
	onSpareParts: () => void;
	handleBack: () => void;
	partnerId: string;
	Services: Category[];
};

const ServicesList: React.FC<ServiceCenterServicesProps> = ({
	handleBack,
	partnerId,
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [showAddForm, setShowAddForm] = useState(false);
	const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
	const [activeServiceType, setActiveServiceType] = useState<string>('');
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [editingService, setEditingService] = useState<Service | null>(null);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [categories, setCategories] = useState<Category[]>([]);

	const fetchdata = async () => {
		try {
			const response: any =
				await new Client().admin.servicecenter.getCatEvery();
			if (response) {
				setCategories(response.data.data);
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	useEffect(() => {
		fetchdata();
	}, [partnerId]);

	const [newCategory, setNewCategory] = useState({
		category_name: '',
		is_active: true,
	});

	const [newService, setNewService] = useState({
		service_name: '',
		price: '',
		description: '',
		duration: '',
		image: null as string | ArrayBuffer | null,
		is_active: true,
	});

	const getAllServices = () => {
		const allServices: (Service & { categoryName: string })[] = [];
		categories.forEach((category) => {
			if (
				category.is_active &&
				category.services &&
				category.services.length > 0
			) {
				category.services
					.filter((service) => service && !service.is_deleted)
					.forEach((service) => {
						allServices.push({
							...service,
							categoryName: category.category_name,
						});
					});
			}
		});
		return allServices;
	};

	const getFilteredServices = () => {
		let services = getAllServices();

		if (selectedCategory !== 'all') {
			const selectedCat = categories.find(
				(cat) => cat._id === selectedCategory
			);
			if (selectedCat && selectedCat.is_active) {
				services = selectedCat?.services
					.filter((service) => service && !service.is_deleted)
					.map((service) => ({
						...service,
						categoryName: selectedCat.category_name,
					}));
			} else {
				services = [];
			}
		}

		if (searchTerm) {
			services = services?.filter(
				(service) =>
					service.service_name
						?.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					service.description?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		return services;
	};

	const handleDeleteCategory = async (categoryId: string) => {
		try {
			const res = await new Client().admin.category.delete(categoryId);
			if (res) {
				fetchdata();
				setCategories(categories.filter((cat) => cat._id !== categoryId));
				if (selectedCategory === categoryId) {
					setSelectedCategory('all');
				}
				toast.success('Category deleted successfully');
			}
		} catch (error) {
			console.error('Error deleting category:', error);
			toast.error('Failed to delete category. Please try again.');
		}
	};

	const handleAddCategory = async () => {
		try {
			setEditingCategory(null);
			setNewCategory({ category_name: '', is_active: true });
			setShowAddCategoryForm(true);
		} catch (error) {
			console.log(error);
		}
	};

	const handleEditCategory = (category: Category) => {
		setEditingCategory(category);
		setNewCategory({
			category_name: category.category_name,
			is_active: category.is_active,
		});
		setShowAddCategoryForm(true);
	};

	const handleCancelAddCategory = () => {
		setShowAddCategoryForm(false);
		setEditingCategory(null);
		setNewCategory({ category_name: '', is_active: true });
	};

	const handleCategoryInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;
		setNewCategory((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSubmitCategory = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newCategory.category_name) {
			try {
				if (editingCategory) {
					const updatedCategories = await Promise.all(
						categories.map(async (cat) => {
							if (cat._id === editingCategory._id) {
								const response: any = await new Client().admin.category.update(
									newCategory,
									cat.uuid
								);
								const { data } = response.data;

								return {
									...cat,
									data,
								};
							} else {
								return cat;
							}
						})
					);

					setCategories(updatedCategories);
					toast.success('Category updated successfully');
				} else {
					// Create new category
					const newCategoryItem: any = {
						// _id: `temp-${Date.now()}`,
						id: Date.now(),
						category_name: newCategory.category_name,
						slug: newCategory.category_name.toLowerCase().replace(/\s+/g, '-'),
						is_active: newCategory.is_active,
						is_deleted: false,
						partnerId,
						// services: [],
						// uuid: `temp-uuid-${Date.now()}`,
						// createdAt: new Date().toISOString(),
						// updatedAt: new Date().toISOString(),
					};
					const response: any = await new Client().admin.category.create(
						newCategoryItem
					);
					if (response) {
						fetchdata();
						setCategories([...categories, response.data.data]);
						toast.success('Category created successfully');
					}
				}

				setNewCategory({ category_name: '', is_active: true });
				setShowAddCategoryForm(false);
				setEditingCategory(null);
			} catch (error) {
				console.error('Error saving category:', error);
			}
		}
	};

	const handleAddService = (categoryId?: string) => {
		setActiveServiceType(categoryId || selectedCategory);
		setEditingService(null);
		setNewService({
			service_name: '',
			price: '',
			description: '',
			duration: '',
			image: null,
			is_active: true,
		});
		setShowAddForm(true);
	};

	const handleEditService = (service: Service) => {
		const category = categories.find((cat) =>
			cat.services.some((s) => s._id === service._id)
		);
		setActiveServiceType(category?._id || '');
		setEditingService(service);
		setNewService({
			service_name: service.service_name,
			price: service.price?.toString() || '',
			description: service.description || '',
			duration: service.duration || '',
			image: service.image || null,
			is_active: service.is_active ?? true,
		});
		setShowAddForm(true);
	};

	const handleCancelAdd = () => {
		setShowAddForm(false);
		setEditingService(null);
		setNewService({
			service_name: '',
			price: '',
			description: '',
			duration: '',
			image: null,
			is_active: true,
		});
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;
		setNewService((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setNewService((prev) => ({
					...prev,
					image: reader.result,
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleToggleActive = async (serviceId: string) => {
		try {
			const updatedCategories = categories.map((category) => ({
				...category,
				services: category.services.map((service) =>
					service._id === serviceId
						? { ...service, is_active: !service.is_active }
						: service
				),
			}));
			setCategories(updatedCategories);
		} catch (error) {
			console.error('Error toggling service status:', error);
		}
	};

	const handleDeleteService = async (serviceId: string) => {
		try {
			const response = await new Client().admin.service.delete(serviceId);
			if (response) {
				const updatedCategories = categories.map((category) => ({
					...category,
					services: category.services.map((service) =>
						service._id === serviceId
							? { ...service, is_deleted: true }
							: service
					),
				}));
				fetchdata();
				setCategories(updatedCategories);
				toast.success('Service deleted successfully');
			}
		} catch (error) {
			console.error('Error deleting service:', error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newService.service_name && newService.price && activeServiceType) {
			try {
				const selectedCat = categories.find(
					(cat) => cat._id === activeServiceType
				);
				if (!selectedCat) return;

				if (editingService) {
					// Update existing service
					const editservice: any = {
						service_name: newService.service_name,
						price: Number.parseFloat(newService.price),
						description: newService.description,
						duration: newService.duration,
						image: newService.image as string,
						// is_active: newService.is_active,
						// updated_at: new Date().toISOString(),
					};

					const updatedCategories = await Promise.all(
						categories.map(async (category) => {
							const updatedServices = await Promise.all(
								category.services.map(async (service: any) => {
									if (service._id === editingService._id) {
										await new Client().admin.service.update(
											editservice,
											service.uuid
										);
										const data: any = {
											service_name: newService.service_name,
											price: Number.parseFloat(newService.price),
											description: newService.description,
											duration: newService.duration,
											image: newService.image as string,
											is_active: newService.is_active,
											updated_at: new Date().toISOString(),
										};
										return {
											...service,
											data,
										};
									} else {
										return service;
									}
								})
							);
							return {
								...category,
								services: updatedServices,
							};
						})
					);
					setCategories(updatedCategories);
					toast.success('Service updated successfully');
					setShowAddForm(false);
				} else {
					// Create new service
					const newServiceItem: any = {
						// _id: `temp-${Date.now()}`,
						service_name: newService.service_name,
						// slug: newService.service_name.toLowerCase().replace(/\s+/g, "-"),
						description: newService.description,
						price: Number.parseFloat(newService.price),
						category_id: selectedCat.uuid,
						partner_id: partnerId,
						// is_active: newService.is_active,
						// is_deleted: false,
						// created_at: new Date().toISOString(),
						// updated_at: new Date().toISOString(),
						// uuid: `temp-service-${Date.now()}`,
						// image: newService.image as string,
						duration: newService.duration,
					};
					const response: any = await new Client().admin.service.create(
						newServiceItem
					);

					if (response) {
						const updatedCategories = categories.map((category) =>
							category._id === activeServiceType
								? {
										...category,
										services: [...category.services, response.data.data],
								  }
								: category
						);
						fetchdata();
						setCategories(updatedCategories);
						toast.success('Service created successfully');
					}

					setNewService({
						service_name: '',
						price: '',
						description: '',
						duration: '',
						image: null,
						is_active: true,
					});
					setShowAddForm(false);
					setEditingService(null);
					if (fileInputRef.current) {
						fileInputRef.current.value = '';
					}
				}
			} catch (error) {
				console.error('Error saving service:', error);
			}
		}
	};

	const filteredServices = getFilteredServices();

	return (
		<div className='h-full bg-gray-50 flex'>
			{/* Sidebar */}
			<div className='w-80 h-screen bg-pink-50 shadow-lg border-r border-gray-200 flex flex-col'>
				{/* Sidebar Header */}
				<div className='p-6 border-b border-gray-200'>
					<div className='flex items-center space-x-3 mb-4'>
						<button
							onClick={handleBack}
							className='p-2 rounded-3xl hover:bg-gray-100 transition-colors'
						>
							<ArrowLeft className='w-5 h-5 text-gray-600' />
						</button>
						<div>
							<h1
								className='!font-bold- text-gray-900'
								style={{ ...FONTS.cardheader }}
							>
								Service Catalog
							</h1>
							<p className='!text-gray-500' style={{ ...FONTS.paragraph }}>
								Manage services
							</p>
						</div>
					</div>

					<button
						style={{ ...FONTS.paragraph }}
						onClick={handleAddCategory}
						className='w-full flex items-center justify-center space-x-2 px-2 py-2 bg-[#800000] !text-white rounded-3xl hover:bg-[#600000] transition-colors'
					>
						<Plus className='w-4 h-4' />
						<span>Add Category</span>
					</button>
				</div>

				{/* Categories */}
				<div className='flex-1 p-4 space-y-2 overflow-scroll scrollbar-hide'>
					<div className='p-2 pb-4 sticky -top-4 bg-pink-50 z-10'>
						<h3
							className=' !font-semibold text-gray-700 '
							style={{ ...FONTS.cardSubHeader }}
						>
							CATEGORIES
						</h3>
					</div>

					<button
						onClick={() => setSelectedCategory('all')}
						className={`w-full flex items-center space-x-3 px-3 py-2 rounded-3xl transition-colors ${
							selectedCategory === 'all'
								? 'bg-[#800000]/10 text-[#800000]'
								: 'text-gray-700 hover:bg-[#800000]/10 hover:text-[#800000]'
						}`}
					>
						<div className='flex-1 text-left'>
							<div className='!text-black' style={{ ...FONTS.paragraph }}>
								All Services
							</div>
							<div
								className='font-semibold text-gray-500'
								style={{ ...FONTS.subParagraph }}
							>
								{getAllServices().length} services
							</div>
						</div>
					</button>

					{categories
						.filter((cat) => cat.is_active && !cat.is_deleted)
						.map((category) => (
							<div key={category._id} className='group'>
								<button
									onClick={() => setSelectedCategory(category._id)}
									className={`w-full flex items-center space-x-3 px-3 py-2 rounded-3xl transition-colors ${
										selectedCategory === category._id
											? 'bg-[#800000]/10 text-[#800000]'
											: 'text-gray-700 hover:bg-[#800000]/10 hover:text-[#800000]'
									}`}
								>
									<div className='flex-1 text-left'>
										<div className='!text-black' style={{ ...FONTS.paragraph }}>
											{category.category_name}
										</div>
										<div
											className='font-semibold text-gray-500'
											style={{ ...FONTS.subParagraph }}
										>
											{category.services?.filter((s) => s && !s.is_deleted)
												.length || 0}{' '}
											services
										</div>
									</div>
									<div className='flex space-x-1'>
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleEditCategory(category);
											}}
											className='opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-3xl transition-all'
										>
											<Edit3 className='w-3 h-3' />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteCategory(category.uuid);
											}}
											className='opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-3xl transition-all text-red-500'
										>
											<Trash2 className='w-3 h-3' />
										</button>
									</div>
								</button>
							</div>
						))}
				</div>
			</div>

			{/* Main Content */}
			<div className='flex-1 flex flex-col'>
				{/* Top Bar */}
				<div className='bg-pink-50 shadow-sm border-b border-gray-200 p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<h2
								className='text-2xl font-bold text-gray-900'
								style={{ ...FONTS.cardheader }}
							>
								{selectedCategory === 'all'
									? 'All Services'
									: categories.find((c) => c._id === selectedCategory)
											?.category_name}
							</h2>
							<p
								className='!text-gray-500 font-semibold'
								style={{ ...FONTS.paragraph }}
							>
								{filteredServices.length} Services Available
							</p>
						</div>

						<div className='flex items-center space-x-4'>
							{/* Search */}
							<div className='relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
								<input
									type='text'
									className='pl-10 pr-4 py-2 w-45 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500'
									placeholder='Search services...'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							{/* Add Service */}
							<button
								style={{ ...FONTS.paragraph }}
								onClick={() => handleAddService()}
								className='flex items-center space-x-2 px-4 py-2 bg-[#800000] !text-white rounded-3xl hover:bg-[#600000] transition-colors'
							>
								<Plus className='w-4 h-4' />
								<span>Add Service</span>
							</button>
						</div>
					</div>
				</div>

				{/* Content Area */}
				<div className='flex-1 p-6'>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{filteredServices.map((service) => (
							<div
								key={service._id}
								className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'
							>
								<div className='relative'>
									<img
										src={service.image}
										alt={service.service_name}
										className='w-full h-48 object-cover'
									/>
									<div className='absolute top-2 right-2 flex space-x-1'>
										<button
											onClick={() => handleEditService(service)}
											className='p-2 bg-white/90 rounded-3xl shadow hover:bg-gray-100 transition-colors'
										>
											<Edit3 className='w-4 h-4 text-gray-700' />
										</button>
										<button
											onClick={() => handleDeleteService(service._id)}
											className='p-2 bg-white/90 rounded-3xl shadow hover:bg-red-100 transition-colors'
										>
											<Trash2 className='w-4 h-4 text-red-600' />
										</button>
									</div>
								</div>
								<div className='p-4'>
									<div className='flex justify-between items-start'>
										<div>
											<h3
												className='!font-bold text-lg !text-gray-700'
												style={{ ...FONTS.cardSubHeader }}
											>
												{service.service_name}
											</h3>
											<p
												className='text-sm text-gray-500'
												style={{ ...FONTS.paragraph }}
											>
												{service.categoryName}
											</p>
										</div>
										<span
											className='font-bold !text-gray-900'
											style={{ ...FONTS.cardheader }}
										>
											₹{service.price || 0}
										</span>
									</div>
									<p
										className='mt-2 text-sm !text-gray-600 line-clamp-2'
										style={{ ...FONTS.subParagraph }}
									>
										{service.description || 'No description'}
									</p>
									<div className='mt-4 flex justify-between items-center'>
										<span
											className='text-sm !text-gray-500'
											style={{ ...FONTS.paragraph }}
										>
											{service.duration || 'N/A'}
										</span>
										<button
											style={{ ...FONTS.paragraph }}
											onClick={() => handleToggleActive(service._id)}
											className={`inline-flex items-center px-2.5 py-0.5 rounded-3xl  ${
												service.is_active
													? 'bg-green-100 !text-green-800'
													: 'bg-red-100 !text-red-800'
											}`}
										>
											{service.is_active ? 'Active' : 'Inactive'}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>

					{filteredServices.length === 0 && (
						<div className='text-center py-12'>
							<div className='text-gray-400 mb-4'>
								<Search className='w-12 h-12 mx-auto' />
							</div>
							<h3 className='text-lg font-medium text-gray-900 mb-2'>
								No services found
							</h3>
							<p className='text-gray-500'>
								{selectedCategory === 'all'
									? 'Try adjusting your search or add a new service'
									: `No services available in ${
											categories.find((c) => c._id === selectedCategory)
												?.category_name || 'this category'
									  }. Add a service to get started.`}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Add/Edit Service Modal */}
			{showAddForm && (
				<div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
						<div className='p-6 border-b border-gray-200'>
							<div className='flex items-center justify-between'>
								<h3 className='text-xl font-bold text-gray-900'>
									{editingService ? 'Edit Service' : 'Add New Service'}
								</h3>
								<button
									onClick={handleCancelAdd}
									className='p-2 hover:bg-gray-100 rounded-3xl transition-colors'
								>
									<X className='w-5 h-5 text-gray-500' />
								</button>
							</div>
						</div>

						<form onSubmit={handleSubmit} className='p-6 space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div>
									<label className='block text-sm font-semibold text-gray-700 mb-2'>
										Service Name
									</label>
									<input
										type='text'
										name='service_name'
										value={newService.service_name}
										onChange={handleInputChange}
										className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
										placeholder='Enter service name'
										required
									/>
								</div>

								<div>
									<label className='block text-sm font-semibold text-gray-700 mb-2'>
										Price (₹)
									</label>
									<input
										type='number'
										name='price'
										value={newService.price}
										onChange={handleInputChange}
										className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
										placeholder='Enter price'
										required
									/>
								</div>

								<div>
									<label className='block text-sm font-semibold text-gray-700 mb-2'>
										Duration
									</label>
									<input
										type='text'
										name='duration'
										value={newService.duration}
										onChange={handleInputChange}
										className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
										placeholder='e.g., 30 min'
									/>
								</div>

								<div>
									<label className='block text-sm font-semibold text-gray-700 mb-2'>
										Category
									</label>
									<select
										value={activeServiceType}
										onChange={(e) => setActiveServiceType(e.target.value)}
										className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
										required
									>
										<option value=''>Select category</option>
										{categories
											.filter((cat) => cat.is_active && !cat.is_deleted)
											.map((category) => (
												<option key={category._id} value={category._id}>
													{category.category_name}
												</option>
											))}
									</select>
								</div>
							</div>

							<div>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									Description
								</label>
								<textarea
									name='description'
									value={newService.description}
									onChange={handleInputChange}
									rows={3}
									className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
									placeholder='Enter service description'
								/>
							</div>

							<div>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									Service Image
								</label>
								<div className='relative'>
									<input
										type='file'
										ref={fileInputRef}
										onChange={handleImageUpload}
										accept='image/*'
										className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
									/>
									{newService.image && (
										<div className='mt-3'>
											<img
												src={
													typeof newService.image === 'string'
														? newService.image
														: ''
												}
												alt='Preview'
												className='h-32 w-48 object-cover rounded-lg shadow-sm'
											/>
										</div>
									)}
								</div>
							</div>

							{/* <div className='flex items-center space-x-3'>
								<input
									type='checkbox'
									name='is_active'
									checked={newService.is_active}
									onChange={handleInputChange}
									className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
								/>
								<label className='text-sm font-medium text-gray-700'>
									Activate service immediately
								</label>
							</div> */}

							<div className='flex space-x-3 pt-4'>
								<button
									type='button'
									onClick={handleCancelAdd}
									className='flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors'
								>
									Cancel
								</button>
								<button
									type='submit'
									className='flex-1 px-4 py-3 text-sm font-semibold text-white bg-[#800000] rounded-3xl hover:bg-[#600000] transition-colors'
								>
									{editingService ? 'Update Service' : 'Add Service'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Add/Edit Category Modal */}
			{showAddCategoryForm && (
				<div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-2xl shadow-2xl w-full max-w-md'>
						<div className='p-6 border-b border-gray-200'>
							<div className='flex items-center justify-between'>
								<h3 className='text-xl font-bold text-gray-900'>
									{editingCategory ? 'Edit Category' : 'Add New Category'}
								</h3>
								<button
									onClick={handleCancelAddCategory}
									className='p-2 hover:bg-gray-100 rounded-3xl transition-colors'
								>
									<X className='w-5 h-5 text-gray-500' />
								</button>
							</div>
						</div>

						<form onSubmit={handleSubmitCategory} className='p-6 space-y-6'>
							<div>
								<label className='block text-sm font-semibold text-gray-700 mb-2'>
									Category Name
								</label>
								<input
									type='text'
									name='category_name'
									value={newCategory.category_name}
									onChange={handleCategoryInputChange}
									className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black'
									placeholder='Enter category name'
									required
								/>
							</div>

							<div className='flex items-center space-x-3'>
								<input
									type='checkbox'
									name='is_active'
									checked={newCategory.is_active}
									onChange={handleCategoryInputChange}
									className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
								/>
								<label className='text-sm font-medium text-gray-700'>
									Activate category immediately
								</label>
							</div>

							<div className='flex space-x-3 pt-4'>
								<button
									type='button'
									onClick={handleCancelAddCategory}
									className='flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors'
								>
									Cancel
								</button>
								<button
									type='submit'
									className='flex-1 px-4 py-3 text-sm font-semibold text-white bg-[#800000] rounded-3xl hover:bg-[#600000] transition-colors'
								>
									{editingCategory ? 'Update Category' : 'Add Category'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default ServicesList;
