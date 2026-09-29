import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Check, X } from 'lucide-react';

interface LocationModalProps {
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ onClose }) => {
  const { selectedCity, setSelectedCity, showToast } = useAuth();

  const cities = [
    {
      name: 'Chennai',
      state: 'Tamil Nadu',
      popularHubs: ['T. Nagar', 'Alwarpet', 'Nungambakkam', 'Besant Nagar', 'Anna Nagar', 'Adyar'],
      activeWardrobes: 142
    },
    {
      name: 'Bengaluru',
      state: 'Karnataka',
      popularHubs: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Lavelle Road'],
      activeWardrobes: 210
    },
    {
      name: 'Mumbai',
      state: 'Maharashtra',
      popularHubs: ['Bandra West', 'Juhu', 'Colaba', 'Khar', 'Lower Parel'],
      activeWardrobes: 185
    },
    {
      name: 'Delhi-NCR',
      state: 'Delhi',
      popularHubs: ['South Extension', 'Hauz Khas', 'Defence Colony', 'Gurgaon DLF'],
      activeWardrobes: 160
    },
    {
      name: 'Hyderabad',
      state: 'Telangana',
      popularHubs: ['Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Madhapur'],
      activeWardrobes: 98
    }
  ];

  const handleSelect = (cityName: string) => {
    setSelectedCity(cityName);
    showToast(`Switched discovery hub to ${cityName}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-[#FFF9F1] text-[#18212B] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#E8E1D8] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#781F37]/10 flex items-center justify-center text-[#781F37]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
                Select Hyperlocal City Hub
              </h3>
              <p className="text-xs text-[#6F747A]">
                See verified local wardrobes within your neighbourhood
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-black transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2.5 overflow-y-auto max-h-[60vh]">
          {cities.map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
            return (
              <div
                key={city.name}
                onClick={() => handleSelect(city.name)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#781F37] ring-1 ring-[#781F37] shadow-xs'
                    : 'bg-white/60 border-[#E8E1D8] hover:bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-[#18212B]">{city.name}</span>
                    <span className="text-xs text-stone-400 ml-2 font-normal">{city.state}</span>
                  </div>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-xs text-[#197B5B] font-bold">
                      <Check className="w-4 h-4" /> Active Hub
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400">
                      {city.activeWardrobes} verified wardrobes
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-2 text-[10px] text-stone-500">
                  {city.popularHubs.slice(0, 4).map((hub) => (
                    <span key={hub} className="px-1.5 py-0.5 bg-stone-100 rounded">
                      {hub}
                    </span>
                  ))}
                  <span className="px-1.5 py-0.5 text-stone-400">+ more</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#E8E1D8] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
