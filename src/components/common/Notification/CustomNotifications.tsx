import { useEffect, useState } from "react";
import { getByUserNotification, markAsReadNotification } from "./services";
import { useSocket } from "../../../context/adminSocket";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  _id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  priority: string;
  action_type: string;
  title: string;
  is_active: boolean;
  uuid: string;
  recipient_type: string;
  type: string;
}

const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");
  const [, setSelectedNotify] = useState<Notification>()
  const socket = useSocket();

  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: any) => {
      console.log("Admin Notification Recieved", data)
      setNotifications((prev) => [data, ...prev])
    }

    socket.on("newNotification", handleNotification)

    return () => {
      socket.off('newNotification', handleNotification)
    }
  }, [socket])


  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = localStorage.getItem('adminobjectid')
      console.log('userId', userId)
      try {
        const res: any = await getByUserNotification(userId!)
        console.log("response : ", res)
        setNotifications(res?.data?.data?.notifications || []);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;

    try {
      for (const notify of unread) {
        await markAsReadNotification(notify.uuid);
      }
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const filtered = notifications.filter((n) => {
    if (n.recipient_type !== 'admin') return false;
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
  }
  );

  const formatDate = (d: string) => new Date(d).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });

  const notifyHandle = async (n:Notification) => {
    if (!n.is_read) {
      await markAsReadNotification((n.uuid))
      if (n.type === 'serviceReq') {
        await navigate('/bookings')
      } else if (n.type === 'orderReq') {
        await navigate('/order')
      } else {
        await navigate('/service')
      }
      setNotifications((prev) => prev.map((m) => m._id === n._id ? { ...m, is_read: true } : m))
    } else if (n.type === 'serviceReq') {
      await navigate('/bookings')
    } else if (n.type === 'orderReq') {
      await navigate('/order')
    }
    else {
      await navigate('/service')
    }

  }


  return (
    <div className="p-4 bg-white rounded shadow w-full mx-auto mt-5">
      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          {["all", "read", "unread"].map((f) => (
            <button
              key={f}
              className={`px-4 py-2 rounded-full border ${f === filter ? "bg-[#9b111e] text-white" : "text-[#9b111e] border-[#9b111e]"}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={handleMarkAllAsRead}>
          Mark all as read
        </button>
      </div>
      <div className="space-y-4">
        {filtered.map((n, i) => (
          <div
            key={i}
            className={`p-4 rounded border cursor-pointer ${n.is_read ? "bg-gray-100" : "bg-yellow-100"}`}
            onClick={async () => {
              setSelectedNotify(n)
              await notifyHandle(n)
            }}
          >
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">{n.title}</h4>
                <p className="text-sm">{n.message}</p>
              </div>
              <span className="text-xs text-gray-500">{formatDate(n.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
      {/* <audio ref={audioRef} src={notificationSound} preload="auto" /> */}
    </div>
  );
};

export default NotificationPanel;