import { useState } from 'react';
import CustomerProfileDetails from './CustomerProfileDetails';
import CustomerDetails from './CustomerDetails';
import { useNavigate } from 'react-router-dom';

const CustomerManagement = () => {
	const [activeStep, setActiveStep] = useState(0);
	const [CustomerId, setCustomerId] = useState('');
	const navigate = useNavigate();

	const handleBack = () => {
		if (activeStep > 0) {
			setActiveStep((prev) => prev - 1);
		} else {
			navigate(-1);
		}
	};

	return (
		<div>
			{activeStep === 0 && (
				<CustomerDetails
					onProfileView={() => setActiveStep(1)}
					setCustomerId={setCustomerId}
				/>
			)}
			{activeStep === 1 && (
				<CustomerProfileDetails
					CustomerId={CustomerId}
					handleBack={handleBack}
				/>
			)}
		</div>
	);
};

export default CustomerManagement;
