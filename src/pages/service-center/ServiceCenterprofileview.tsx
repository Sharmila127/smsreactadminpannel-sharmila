/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from 'react';
import { useState, useEffect } from 'react';
import { FaArrowRight, FaEdit, FaTrash } from 'react-icons/fa';
import { BsBuildings } from 'react-icons/bs';
import { SlCalender } from 'react-icons/sl';
import { AiFillSafetyCertificate } from 'react-icons/ai';
import {
	MdEmail,
	MdOutlineMailOutline,
	MdOutlineKeyboardBackspace,
} from 'react-icons/md';
import { CgWebsite } from 'react-icons/cg';
import { FcDataEncryption } from 'react-icons/fc';
import { RiLockPasswordLine } from 'react-icons/ri';
import { LuPhoneCall } from 'react-icons/lu';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Client from '../../api';
import { FONTS } from '../../constants/uiConstants';
import { toast } from 'react-toastify';

interface FormErrors {
	companyName?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	email?: string;
	loginEmail?: string;
	state?: string;
	city?: string;
	pincode?: string;
	address1?: string;
	address2?: string;
	aadharNumber?: string;
	panCard?: string;
	gstNo?: string;
	regNo?: string;
	newPassword?: string;
	confirmPassword?: string;
	image?: string;
}

type ServiceCenterProfileProps = {
	onSpareParts: () => void;
	onServices: () => void;
	setpartnerId: (id: string) => void;
	partner: any;
	handleBack: () => void;
};

