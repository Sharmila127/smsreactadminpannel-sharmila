import { FaCar, FaFileInvoice } from "react-icons/fa";
import { HiMiniIdentification } from "react-icons/hi2";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { FONTS } from "../../constants/uiConstants";
import { PiListNumbersFill } from "react-icons/pi";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { IoMdStats } from "react-icons/io";
import { GrView } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Client from "../../api";
import { CiSearch } from "react-icons/ci";
import {  X } from "react-feather";
import { IoMdCall } from "react-icons/io";

type Invoice = {
  uuid: string;
  customerInfo: {
    name: string;
    contactNo?: string;
    email?: string;
    address?: string;
  };
  invoiceDate: string;
  partnerId:{
    contact_info: any;
    companyName?:string;
    
  }
  vehicleInfo: {
    model: string;
    registrationNo: string;
    engineNo?: string;
    chassisNo?: string;
    color?: string;
  };
  vehicleInventory?: {
    fuelLevel?: string;
  };
  plate: string;
  total: string;
  amount: string;
  balanceDue: string;
  profile: string;
  status: string;
  createdAt: string;
  serviceInfo: {
    totalAmount: string;
    customerComplaint?: string;
    actionToBeTaken?: string;
    products?: Array<{
      description: string;
      quantity: number;
      rate: number;
      productAmount: number;
    }>;
    services?: Array<{
      description: string;
      rate: number;
      serviceAmount: number;
    }>;
  };
  jobInfo?: {
    jobId?: string;
    customerName?: string;
    ContactNo?: string;
    VehicleNo?: string;
    complaint?: string;
  };
};

