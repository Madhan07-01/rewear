import React, { useState, useEffect } from 'react';
import { Order, ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { HandoverModal } from '../components/HandoverModal';
import {
  CheckCircle2,
  QrCode,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Send,
  X
} from 'lucide-react';

interface BookingConfirmationPageProps {
  order: Order;
  onNavigate: (path: string) => void;
  onOrderUpdated: (updatedOrder: Order) => void;
}

export const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = ({
  order,
  onNavigate,
  onOrderUpdated
}) => {
  const { currentUser } = useAuth();
  const [showHandoverModal, setShowHandoverModal] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>('');

  useEffect(() => {
    fetch(`/api/chat/${order.id}`)
      .then(res => res.json())
      .then(data => setChatMessages(data.messages || []))
      .catch(console.error);
  }, [order.id]);

  const handleSendMessage = async () => {
    if (!newMessageText.trim()) return;
    try {
      const res = await fetch(`/api/chat/${order.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: newMessageText.trim()
        })
      });
      const data = await res.json();
      if (data.message) {
        setChatMessages(prev => [...prev, data.message]);
        setNewMessageText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmHandover = async (params: any) => {
    try {
      const res = await fetch(`/api/orders/${order.id}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.success && data.order) {
        onOrderUpdated(data.order);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Success Banner */}
      <div className="bg-[#197B5B]/10 rounded-3xl p-6 sm:p-8 border border-[#197B5B]/20 text-center space-y-3 mb-8">
        <div className="w-12 h-12 bg-[#197B5B] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="font-serif-couture text-2xl sm:text-3xl font-bold text-[#18212B]">
          Occasionwear Reserved Successfully!
        </h1>
        <p className="text-xs text-stone-600 max-w-lg mx-auto">
          Order <strong>{order.orderNumber}</strong> confirmed. ₹{order.pricing.refundableDeposit.toLocaleString('en-IN')} security deposit is secured in platform escrow liability vault.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: QR Pass & Pickup Voucher (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1D8] shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs uppercase tracking-wider font-bold text-[#781F37]">
                Instant Pickup Pass
              </span>
              <span className="text-xs text-[#197B5B] font-bold">Status: {order.status.replace('_', ' ')}</span>
            </div>

            {/* Visual QR Code Card */}
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-center space-y-3">
              <div className="w-44 h-44 mx-auto bg-[#18212B] rounded-2xl flex flex-col items-center justify-center text-white p-4 shadow-sm">
                <QrCode className="w-20 h-20 text-[#C89228]" />
                <span className="text-[10px] font-mono tracking-widest text-stone-300 mt-2 block">
                  {order.pickupQrCode}
                </span>
              </div>

              <div>
                <span className="text-xs text-stone-500 block">6-Digit Pickup OTP</span>
                <span className="font-mono text-3xl font-black tracking-widest text-[#781F37] block mt-1">
                  {order.pickupOtp}
                </span>
                <span className="text-[11px] text-stone-600 block mt-1">
                  Present this QR or OTP to the wardrobe owner or hub associate at handover.
                </span>
              </div>
            </div>

            {/* Handover Action Simulation Button for Hackathon Testing */}
            {order.status !== 'ACTIVE_RENTAL' && (
              <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#C89228]/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#18212B]">Simulate Wardrobe Handover</h4>
                  <p className="text-[11px] text-[#6F747A]">
                    Test the dual QR scan & condition photo checklist (Step 10).
                  </p>
                </div>
                <button
                  onClick={() => setShowHandoverModal(true)}
                  className="px-4 py-2 bg-[#197B5B] hover:bg-[#146349] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Verify Handover
                </button>
              </div>
            )}

            {order.status === 'ACTIVE_RENTAL' && (
              <div className="p-4 bg-[#197B5B]/10 rounded-2xl border border-[#197B5B]/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#197B5B]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Handover Verified! Outfit is Active in Your Closet.</span>
                </div>
                <button
                  onClick={() => onNavigate('/my-rentals')}
                  className="px-3 py-1.5 bg-[#781F37] text-white text-xs font-semibold rounded-lg"
                >
                  Go to Rentals
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Details & Secure Chat (5 Cols) */}
        <div className="md:col-span-5 space-y-6">
          {/* Order Details */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D8] shadow-sm space-y-4">
            <h3 className="font-serif-couture text-lg font-bold text-[#18212B] pb-2 border-b border-stone-100">
              Schedule & Location
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#781F37] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-[#18212B] block">Fulfilment Point</span>
                  <span className="text-stone-600">{order.deliveryAddress || 'T. Nagar Wardrobe Hub, Chennai'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#197B5B] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-[#18212B] block">Rental Period</span>
                  <span className="text-stone-600">{order.startDate} to {order.endDate} (3 days)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#C89228] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-[#18212B] block">Wardrobe Owner</span>
                  <span className="text-stone-600">{order.sellerName}</span>
                </div>
              </div>
            </div>

            {/* Chat Trigger Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-[#18212B] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <MessageSquare className="w-4 h-4 text-[#781F37]" />
                <span>{showChat ? 'Hide Order Chat' : 'Chat with Wardrobe Owner'}</span>
              </button>
            </div>
          </div>

          {/* Order-Linked Secure Chat Box */}
          {showChat && (
            <div className="bg-white p-4 rounded-3xl border border-[#E8E1D8] shadow-md space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#197B5B]" />
                  <span className="text-xs font-bold text-[#18212B]">Order-Linked Secure Chat</span>
                </div>
                <button onClick={() => setShowChat(false)} className="text-stone-400 hover:text-black text-xs">
                  ✕
                </button>
              </div>

              <p className="text-[10px] text-stone-500 italic bg-stone-50 p-1.5 rounded-lg text-center">
                🔒 Keep communication on ReWear to protect your deposit. Phone numbers are hidden.
              </p>

              {/* Chat Messages */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {chatMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`p-2.5 rounded-xl max-w-[85%] ${
                        isMe ? 'bg-[#781F37] text-white' : 'bg-stone-100 text-[#18212B]'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-stone-400 mt-0.5">{msg.senderName.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Send Box */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type message to wardrobe owner..."
                  className="flex-1 text-xs p-2 rounded-xl border border-stone-200 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-[#781F37] text-white rounded-xl hover:bg-[#5E182B] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Handover Modal */}
      {showHandoverModal && (
        <HandoverModal
          order={order}
          onClose={() => setShowHandoverModal(false)}
          onConfirmHandover={handleConfirmHandover}
        />
      )}
    </div>
  );
};