const ServiceCenterProfileView: React.FC<ServiceCenterProfileProps> = ({
	onServices,
	partner,
	onSpareParts,
	setpartnerId,
	handleBack,
}) => {
	const [isActive, setIsActive] = useState(true);
	const [showConfirm, setShowConfirm] = useState(false);
	const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showEditForm, setShowEditForm] = useState(false);
	const [showSuccessPopup, setShowSuccessPopup] = useState(false);
	const [showNoChangesPopup, setShowNoChangesPopup] = useState(false);
	const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errors, setErrors] = useState<FormErrors>({});
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const validateField = (name: string, value: string): string | undefined => {
		switch (name) {
			case 'companyName':
				if (!value.trim()) return 'Company name is required';
				if (value.length > 100) return 'Company name too long';
				return undefined;

			case 'firstName':
			case 'lastName':
				if (!value.trim())
					return `${name === 'firstName' ? 'First' : 'Last'} name is required`;
				if (!/^[a-zA-Z\s-]+$/.test(value))
					return 'Only letters, spaces and hyphens allowed';
				if (value.length > 50) return 'Name too long';
				return undefined;

			case 'phone':
				if (!value.trim()) return 'Phone number is required';
				if (!/^[0-9]{10}$/.test(value))
					return 'Invalid phone number (10 digits required)';
				return undefined;

			case 'email':
			case 'loginEmail':
				if (!value.trim()) return 'Email is required';
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
					return 'Invalid email format';
				return undefined;

			case 'state':
			case 'city':
				if (!value.trim())
					return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
				return undefined;

			case 'pincode':
				if (!value.trim()) return 'Pincode is required';
				if (!/^[0-9]{6}$/.test(value)) return 'Pincode must be 6 digits';
				return undefined;

			case 'address1':
				if (!value.trim()) return 'Address line 1 is required';
				return undefined;

			case 'aadharNumber':
				if (value && value !== 'NaN' && !/^[0-9]{12}$/.test(value))
					return 'Aadhar must be 12 digits';
				return undefined;

			case 'panCard':
				if (
					value &&
					value !== 'NaN' &&
					!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)
				)
					return 'Invalid PAN format (e.g., ABCDE1234F)';
				return undefined;

			case 'gstNo':
				if (value && value.length < 5) return 'Invalid GST format';
				return undefined;

			case 'regNo':
				if (value && value !== 'Nan' && value.length < 5)
					return 'Registration number too short';
				return undefined;

			case 'newPassword':
				if (value && value.length < 8)
					return 'Password must be at least 8 characters';
				if (value && !/[A-Z]/.test(value))
					return 'Password must contain at least one uppercase letter';
				if (value && !/[a-z]/.test(value))
					return 'Password must contain at least one lowercase letter';
				if (value && !/[0-9]/.test(value))
					return 'Password must contain at least one number';
				return undefined;

			case 'confirmPassword':
				if (value !== newPassword) return 'Passwords do not match';
				return undefined;

			case 'image':
				if (imageFile) {
					if (!imageFile.type.match('image.*'))
						return 'Only image files are allowed';
					if (imageFile.size > 2 * 1024 * 1024)
						return 'Image size should be less than 2MB';
				}
				return undefined;

			default:
				return undefined;
		}
	};

	const handleBlur = (fieldName: keyof FormErrors, value: string) => {
		const error = validateField(fieldName, value);
		setErrors((prev) => ({ ...prev, [fieldName]: error }));
	};

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		// Validate all fields
		newErrors.companyName = validateField('companyName', editCompanyName);
		newErrors.firstName = validateField('firstName', editFirstName);
		newErrors.lastName = validateField('lastName', editLastName);
		newErrors.phone = validateField('phone', editPhone);
		newErrors.email = validateField('email', editEmail);
		newErrors.loginEmail = validateField('loginEmail', editLoginEmail);
		newErrors.state = validateField('state', editState);
		newErrors.city = validateField('city', editCity);
		newErrors.pincode = validateField('pincode', editPincode);
		newErrors.address1 = validateField('address1', editAddress1);
		newErrors.aadharNumber = validateField('aadharNumber', editAadharNumber);
		newErrors.panCard = validateField('panCard', editPanCard);
		newErrors.gstNo = validateField('gstNo', editGstNo);
		newErrors.regNo = validateField('regNo', editRegNo);
		newErrors.image = validateField('image', imageFile ? 'image' : '');

		setErrors(newErrors);

		return !Object.values(newErrors).some((error) => error !== undefined);
	};

	// Original values for comparison
	const originalValues = {
		editCompanyName: partner.companyName || '',
		editFirstName: partner.firstName || '',
		editLastName: partner.lastName || '',
		editAadharNumber: partner.aadhar || '',
		editRegNo: partner.regNo || '',
		editPanCard: partner.pan || '',
		editGstNo: partner.gstNo || '',
		editPhone: partner?.contact_info?.phoneNumber || '',
		editEmail: partner?.email || '',
		editLoginEmail: partner?.email || '',
		editPassword: partner?.password || '',
		editImage: partner?.image || '',
		editState: partner?.contact_info?.state || '',
		editCity: partner?.contact_info?.city || '',
		editPincode: partner?.contact_info?.pincode || '',
		editAddress1: partner?.contact_info?.address1 || '',
		editAddress2: partner?.contact_info?.address2 || '',
	};

	// Current edit values
	const [editAadharNumber, setEditAadharNumber] = useState(
		originalValues.editAadharNumber
	);
	const [editPanCard, setEditPanCard] = useState(originalValues.editPanCard);
	const [editGstNo, setEditGstNo] = useState(originalValues.editGstNo);
	const [editRegNo, setEditRegNo] = useState(originalValues.editRegNo);
	const [editCompanyName, setEditCompanyName] = useState(
		originalValues.editCompanyName
	);
	const [editFirstName, setFirstName] = useState(originalValues.editFirstName);
	const [editLastName, setLastName] = useState(originalValues.editLastName);
	const [editPhone, setEditPhone] = useState(originalValues.editPhone);
	const [editEmail] = useState(originalValues.editEmail);
	const [editState, setEditState] = useState(originalValues.editState);
	const [editCity, setEditCity] = useState(originalValues.editCity);
	const [editPincode, setEditPincode] = useState(originalValues.editPincode);
	const [editAddress1, setEditAddress1] = useState(originalValues.editAddress1);
	const [editAddress2, setEditAddress2] = useState(originalValues.editAddress2);
	const [editLoginEmail, setEditLoginEmail] = useState(
		originalValues.editLoginEmail
	);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setImageFile(file);

			// Validate image
			const error = validateField('image', 'image');
			setErrors((prev) => ({ ...prev, image: error }));

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setImageFile(null);
		setImagePreview(null);
		setErrors((prev) => ({ ...prev, image: undefined }));
	};

	// Function to check if any values have changed
	const hasChanges = () => {
		const currentValues = {
			editCompanyName,
			editPhone,
			editEmail,
			editLoginEmail,
			editState,
			editFirstName,
			editLastName,
			editCity,
			editPincode,
			editAadharNumber,
			editAddress1,
			editAddress2,
			editPanCard,
			editGstNo,
			editRegNo,
		};

		const valuesChanged = Object.keys(originalValues).some(
			(key) =>
				originalValues[key as keyof typeof originalValues] !==
				currentValues[key as keyof typeof currentValues]
		);

		return valuesChanged || imageFile !== null;
	};

	const handleToggle = () => {
		setPendingStatus(!isActive);
		setShowConfirm(true);
	};

	const confirmChange = () => {
		if (pendingStatus !== null) {
			setIsActive(pendingStatus);
			setShowConfirm(false);
		}
	};

	const cancelChange = () => {
		setPendingStatus(null);
		setShowConfirm(false);
	};

	const confirmDelete = async () => {
		setShowDeleteConfirm(false);
		try {
			await new Client().admin.servicecenter.delete(partner._id);
			setShowDeleteSuccessPopup(true);
			setTimeout(() => {
				handleBack();
			}, 2000);
		} catch (error) {
			console.error('Error deleting service center:', error);
		}
	};

	const cancelDelete = () => {
		setShowDeleteConfirm(false);
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error('Please fix all the fields before submitting');
			return;
		}

		if (!hasChanges()) {
			setShowNoChangesPopup(true);
			return;
		}

		try {
			const formData = new FormData();
			formData.append('contact_info[state]', editState);
			formData.append('contact_info[city]', editCity);
			formData.append('contact_info[pincode]', editPincode);
			formData.append('contact_info[address1]', editAddress1);
			formData.append('contact_info[address2]', editAddress2);
			formData.append('contact_info[phoneNumber]', editPhone);
			formData.append('firstName', editFirstName);
			formData.append('companyName', editCompanyName);
			formData.append('lastName', editLastName);
			formData.append('email', editEmail);
			formData.append('aadhar', editAadharNumber);
			formData.append('regNo', editRegNo);
			formData.append('pan', editPanCard);
			formData.append('gstNo', editGstNo);
			if (imageFile) {
				formData.append('image', imageFile?.name);
			}

			const response = await new Client().admin.servicecenter.update(
				formData,
				partner._id
			);
			if (response) {
				setShowEditForm(false);
				setShowSuccessPopup(true);
				// Reset image states after successful upload
				setImageFile(null);
				setImagePreview(null);
			}
		} catch (error) {
			toast.error('Failed to update profile');
			console.error('Profile update error:', error);
		}
	};

	useEffect(() => {
		if (showSuccessPopup) {
			const timer = setTimeout(() => setShowSuccessPopup(false), 3000);
			return () => clearTimeout(timer);
		}
	}, [showSuccessPopup]);

	useEffect(() => {
		if (showNoChangesPopup) {
			const timer = setTimeout(() => setShowNoChangesPopup(false), 3000);
			return () => clearTimeout(timer);
		}
	}, [showNoChangesPopup]);

	useEffect(() => {
		if (showDeleteSuccessPopup) {
			const timer = setTimeout(() => setShowDeleteSuccessPopup(false), 3000);
			return () => clearTimeout(timer);
		}
	}, [showDeleteSuccessPopup]);

	function onChangeCat(id: string) {
		setpartnerId(id);
		onServices();
	}

	function viewspare(id: string) {
		setpartnerId(id);
		onSpareParts();
	}

	const handlePasswordUpdate = async () => {
		if (newPassword !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		try {
			await new Client().admin.servicecenter.passwordUpdate(
				{ password: confirmPassword },
				partner._id
			);
			toast.success('Password updated successfully');
			setShowPasswordModal(false);
			setNewPassword('');
			setConfirmPassword('');
		} catch (error) {
			console.error('Failed to update password', error);
			toast.error('Something went wrong while updating the password.');
		}
	};

	return (
		<div className='min-h-screen p-6'>
			{/* Header Section */}
			<div className='flex items-center justify-between mb-6'>
				<button
					onClick={handleBack}
					className='flex items-center gap-2 text-[#9b111e] hover:text-[#800000] transition-colors rounded-3xl'
				>
					<MdOutlineKeyboardBackspace className='text-2xl' />
					<span className='font-medium'>
						<h2
							className='text-3xl font-bold text-[#9b111e]'
							style={{ ...FONTS.header }}
						>
							Profile
						</h2>
					</span>
				</button>
				<div className='w-10'></div>
			</div>

			{/* Profile Card */}
			<div className='bg-white rounded-xl shadow-md overflow-hidden mb-8'>
				{/* Profile Header */}
				<div className='flex flex-col md:flex-row items-center justify-between p-6 bg-gradient-to-r from-[#9b111e] to-[#d23c3c]'>
					<div className='flex items-center gap-4 mb-4 md:mb-0'>
						<div className='bg-white p-2 rounded-lg'>
							<img
								src={imagePreview || partner?.image}
								alt={partner?.companyName}
								className='w-24 h-24 rounded-lg object-cover'
							/>
						</div>
						<h3
							className='!font-bold !text-white'
							style={{ ...FONTS.cardheader }}
						>
							{partner?.companyName}
						</h3>
					</div>
					<div className='flex gap-4'>
						<button
							style={{ ...FONTS.paragraph }}
							onClick={() => viewspare(partner._id)}
							className='flex items-center gap-2 bg-white !text-[#9b111e] px-5 py-2 rounded-3xl font-medium hover:bg-gray-100 transition-colors shadow-sm'
						>
							<span>View Spare Parts</span>
							<FaArrowRight size={16} />
						</button>
						<button
							style={{ ...FONTS.paragraph }}
							onClick={() => onChangeCat(partner._id)}
							className='flex items-center gap-2 bg-white !text-[#9b111e] px-5 py-2 rounded-3xl font-medium hover:bg-gray-100 transition-colors shadow-sm'
						>
							<span>View Services</span>
							<FaArrowRight size={16} />
						</button>
					</div>
				</div>

				<div className='p-6'>
					{/* Status Bar */}
					<div className='flex flex-col md:flex-row items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg'>
						<div className='flex items-center gap-3 mb-3 md:mb-0'>
							<div
								className={`w-3 h-3 rounded-full ${
									isActive ? 'bg-green-500' : 'bg-red-500'
								}`}
							></div>
							<span className='text-sm font-medium text-gray-700'>
								{isActive ? 'Active' : 'Inactive'} Service Center
							</span>
						</div>
						<label className='inline-flex items-center cursor-pointer'>
							<input
								type='checkbox'
								className='sr-only peer'
								checked={isActive}
								onChange={handleToggle}
							/>
							<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
						</label>
					</div>

					{/* Divider */}
					<div className='border-t border-gray-200 my-6'></div>

					{/* Contact Information Section */}
					<div className='mb-8'>
						<h2
							className='text-xl !font-bold text-[#9b111e] mb-4 pb-2 border-b border-gray-200'
							style={{ ...FONTS.cardSubHeader }}
						>
							Contact Information
						</h2>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
							<div className='space-y-5'>
								<InfoItem
									icon={<BsBuildings className='text-[#9b111e]' />}
									label='Username'
									value={
										`${partner?.firstName || ''} ${
											partner?.lastName || ''
										}`.trim() || 'N/A'
									}
								/>
								<InfoItem
									icon={<MdEmail className='text-[#9b111e]' />}
									label='Email'
									value={partner?.email || 'N/A'}
								/>
								<InfoItem
									icon={<CgWebsite className='text-[#9b111e]' />}
									label='State'
									value={partner?.contact_info?.state || 'N/A'}
								/>
								<InfoItem
									icon={<FcDataEncryption className='text-[#9b111e]' />}
									label='Reg No'
									value={partner?.regNo || 'N/A'}
								/>

								<InfoItem
									icon={<CgWebsite className='text-[#9b111e]' />}
									label='Pincode'
									value={partner?.contact_info?.pincode || 'N/A'}
								/>
							</div>
							<div className='space-y-5'>
								<InfoItem
									icon={<BsBuildings className='text-[#9b111e]' />}
									label='Company Name'
									value={partner?.companyName || 'N/A'}
								/>
								<InfoItem
									icon={<CgWebsite className='text-[#9b111e]' />}
									label='Address 1'
									value={partner?.contact_info?.address1 || 'N/A'}
								/>

								<InfoItem
									icon={<CgWebsite className='text-[#9b111e]' />}
									label='City'
									value={partner?.contact_info?.city || 'N/A'}
								/>
								<InfoItem
									icon={<SlCalender className='text-[#9b111e]' />}
									label='Aadhar No'
									value={partner?.aadhar || 'N/A'}
								/>
							</div>
							<div className='space-y-5'>
								<InfoItem
									icon={<LuPhoneCall className='text-[#9b111e]' />}
									label='Phone'
									value={partner?.contact_info?.phoneNumber || 'N/A'}
								/>
								<InfoItem
									icon={<CgWebsite className='text-[#9b111e]' />}
									label='Address 2'
									value={partner?.contact_info?.address2 || 'N/A'}
								/>
								<InfoItem
									icon={<AiFillSafetyCertificate className='text-[#9b111e]' />}
									label='GST No'
									value={partner?.gstNo || 'N/A'}
								/>
								<InfoItem
									icon={<CgWebsite className='text-[#9b111e]' />}
									label='Pan No'
									value={partner?.pan || 'N/A'}
								/>
							</div>
						</div>
					</div>

					<div className='border-t border-gray-200 my-6'></div>

					<div className='mb-8'>
						<h2
							className='text-xl !font-bold text-[#9b111e] mb-4 pb-2 border-b border-gray-200'
							style={{ ...FONTS.cardSubHeader }}
						>
							Login Information
						</h2>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
							<InfoItem
								icon={<MdOutlineMailOutline className='text-[#9b111e]' />}
								label='Email'
								value={partner?.email || 'N/A'}
							/>

							<div className='flex items-start gap-2 relative'>
								<div className='text-[#9b111e] mt-1'>
									<RiLockPasswordLine size={18} />
								</div>

								<div className='relative'>
									<div className='text-sm font-medium text-gray-600 mb-1'>
										Password
									</div>
									<div className='flex items-center gap-4'>
										<span className='text-black'>***********</span>
										<button
											className='text-[#9b111e]'
											title='Edit Password'
											onClick={() => setShowPasswordModal(!showPasswordModal)}
										>
											<FaEdit size={16} />
										</button>
									</div>

									{showPasswordModal && (
										<div className='absolute -top-4 left-full ml-4 z-50 w-64 p-4 bg-white border border-gray-300 rounded-lg shadow-lg'>
											<h3 className='text-sm font-semibold mb-3 text-[#9b111e]'>
												Update Password
											</h3>

											<input
												type='password'
												placeholder='New Password'
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												className='w-full mb-2 px-3 py-1 border border-gray-300 rounded text-sm'
											/>
											<input
												type='password'
												placeholder='Confirm Password'
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												className='w-full mb-3 px-3 py-1 border border-gray-300 rounded text-sm'
											/>

											<div className='flex justify-end gap-2'>
												<button
													className='px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400'
													onClick={() => {
														setNewPassword('');
														setConfirmPassword('');
														setShowPasswordModal(false);
													}}
												>
													Cancel
												</button>
												<button
													className='px-3 py-1 bg-[#9b111e] text-white rounded text-sm hover:bg-[#80101a]'
													onClick={handlePasswordUpdate}
												>
													OK
												</button>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-gray-200'>
						<button
							style={{ ...FONTS.paragraph }}
							onClick={() => setShowEditForm(true)}
							className='flex items-center justify-center gap-2 bg-[#9b111e] !text-white px-6 py-2 rounded-3xl font-medium hover:bg-[#800000] transition-colors'
						>
							<FaEdit /> Edit Profile
						</button>
						<button
							style={{ ...FONTS.paragraph }}
							onClick={() => setShowDeleteConfirm(true)}
							className='flex items-center justify-center gap-2 bg-white text-red-600 border border-red-600 px-6 py-2 rounded-3xl font-medium hover:bg-red-50 transition-colors'
						>
							<FaTrash /> Delete Center
						</button>
					</div>
				</div>
			</div>

			{/* Confirmation Modals */}
			{showConfirm && (
				<ConfirmationModal
					title={
						pendingStatus
							? 'Activate Service Center?'
							: 'Deactivate Service Center?'
					}
					message={
						pendingStatus
							? 'This will make the service center visible and available for bookings.'
							: 'This will hide the service center from customers and prevent new bookings.'
					}
					onConfirm={confirmChange}
					onCancel={cancelChange}
				/>
			)}

			{showDeleteConfirm && (
				<ConfirmationModal
					title='Delete Service Center?'
					message='This action cannot be undone. All associated data will be permanently removed.'
					confirmText='Delete'
					confirmColor='bg-red-600 hover:bg-red-700'
					onConfirm={confirmDelete}
					onCancel={cancelDelete}
				/>
			)}

			{/* Enhanced Edit Form Modal */}
			{showEditForm && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
					<form
						onSubmit={handleEditSubmit}
						className='bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'
					>
						<div className='sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center'>
							<h2 className='text-2xl font-bold text-[#9b111e]'>
								Edit Profile Information
							</h2>
							<button
								type='button'
								onClick={() => setShowEditForm(false)}
								className='text-gray-500 hover:text-gray-700 transition-colors rounded-3xl'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-6 w-6'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>

						<div className='p-6'>
							{/* Image Upload Section */}
							<div className='mb-8'>
								<h3 className='text-lg font-semibold text-[#9b111e] mb-4'>
									Profile Image
								</h3>
								<div className='flex items-center gap-6'>
									<div className='relative'>
										<img
											src={
												imagePreview ||
												partner?.image ||
												'/placeholder-user.jpg'
											}
											alt={partner?.companyName}
											className='w-24 h-24 rounded-full object-cover border-2 border-gray-300'
										/>
										{imagePreview && (
											<button
												type='button'
												onClick={removeImage}
												className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
											>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='h-4 w-4'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
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
									<div>
										<label className='block'>
											<span className='sr-only'>Choose profile photo</span>
											<input
												type='file'
												accept='image/*'
												onChange={handleImageChange}
												className='block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-[#9b111e] file:text-white
                          hover:file:bg-[#800000]'
											/>
										</label>
										<p className='mt-1 text-xs text-gray-500'>
											JPG, PNG or GIF (Max. 2MB)
										</p>
										{errors.image && (
											<p className='mt-1 text-xs text-red-500'>
												{errors.image}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Contact Information Section */}
							<h3 className='text-lg font-semibold text-[#9b111e] mb-4 flex items-center gap-2'>
								<BsBuildings className='text-[#9b111e]' />
								Contact Information
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
								<EnhancedEditField
									label='First Name'
									value={editFirstName}
									onChange={setFirstName}
									onBlur={() => handleBlur('firstName', editFirstName)}
									error={errors.firstName}
									required
								/>
								<EnhancedEditField
									label='Last Name'
									value={editLastName}
									onChange={setLastName}
									onBlur={() => handleBlur('lastName', editLastName)}
									error={errors.lastName}
									required
								/>
								<EnhancedEditField
									label='Company Name'
									value={editCompanyName}
									onChange={setEditCompanyName}
									onBlur={() => handleBlur('companyName', editCompanyName)}
									error={errors.companyName}
									required
								/>
								<EnhancedEditField
									label='Phone'
									value={editPhone}
									onChange={setEditPhone}
									onBlur={() => handleBlur('phone', editPhone)}
									error={errors.phone}
									required
								/>
								<EnhancedEditField
									label='Address Line 1'
									value={editAddress1}
									onChange={setEditAddress1}
									onBlur={() => handleBlur('address1', editAddress1)}
									error={errors.address1}
									required
									textarea
								/>
								<EnhancedEditField
									label='Address Line 2'
									value={editAddress2}
									onChange={setEditAddress2}
									onBlur={() => handleBlur('address2', editAddress2)}
									error={errors.address2}
									textarea
								/>
								<EnhancedEditField
									label='State'
									value={editState}
									onChange={setEditState}
									onBlur={() => handleBlur('state', editState)}
									error={errors.state}
									required
								/>
								<EnhancedEditField
									label='City'
									value={editCity}
									onChange={setEditCity}
									onBlur={() => handleBlur('city', editCity)}
									error={errors.city}
									required
								/>
								<EnhancedEditField
									label='Pincode'
									value={editPincode}
									onChange={setEditPincode}
									onBlur={() => handleBlur('pincode', editPincode)}
									error={errors.pincode}
									required
								/>
								<EnhancedEditField
									label='Aadhar No'
									value={editAadharNumber}
									onChange={setEditAadharNumber}
									onBlur={() => handleBlur('aadharNumber', editAadharNumber)}
									error={errors.aadharNumber}
								/>
								<EnhancedEditField
									label='PAN Card'
									value={editPanCard}
									onChange={setEditPanCard}
									onBlur={() => handleBlur('panCard', editPanCard)}
									error={errors.panCard}
								/>
								<EnhancedEditField
									label='GST Number'
									value={editGstNo}
									onChange={setEditGstNo}
									onBlur={() => handleBlur('gstNo', editGstNo)}
									error={errors.gstNo}
								/>
								<EnhancedEditField
									label='Registration Number'
									value={editRegNo}
									onChange={setEditRegNo}
									onBlur={() => handleBlur('regNo', editRegNo)}
									error={errors.regNo}
								/>
							</div>

							{/* Login Information Section */}
							<div className='bg-gray-50 p-4 rounded-lg'>
								<h3 className='text-lg font-semibold text-[#9b111e] mb-4 flex items-center gap-2'>
									<RiLockPasswordLine className='text-[#9b111e]' />
									Login Information
								</h3>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<EnhancedEditField
										label='Login Email'
										value={editLoginEmail}
										onChange={setEditLoginEmail}
										onBlur={() => handleBlur('loginEmail', editLoginEmail)}
										error={errors.loginEmail}
										required
									/>
								</div>
							</div>
						</div>

						<div className='sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end gap-3'>
							<button
								type='button'
								onClick={() => setShowEditForm(false)}
								className='px-6 py-2 border border-gray-300 rounded-3xl text-gray-700 hover:bg-gray-50 transition-colors'
							>
								Cancel
							</button>
							<button
								type='submit'
								className='px-6 py-2 bg-[#9b111e] text-white rounded-3xl hover:bg-[#800000] transition-colors flex items-center gap-2'
							>
								<FaEdit /> Save Changes
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Success Popup - Green Background */}
			{showSuccessPopup && (
				<SuccessPopup
					message='Profile updated successfully!'
					icon={<CheckCircle className='h-6 w-6' />}
					type='success'
				/>
			)}

			{/* No Changes Popup - Orange/Yellow Background */}
			{showNoChangesPopup && (
				<SuccessPopup
					message='No changes detected!'
					icon={<AlertCircle className='h-6 w-6' />}
					type='warning'
				/>
			)}

			{/* Delete Success Popup */}
			{showDeleteSuccessPopup && (
				<SuccessPopup
					message='Service center deleted successfully!'
					icon={<CheckCircle className='h-6 w-6' />}
					type='success'
				/>
			)}
		</div>
	);
};

const InfoItem = ({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) => (
	<div className='flex items-start gap-3'>
		<div className='mt-1 text-lg'>{icon}</div>
		<div>
			<p className='text-sm font-medium text-gray-500'>{label}</p>
			<p className='text-lg font-normal text-gray-800'>{value}</p>
		</div>
	</div>
);

const EnhancedEditField = ({
	icon,
	label,
	value,
	onChange,
	onBlur,
	error,
	type = 'text',
	textarea = false,
	required = false,
}: {
	icon?: React.ReactNode;
	label: string;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	error?: string;
	type?: string;
	textarea?: boolean;
	required?: boolean;
}) => (
	<div className='space-y-2'>
		<label className='block text-sm font-medium text-gray-700 mb-1'>
			{icon}
			<span>{label}</span>
			{required && <span className='text-red-500 ml-1'>*</span>}
		</label>
		{textarea ? (
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				className={`w-full px-4 py-2 border ${
					error ? 'border-red-500' : 'border-gray-300'
				} rounded-lg focus:ring-2 focus:ring-[#9b111e] focus:border-[#9b111e] outline-none transition min-h-[100px]`}
				rows={3}
			/>
		) : (
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				className={`w-full px-4 py-2 border ${
					error ? 'border-red-500' : 'border-gray-300'
				} rounded-lg focus:ring-2 focus:ring-[#9b111e] focus:border-[#9b111e] outline-none transition`}
			/>
		)}
		{error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
	</div>
);

const ConfirmationModal = ({
	title,
	message,
	confirmText = 'Confirm',
	confirmColor = 'bg-[#9b111e] hover:bg-[#800000]',
	onConfirm,
	onCancel,
}: {
	title: string;
	message?: string;
	confirmText?: string;
	confirmColor?: string;
	onConfirm: () => void;
	onCancel: () => void;
}) => (
	<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
		<div className='bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden'>
			<div className='p-6'>
				<h3 className='text-xl font-bold text-gray-900 mb-2'>{title}</h3>
				{message && <p className='text-gray-600 mb-6'>{message}</p>}
				<div className='flex justify-end gap-3'>
					<button
						onClick={onCancel}
						className='px-4 py-2 border border-gray-300 rounded-3xl text-gray-700 hover:bg-gray-50 transition-colors'
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className={`px-4 py-2 text-white rounded-3xl transition-colors ${confirmColor}`}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	</div>
);

const SuccessPopup = ({
	message,
	icon,
	type = 'success',
}: {
	message: string;
	icon?: React.ReactNode;
	type?: 'success' | 'warning' | 'error';
}) => {
	const getBackgroundColor = () => {
		switch (type) {
			case 'success':
				return 'bg-green-500';
			case 'warning':
				return 'bg-orange-500';
			case 'error':
				return 'bg-red-500';
			default:
				return 'bg-green-500';
		}
	};

	return (
		<div
			className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 ${getBackgroundColor()} text-white px-6 py-4 rounded-lg shadow-lg animate-fade-in-out min-w-[300px]`}
		>
			<div className='flex-shrink-0'>{icon}</div>
			<span className='font-medium'>{message}</span>
		</div>
	);
};

export default ServiceCenterProfileView;