const JobCardHistory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => { 
    async function fetchData() {
      try {
        const response:any = await new Client().admin.jobcard.getJobHistory();
        console.log(response?.data?.data);
        setInvoices(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching job history:", error);
      }
    }
    fetchData();
  }, []);

  const filteredInvoices = invoices.filter((invoice) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      invoice.customerInfo.name.toLowerCase().includes(query) ||
      invoice.vehicleInfo.model?.toLowerCase().includes(query) ||
      invoice.uuid.toLowerCase().includes(query)
    );
  
  });

  // const handleEditModal = () => {
  //   // Implement your edit logic here
  //   console.log("Edit modal clicked for:", selectedInvoice);
  // };

  return (
    <div className="h-screen p-4">
      <div className="flex gap-3 border-b-2 border-[#9b111e] pb-2 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 bg-white border-2 border-[#9b111e] text-[#9b111e] rounded-3xl hover:bg-[#9b111e] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
          title="Back to Job cards"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1
          style={{ ...FONTS.header, fontWeight: 500 }}
          className="!font-bold text-[#9b111e]"
        >
          Completed Jobs
        </h1>
      </div>
      
      <div className="relative flex-1 mb-6">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <CiSearch size={20} />
        </span>
        <input
          type="search"
          placeholder="Search by name, vehicle or ID"
          className="pl-10 pr-4 py-2 w-full border rounded-full shadow focus:ring-2 focus:ring-[#9b111e] focus:outline-none focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ ...FONTS.description }}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-[#e9e9e9]">
            <tr>
              <th className="px-4 py-3 text-left text-sm text-[#717171] border-b" style={{ ...FONTS.tableHeader }}>
                No
              </th>
              <th className="px-4 py-3 text-left text-sm text-[#717171] border-b" style={{ ...FONTS.tableHeader }}>
                <div className="flex items-center gap-2">
                  <HiMiniIdentification size={20} />
                  Id
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#717171] border-b" style={{ ...FONTS.tableHeader }}>
                <div className="flex items-center gap-2">
                  <FaFileInvoice size={20} />
                  Invoice date
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#717171] border-b" style={{ ...FONTS.tableHeader }}>
                <div className="flex items-center gap-2">
                  <MdOutlineDriveFileRenameOutline size={20} />
                  Name
                </div>
              </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-[#717171] border-b" style={{ ...FONTS.tableHeader }}>
                <div className="flex items-center gap-2">
                  <IoMdCall size={20} />
                  Number
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#717171] border-b lg:table-cell hidden" style={{ ...FONTS.tableHeader }}>
                <div className="flex items-center gap-2">
                  <FaCar size={20} />
                  Vehicle
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#717171] border-b" style={{ ...FONTS.tableHeader }}>
                <div className="flex items-center gap-2">
                  <PiListNumbersFill size={20} />
                  Plate
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#717171] border-b lg:table-cell hidden" style={{ ...FONTS.tableHeader }}>
                <div className="flex items-center gap-2">
                  <RiMoneyRupeeCircleLine size={20} />
                  Total
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#717171] border-b" style={{ ...FONTS.tableHeader }}>
                <div className="flex items-center gap-2">
                  <IoMdStats size={20} />
                  Job status
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#717171] border-b" style={{ ...FONTS.tableHeader }}>
                <div className="flex items-center gap-2">
                  <GrView size={20} />
                  View
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice, index) => (
                <tr
                  key={invoice.uuid}
                  className={`text-sm !text-gray-700 hover:bg-[#edeae9] transition font-semibold ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                  style={{ ...FONTS.paragraph }}
                >
                  <td className="px-4 py-3 border-b">{index + 1}</td>
                  <td className="px-4 py-3 border-b">{invoice.uuid}</td>
                  <td className="px-4 py-3 border-b">
                    {invoice.createdAt.split("T")[0]}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {invoice.customerInfo.name}
                  </td>
                   <td className="px-4 py-3 border-b">
                      {invoice.customerInfo.contactNo}
                    </td>
                  <td className="px-4 py-3 border-b hidden lg:table-cell">
                    {invoice.vehicleInfo.model}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {invoice.vehicleInfo.registrationNo}
                  </td>
                  <td className="px-4 py-3 border-b hidden lg:table-cell">
                    &#8377;{invoice.serviceInfo.totalAmount}
                  </td>
                  <td className="px-4 py-3 border-b">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                        invoice.status.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-700"
                          : invoice.status.toLowerCase() === "not started"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                      style={{ ...FONTS.subParagraph }}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b font-semibold">
                    <div className="flex justify-center gap-3">
 
  <button
    onClick={() => {
      setSelectedInvoice(invoice);
      setShowModal(true);
    }}
    style={{ ...FONTS.cardSubHeader }}
    className="bg-[#a00000] !text-white px-3 py-1 active:scale-110 rounded-3xl hover:bg-[#800000] transition"
  >
    View
  </button>

  
  {["pending", "notstarted", "Not started","completed"].includes(invoice.status?.trim().toLowerCase()) ? (
    
    <div className="w-[80px]" />
  ) : (
    <button
      onClick={() => navigate(`/quotation/${invoice.uuid}`)}
      style={{ ...FONTS.cardSubHeader }}
      className="bg-[#a00000] !text-white px-3 py-1 active:scale-110 rounded-3xl hover:bg-[#800000] transition"
    >
      Billing
    </button>
  )}
</div>

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-6">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Job Card Modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 style={{ ...FONTS.header, fontWeight: 600 }}>
                  Job Card Details
                </h2>
                <p className="!text-gray-600" style={{ ...FONTS.cardSubHeader }}>
                  Job Number: {selectedInvoice?.uuid}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* <button
                  onClick={handleEditModal}
                  className="flex items-center space-x-2 px-4 py-2 !bg-[#7812a4] !text-white rounded-lg hover:bg-[#5c0d7d] transition-colors"
                  style={{ ...FONTS.paragraph }}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button> */}
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="border rounded-lg p-4">
                <h3 className="mb-4" style={{ ...FONTS.header, fontWeight: 500 }}>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Name:
                    </span>
                    <p className="font-medium">
                      {selectedInvoice.customerInfo.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Phone:
                    </span>
                    <p className="font-medium">
                      {selectedInvoice.customerInfo.contactNo || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Email:
                    </span>
                    <p className="font-medium">
                      {selectedInvoice.customerInfo.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Address:
                    </span>
                    <p className="font-medium">
                      {selectedInvoice.customerInfo.address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

                 <div className="border rounded-lg p-4">
                                    <h3 className="mb-4" style={{ ...FONTS.header, fontWeight: 500 }}>
                                      Partner Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                                         Company Name:
                                        </span>
                                        <p className="font-medium">
                                          {selectedInvoice.partnerId.companyName || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                                          Phone:
                                        </span>
                                        <p className="font-medium">
                                          {selectedInvoice.partnerId.contact_info.phoneNumber || "N/A"}
                                        </p>
                                      </div>
                                      {/* <div>
                                        <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                                          Email:
                                        </span>
                                        <p className="font-medium">
                                          {selectedInvoice.customerInfo.email || "N/A"}
                                        </p>
                                      </div> */}
                                      <div>
                                        <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                                         Company Address:
                                        </span>
                                        <p className="font-medium">
                                          {selectedInvoice.partnerId.contact_info.address1 || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

              {/* Vehicle Information */}
              <div className="border rounded-lg p-4">
                <h3 className="mb-4" style={{ ...FONTS.header, fontWeight: 500 }}>
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Vehicle Number:
                    </span>
                    <p className="font-medium">
                      {selectedInvoice.vehicleInfo.registrationNo || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Make & Model:
                    </span>
                    <p className="font-medium">
                      {selectedInvoice.vehicleInfo.model || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Engine Number:
                    </span>
                    <p className="font-medium">
                      {selectedInvoice.vehicleInfo.engineNo || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Chassis Number:
                    </span>
                    <p className="font-medium">
                      {selectedInvoice.vehicleInfo.chassisNo || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Color:
                    </span>
                    <p className="font-medium">
                      {selectedInvoice.vehicleInfo.color || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Fuel Level:
                    </span>
                    <p className="font-medium">
                      {selectedInvoice.vehicleInventory?.fuelLevel || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="border rounded-lg p-4">
                <h3 className="mb-4" style={{ ...FONTS.header, fontWeight: 500 }}>
                  Service Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Customer Complaint:
                    </span>
                    <p className="text-sm !text-gray-900 mt-1" style={{ ...FONTS.subParagraph }}>
                      {selectedInvoice.serviceInfo.customerComplaint || "No complaint specified"}
                    </p>
                  </div>
                  <div>
                    <span className="!text-gray-600" style={{ ...FONTS.paragraph }}>
                      Action to be Taken:
                    </span>
                    <p className="text-sm !text-gray-900 mt-1" style={{ ...FONTS.subParagraph }}>
                      {selectedInvoice.serviceInfo.actionToBeTaken || "No action specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Spare Items */}
              {selectedInvoice.serviceInfo.products && selectedInvoice.serviceInfo.products.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="mb-4" style={{ ...FONTS.header, fontWeight: 500 }}>
                    Spare Items
                  </h3>
                  <div className="space-y-2">
                    {selectedInvoice.serviceInfo.products.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} ×   &#8377;{item.rate}
                          </p>
                        </div>
                        <p className="font-bold">  &#8377;{item.productAmount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Items */}
              {selectedInvoice.serviceInfo.services && selectedInvoice.serviceInfo.services.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="mb-4" style={{ ...FONTS.header, fontWeight: 500 }}>
                    Service Items
                  </h3>
                  <div className="space-y-2">
                    {selectedInvoice.serviceInfo.services.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-600">
                            Rate:   &#8377; {item.rate}
                          </p>
                        </div>
                        <p className="font-bold">₹{item.serviceAmount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Amount */}
              {selectedInvoice.serviceInfo.totalAmount && (
                <div className="border rounded-lg p-4 bg-purple-50">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold" style={{ ...FONTS.paragraph }}>
                      Total Amount:
                    </span>
                    <span className="text-2xl !font-bold text-[#7812A4]" style={{ ...FONTS.paragraph }}>
                       &#8377;{selectedInvoice.serviceInfo.totalAmount}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCardHistory;
