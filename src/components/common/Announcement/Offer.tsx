/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaRegTrashAlt } from 'react-icons/fa';

import { FONTS } from '../../../constants/uiConstants';
import {
  getAnnouncement,
  postAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../../pages/Announcement/services';
import { useSocket } from '../../../context/adminSocket';

const Offer = () => {
  const [offers, setOffers] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const socket = useSocket();


  const fetchOffers = async () => {
    const res: any = await getAnnouncement('');
    const all = res?.data?.data ?? [];
    setOffers(all.filter((i: any) => i.category === 'offeres'));
  };

  useEffect(() => {
    fetchOffers();
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const payload = {
    title: heading,
    category: 'offeres',
    description,
    offer: price,
    image: image ? URL.createObjectURL(image) : '',
  };

  try {
    if (editingId) {
      await updateAnnouncement(payload, editingId);
      toast.success('Offer updated successfully');
      const partnerNotification = {
        title: heading,
        message: description,
        type: "info",
        priority: "medium",
        recipient_type: "all",
        recipient_id: "",
        is_read: false,
        is_active: true,
        is_sent: false,
        created_at: new Date().toISOString(),
      };

      if (!socket) return;

      socket.emit("newNotification", partnerNotification);
      console.log("Notification emitted:", partnerNotification);
    } else {
      await postAnnouncement(payload);
      toast.success('Offer added successfully');

      const partnerNotification = {
        title: heading,
        message: description,
        type: "info",
        priority: "medium",
        recipient_type: "all",
        recipient_id: "",
        is_read: false,
        is_active: true,
        is_sent: false,
        created_at: new Date().toISOString(),
      };

      if (!socket) return;

      socket.emit("newNotification", partnerNotification);
      console.log("Notification emitted:", partnerNotification);
    }

    await fetchOffers();
    resetForm();
    setShowModal(false);
  } catch (error) {
    console.error(error);
    toast.error('Operation failed. Please try again.');
  }
};


const resetForm = () => {
  setHeading('');
  setDescription('');
  setPrice('');
  setImage(null);
  setEditingId(null);
};

const handleEdit = (item: any) => {
  setHeading(item.title);
  setDescription(item.description);
  setPrice(item.offer);
  setEditingId(item.uuid);
  setShowModal(true);
};

const handleDeleteClick = (id: string) => {
  setDeleteId(id);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  if (!deleteId) return;
  try {
    await deleteAnnouncement(deleteId);
    toast.success('Offer deleted');
    await fetchOffers();
  } catch {
    toast.error('Delete failed. Please try again.');
  } finally {
    setShowDeleteModal(false);
    setDeleteId(null);
  }
};

return (
  <div className="relative px-6 mt-4">
    <button
      className="flex items-center bg-[#9b111e] gap-2 font-bold px-4 py-2 rounded-lg !text-white transition active:scale-105 hover:bg-[#a00000]"
      style={{ ...FONTS.paragraph }}
      onClick={() => setShowModal(true)}
    >
      + Add Offer
    </button>

    <div className="grid grid-cols-3 gap-6 mt-6">
      {offers.map((item: any) => (
        <div
          key={item._id}
          className="flex flex-col hover:shadow-xl transform hover:scale-[1.02] p-2 transition-all duration-300 bg-white shadow-md rounded-lg"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-40 object-cover rounded-t-lg"
          />
          <div className="p-4 flex-1 flex flex-col justify-between">
            <h3 className="text-base font-semibold text-gray-900" style={{ ...FONTS.paragraph }}>
              {item.title}
            </h3>
            <p className="text-[#9b111e] font-bold mt-2" style={{ ...FONTS.cardSubHeader }}>
              Start from {item.offer}
            </p>
            <p className="text-[#9b111e] font-bold mt-2" style={{ ...FONTS.cardSubHeader }}>
              {item.description}
            </p>

            <div className="flex gap-3 mt-4">

              <button
                onClick={() => handleEdit(item)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(item.uuid)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <FaRegTrashAlt />
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>

    {showModal && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-3xl w-full max-w-lg relative">
          <button
            onClick={() => {
              resetForm();
              setShowModal(false);
            }}
            className="absolute top-2 right-2 text-2xl font-bold text-gray-500 hover:text-black"
          >
            &times;
          </button>
          <h2 className="text-xl font-bold mb-4 text-[#9b111e]">
            {editingId ? 'Edit Offer' : 'Add New Offer'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Heading"
              className="w-full p-2 border rounded border-gray-300"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              required
            />

            <textarea
              placeholder="Description"
              className="w-full p-2 border rounded border-gray-300"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Offer Price"
              className="w-full p-2 border rounded border-gray-300"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="px-4 py-2 border border-gray-400 rounded-3xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#9b111e] text-white rounded-3xl hover:bg-[#7c0d18]"
              >
                {editingId ? 'Update' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}


    {showDeleteModal && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-3xl w-full max-w-sm text-center relative">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Are you sure you want to delete this offer?
          </h3>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-400 rounded-3xl hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default Offer;
