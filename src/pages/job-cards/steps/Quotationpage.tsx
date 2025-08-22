/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Client from '../../../api';
import { format } from 'date-fns';
import { getBillingStatus } from '../../Orders/Services';


// type quotation ={
//   _id:string;
//   customerInfo:{
//     name:string;
//     adsress:string;
//     contactNo:string;
//     email:string;
//   },
//   serviceInfo:{
//     amount:string;
//   }
// }

const QuotationPage: React.FC = () => {
	const navigate = useNavigate();

	const [quotation, setquotation] = useState<any>();
	const [buttonShow, setButtonShow] = useState<string>();
	const { id,status } = useParams();

	// const serviceData = quotation?.serviceInfo?.products;

	// serviceData.map((item) => item
	//   console.log(serviceData,"quotation")
	useEffect(() => {
		async function fetchdata(ids: any) {
			const response: any = await new Client().admin.billing.get(ids);
			console.log(response, 'jobcard bill response');
			setButtonShow(status);
			setquotation(response.data.data);
		}
		fetchdata(id);
		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleClick = () => {
		navigate(-1);
	};



	const handleAccept = async () => {
		const data = { status: 'closed' };
		await new Client().admin.jobcard.put(data, quotation?.JobCardId ?? '');
		toast.success('Quotation accepted!');
		navigate('/job-cards');
	};

	const handleDownloadPDF = async (id: string) => {
		try {
			const response: any = await getBillingStatus({ jobCardId: id });

			// const blob = await response.blob();
			const url = window.URL.createObjectURL(response?.data);
			const a = document.createElement('a');
			a.href = url;
			a.download = `quotation-${id}.pdf`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading PDF:', error);
			toast.error('Failed to download the quotation PDF.');
		}
	};
	return (
		<>
			<div
				onClick={handleClick}
				className='relative top-12 right-6 w-full flex justify-end '
			>
				<HiOutlineXMark className='opacity-25 w-8 h-8 hover:opacity-100 hover:bg-gradient-to-br hover:from-[#700808] hover:via-[#a61c1c] hover:to-[#d23c3c] hover:text-white p-1 rounded' />
			</div>
			<div className='sm:p-8 bg-white text-black w-full mx-auto border rounded shadow'>
				<div className='flex flex-col md:flex-row justify-between mb-2 gap-4'>
					<div>
						<div className='flex justify-start items-center h-20'>
							<img
								src={quotation?.partnerId?.image}
								alt={quotation?.partnerId?.companyName}
								className='object-contain w-32 h-30'
							/>
						</div>4
						<p>{quotation?.partnerId?.companyName}</p>
						<p>{quotation?.partnerId?.contact_info?.address1 + ', ' + quotation?.partnerId?.contact_info?.address2}</p>
						<p>{quotation?.partnerId?.contact_info?.city + ', ' + quotation?.partnerId?.contact_info?.state}</p>
						<p>{quotation?.partnerId?.contact_info?.phoneNumber}</p>
						<p>{quotation?.partnerId?.customerInfo?.email}</p>
					</div>
					<div className='text-right mt-9 mx-6'>
						<p className='text-sm mb-1'>
							<span className='font-semibold'>DATE:</span>{' '}
							{quotation?.createdAt
								? format(new Date(quotation.createdAt), 'dd/MM/yyyy')
								: ''}
						</p>
						{/* <p className="text-sm mb-1">
              <span className="font-semibold">CUSTOMER ID:</span> 21007
            </p> */}
						<p className='text-sm'>
							<span className='font-semibold'>REG NO.:</span>{' '}
							{quotation?.partnerId?.regNo}
						</p>
					</div>
				</div>

				<div className='mb-6 border border-gray-400 p-4'>
					<h3 className='font-bold mb-2'>CUSTOMER INFO</h3>
					<p>{quotation?.customerId?.firstName + ' ' + quotation?.customerId?.lastName}</p>
					<p>{quotation?.customerId?.contact_info?.address1 + ', ' + quotation?.customerId?.contact_info?.address2}</p>
					<p>{quotation?.customerId?.contact_info?.city + ', ' + quotation?.customerId?.contact_info?.state}</p>
					<p>
						{quotation?.customerId?.contact_info?.phoneNumber},
						{quotation?.customerId?.email}{' '}
					</p>
				</div>

				<div className='mb-6'>
					<h3 className='font-bold mb-2'>DESCRIPTION OF WORK</h3>
					<div className='overflow-x-auto'>
						<table className='w-full border-collapse border border-gray-300 text-sm'>
							<thead className='bg-gray-200'>
								<tr>
									<th className='border px-3 py-2 text-left'>ITEMIZED COSTS</th>
									<th className='border px-3 py-2 text-center'>QTY</th>
									<th className='border px-3 py-2 text-right'>UNIT PRICE</th>
									<th className='border px-3 py-2 text-right'>AMOUNT</th>
								</tr>
							</thead>
							<tbody>
								{quotation?.listOfitems?.map(
									(item: any, index: number) => (
										<tr key={index}>
											<td className='border px-3 py-2'>{item?.name}</td>
											<td className='border px-3 py-2 text-center'>
												{item?.quantity}
											</td>
											<td className='border px-3 py-2 text-right'>
												&#8377;{item.unitPrice}
											</td>
											<td className='border px-3 py-2 text-right'>
												&#8377;{item?.totalPrice}
											</td>
										</tr>
									)
								)}
								{/* GST Row */}
								<tr>
									<td className='border px-3 py-2 font-semibold'>SUBTOTAL</td>
									<td className='border px-3 py-2 text-center'>-</td>
									<td className='border px-3 py-2 text-right'>-</td>
									<td className='border px-3 py-2 text-right'>
										&#8377;{quotation?.subTotal}
									</td>
								</tr>
								{/* CGST Row */}
								<tr>
									<td className='border px-3 py-2'>CGST ({quotation?.gstPercent}%)</td>
									<td className='border px-3 py-2 text-center'>-</td>
									<td className='border px-3 py-2 text-right'>-</td>
									<td className='border px-3 py-2 text-right'>
										&#8377;{quotation?.gstValue}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div className='flex justify-end mb-6'>
					<div className='w-full md:w-1/2 overflow-x-auto'>
						<table className='w-full text-sm border border-gray-300'>
							<tbody>
								<tr className='bg-gray-100 font-bold'>
									<td className='border px-3 py-2'>TOTAL QUOTE</td>
									<td className='border px-3 py-2 text-right'>
										{/* ₹{(subtotal * 1.18).toFixed(2)} */}
										&#8377;{quotation?.TotalAmount}
									</td>
								</tr>
								<tr>
									<td className='border px-3 py-2 font-semibold'>
										RECEIVED AMOUNT
									</td>
									<td className='border px-3 py-2 text-right'>
										&#8377;
										{quotation?.revicedAmount}
									</td>
								</tr>

								<tr>
									<td className='border px-3 py-2 font-semibold'>
										BALANCE AMOUNT
									</td>
									<td className='border px-3 py-2 text-right'>
										&#8377;
										{quotation?.balanceAmount}
									</td>
								</tr>
								{/* <tr>
                  <td className="border px-3 py-2 font-semibold">OTHER</td>
                  <td className="border px-3 py-2 text-right">-</td>
                </tr> */}
							</tbody>
						</table>
					</div>
				</div>

				<p className='text-md italic mb-4'>
					This quotation is only for admin use.
				</p>

				<div className='mt-2 p-4 flex justify-center'>
					<div className='flex gap-8 justify-end w-full md:w-2/3'>
						{['completed', 'billing'].includes(buttonShow ?? '') && (
							<>
								<button
									onClick={handleAccept}
									className='flex items-center justify-center font-bold px-14 py-2 rounded text-white transition duration-200 active:scale-105 hover:bg-[#a00000]'
									style={{
										background:
											'linear-gradient(44.99deg,#700808 11%,#d23c3c 102.34%)',
									}}
								>
									Accept
								</button>

								{/* <button
									onClick={() => handleDownloadPDF(quotation._id)}
									className='flex items-center justify-center font-bold px-6 py-2 rounded text-white transition duration-200 active:scale-105 hover:bg-green-800'
									style={{
										background:
											'linear-gradient(44.99deg, #0a5d10 11%, #34a853 102.34%)',
									}}
								>
									Download Invoice
								</button> */}
							</>
						)}
						{['closed', 'billing'].includes(buttonShow ?? '') && (
							<>

								<button
									onClick={() => handleDownloadPDF(quotation?.JobCardId)}
									className='flex items-center justify-center font-bold px-6 py-2 rounded text-white transition duration-200 active:scale-105 hover:bg-green-800'
									style={{
										background:
											'linear-gradient(44.99deg, #0a5d10 11%, #34a853 102.34%)',
									}}
								>
									Download Invoice
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default QuotationPage;
