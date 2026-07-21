import React, { useState, useEffect, useRef } from 'react';

// Available catalog items for manual simulation
const CATALOG_ITEMS = [
  { name: 'Coffee', category: 'Pantry', estimatedPrice: 12.99 },
  { name: 'Milk', category: 'Dairy', estimatedPrice: 4.50 },
  { name: 'Paste', category: 'Personal Care', estimatedPrice: 3.20 },
  { name: 'Soap', category: 'Hygiene', estimatedPrice: 2.50 }
];

// DYNAMICALLY GENERATE 50 USERS
const MOCK_USERS = Array.from({ length: 50 }, (_, i) => {
  const id = i + 1;
  const types = ['Single Professional', 'Large Family', 'College Student', 'Coffee Addict', 'Tech Worker'];
  const tags = ['[PRO]', '[FAM]', '[EDU]', '[CAF]', '[TECH]'];
  const typeIdx = id % types.length;
  return { id: `U${id}`, label: `U${id}: ${types[typeIdx].toUpperCase()}`, tag: tags[typeIdx] };
});

const SkeletonCard = () => (
  <div className="flex flex-col p-6 border border-gray-800 bg-[#1a1a1a] rounded-sm animate-pulse h-48 justify-between">
    <div className="flex justify-between items-center">
      <div className="h-6 bg-gray-700 w-1/3 rounded-sm"></div>
      <div className="h-4 bg-gray-800 w-1/4 rounded-sm"></div>
    </div>
    <div className="space-y-2 mt-4">
      <div className="h-4 bg-gray-800 w-3/4 rounded-sm"></div>
      <div className="h-3 bg-gray-800 w-1/2 rounded-sm"></div>
    </div>
    <div className="h-8 bg-gray-800 w-full rounded-sm mt-6"></div>
  </div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
    cancel: 'bg-amber-950/80 border-amber-800 text-amber-300',
    info: 'bg-blue-950/80 border-blue-800 text-blue-300'
  };

  return (
    <div className={`fixed bottom-6 right-6 border p-4 rounded-sm shadow-2xl flex items-center space-x-3 z-50 animate-fade-in backdrop-blur-md ${bgColors[type] || bgColors.info}`}>
      <span className="text-xs font-bold tracking-widest uppercase">
        {type === 'success' ? '[OK]' : type === 'cancel' ? '[SYS]' : '[INFO]'}
      </span>
      <p className="text-xs font-mono">{message}</p>
      <button onClick={onClose} className="text-xs opacity-60 hover:opacity-100 font-bold ml-4">X</button>
    </div>
  );
};

const ProductCard = ({ itemName, onCancelRestock, onInstantCheckout }) => {
  const [offset, setOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const itemData = CATALOG_ITEMS.find(i => i.name.toLowerCase() === itemName.toLowerCase()) || {
    name: itemName,
    estimatedPrice: 9.99
  };

  const handleTouchStart = (e) => startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  const handleTouchMove = (e) => {
    if (isSwiped) return;
    currentX.current = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = currentX.current - startX.current;
    if (diff < 0 && diff > -160) setOffset(diff);
  };
  const handleTouchEnd = () => {
    if (offset < -110) {
      setIsSwiped(true);
      setOffset(-1000);
      onCancelRestock(itemName);
    } else {
      setOffset(0);
    }
  };

  if (isSwiped) {
    return (
      <div className="flex items-center justify-between p-6 border border-gray-800 bg-[#0d0d0d] rounded-sm h-48 transition-all">
        <div className="flex items-center space-x-3 text-gray-600 font-mono text-xs">
          <span className="font-bold">[X]</span>
          <span className="line-through uppercase tracking-wider">{itemName} RESTOCK CANCELLED</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-48 overflow-hidden bg-red-950/20 border border-red-900/40 rounded-sm group select-none">
      <div className="absolute inset-0 flex items-center justify-end pr-8 bg-red-950/60">
        <span className="text-red-500 font-bold tracking-widest uppercase text-xs">SWIPE TO CANCEL</span>
      </div>

      <div
        className="absolute inset-0 flex flex-col p-5 border border-gray-800 bg-[#121212] transition-transform duration-200 ease-out h-full justify-between group-hover:border-gray-600 cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(${offset}px)` }}
        onMouseDown={handleTouchStart} onMouseMove={handleTouchMove} onMouseUp={handleTouchEnd} onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      >
        <div>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0a0a0a] border border-gray-800 flex items-center justify-center rounded-sm text-[10px] font-mono font-bold text-gray-500">
                ITEM
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-wide uppercase">{itemName}</h3>
                <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest bg-red-950/40 px-1.5 py-0.5 border border-red-900/50 rounded-sm">
                  CRITICAL DEPLETION
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-500 font-bold">${itemData.estimatedPrice.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-4 font-mono">
            WMA Forecast: Runout expected today.
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-800/60">
          <div className="flex items-center text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2 animate-pulse"></span>
            QUEUED FOR AUTO-ORDER
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onInstantCheckout(itemData); }}
            className="px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-mono text-[10px] font-bold uppercase rounded-sm transition-colors border border-emerald-600"
          >
            ORDER NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ZeroClickDashboard() {
  const [activeUserId, setActiveUserId] = useState(MOCK_USERS[0].id);
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [autoOrderEnabled, setAutoOrderEnabled] = useState(true);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedItemToPurchase, setSelectedItemToPurchase] = useState(CATALOG_ITEMS[0].name);

  // Fetch forecast from C++ API
  const fetchForecast = async (uid) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/forecast?uid=${uid}`);
      if (!response.ok) throw new Error("Failed to connect");
      const result = await response.json();

      setForecastData(result.data);
      if (result.data?.forecast) {
        setCart(result.data.forecast.map((itemName, idx) => {
          const info = CATALOG_ITEMS.find(i => i.name.toLowerCase() === itemName.toLowerCase()) || { name: itemName, estimatedPrice: 9.99 };
          return { id: `${uid}-${itemName}-${idx}`, name: info.name, price: info.estimatedPrice };
        }));
      } else {
        setCart([]);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(activeUserId);
  }, [activeUserId]);

  // Master function to process purchases, hit C++, and dynamically clear UI
  const processPurchase = async (itemsToBuy) => {
    const itemNamesToBuy = itemsToBuy.map(i => (i.name || i).toLowerCase());

    // OPTIMISTIC UI: Instantly clear the items from the screen before the server even responds!
    setForecastData(prev => ({
      ...prev,
      forecast: prev.forecast.filter(item => !itemNamesToBuy.includes(item.toLowerCase()))
    }));
    setCart(prev => prev.filter(item => !itemNamesToBuy.includes(item.name.toLowerCase())));

    try {
      // Send the purchases to the C++ backend
      for (const item of itemsToBuy) {
        await fetch('http://localhost:8080/api/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: activeUserId,
            item: item.name || item,
            day: 180 // Simulating today
          })
        });
      }
      // Silently refresh data to ensure sync
      fetchForecast(activeUserId);
      setToast({ message: `ORDER EXECUTED. Backend Session Updated.`, type: 'success' });
    } catch (err) {
      setToast({ message: `Network Error: Backend Sync Failed.`, type: 'cancel' });
    }
    setIsCartOpen(false);
  };

  const handleInstantCheckout = (item) => processPurchase([item]);
  const handleExecuteFullCheckout = () => { if (cart.length > 0) processPurchase(cart); };
  const handleSimulatePurchase = () => { if (selectedItemToPurchase) processPurchase([{ name: selectedItemToPurchase }]); };
  const handleCancelRestock = (itemName) => {
    setCart(prev => prev.filter(item => item.name.toLowerCase() !== itemName.toLowerCase()));
    setToast({ message: `CANCELLED AUTO-RESTOCK: ${itemName}`, type: 'cancel' });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const recentHistory = forecastData?.history ? [...forecastData.history].reverse().slice(0, 8) : [];

  return (
    <div className="min-h-screen bg-[#080808] text-gray-300 font-sans selection:bg-gray-800">

      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b border-gray-800/60 bg-[#050505] sticky top-0 z-40">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-pulse"></span>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase">ZERO-CLICK ENGINE</h1>
          </div>
          <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest">WMA Predictive Automated Commerce</p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 bg-[#121212] border border-gray-800 p-1.5 px-3 rounded-sm">
            <span className="text-[10px] font-mono text-gray-500 hidden sm:inline uppercase">ACTIVE PROFILE:</span>
            <select
              value={activeUserId}
              onChange={(e) => setActiveUserId(e.target.value)}
              className="bg-transparent text-gray-200 text-xs font-mono focus:outline-none cursor-pointer uppercase"
            >
              {MOCK_USERS.map(user => (
                <option key={user.id} value={user.id} className="bg-[#121212] text-gray-300">
                  {user.tag} {user.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 px-4 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-900/60 rounded-sm text-emerald-400 transition-colors flex items-center space-x-3"
          >
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase">CART</span>
            <span className="font-mono text-xs font-bold">${cartTotal.toFixed(2)}</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-emerald-600 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-6 md:p-8">

        {/* Hero Control Banner */}
        <section className="mb-10 p-6 border border-gray-800/80 bg-[#0d0d0d] rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-black text-white tracking-tight uppercase">PREDICTED DEPLETION QUEUE</h2>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-950/50 text-emerald-500 border border-emerald-900/50 rounded-sm uppercase tracking-widest">
                AUTO-RESTOCK ACTIVE
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-2xl leading-relaxed font-mono">
              Based on historical purchase intervals, the C++ engine has calculated critical runout dates. Items are automatically placed into your checkout queue.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-[#121212] p-3 px-4 border border-gray-800/60 rounded-sm">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-300 uppercase font-mono tracking-wider">ZERO-CLICK ORDERING</p>
              <p className="text-[9px] text-gray-600 font-mono mt-0.5 uppercase tracking-widest">{autoOrderEnabled ? 'ENABLED (AUTO CHECKOUT)' : 'PAUSED (MANUAL APPROVAL)'}</p>
            </div>
            <button
              onClick={() => {
                setAutoOrderEnabled(!autoOrderEnabled);
                setToast({ message: `ZERO-CLICK AUTO-CHECKOUT ${!autoOrderEnabled ? 'ENABLED' : 'DISABLED'}`, type: 'info' });
              }}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors ${autoOrderEnabled ? 'bg-emerald-700' : 'bg-gray-800'}`}
            >
              <div className={`w-4 h-4 bg-[#050505] rounded-full transition-transform ${autoOrderEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </section>

        {/* Dynamic Card Grid */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-mono uppercase text-gray-500 tracking-widest">RECOMMENDED ACTIONS</h3>
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">SWIPE LEFT TO CANCEL RESTOCK</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <> <SkeletonCard /> <SkeletonCard /> <SkeletonCard /> </>
            ) : forecastData?.forecast && forecastData.forecast.length > 0 ? (
              forecastData.forecast.map((item, index) => (
                <ProductCard key={`${activeUserId}-${item}-${index}`} itemName={item} onCancelRestock={handleCancelRestock} onInstantCheckout={handleInstantCheckout} />
              ))
            ) : (
              <div className="col-span-full p-12 border border-dashed border-gray-800/60 rounded-sm text-center text-gray-600 font-mono text-[10px] uppercase tracking-widest bg-[#0a0a0a]">
                INVENTORY STABLE. NO CRITICAL RUNOUTS PREDICTED.
              </div>
            )}
          </div>
        </section>

        {/* Utilities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Purchase Simulator */}
          <div className="p-6 border border-gray-800/60 bg-[#0d0d0d] rounded-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 font-mono">SIMULATE OFFLINE PURCHASE</h3>
              <p className="text-[11px] text-gray-500 font-mono mb-6 leading-relaxed">
                Did the user buy something at a brick-and-mortar store? Log it here to update purchase velocity in real time.
              </p>
              <div className="flex space-x-3 mb-4">
                <select
                  value={selectedItemToPurchase} onChange={(e) => setSelectedItemToPurchase(e.target.value)}
                  className="bg-[#121212] border border-gray-800 text-gray-300 text-xs p-2.5 rounded-sm font-mono outline-none flex-1 uppercase"
                >
                  {CATALOG_ITEMS.map((catItem) => (
                    <option key={catItem.name} value={catItem.name}>{catItem.name} (${catItem.estimatedPrice})</option>
                  ))}
                </select>
                <button
                  onClick={handleSimulatePurchase}
                  className="px-4 py-2 bg-blue-900/30 hover:bg-blue-800/40 border border-blue-800 text-blue-400 text-[10px] font-mono font-bold uppercase rounded-sm transition-colors"
                >
                  LOG PURCHASE
                </button>
              </div>
            </div>
            <div className="text-[9px] font-mono text-gray-600 border-t border-gray-800/60 pt-4 uppercase tracking-widest mt-4">
              Appends new transaction to C++ `data.json` memory and triggers instant recalculation.
            </div>
          </div>

          {/* Sync'd Order History */}
          <div className="p-6 border border-gray-800/60 bg-[#0d0d0d] rounded-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">C++ BACKEND PURCHASE LOG</h3>
              <span className="text-[9px] font-mono text-emerald-500 tracking-widest uppercase">SYNCED</span>
            </div>

            {recentHistory.length === 0 ? (
              <p className="text-[10px] font-mono text-gray-700 italic py-6 text-center border border-dashed border-gray-800/40 rounded-sm">
                No purchase history found for this profile.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {recentHistory.map((hist, idx) => {
                  const itemInfo = CATALOG_ITEMS.find(i => i.name === hist.name) || { estimatedPrice: 0 };
                  return (
                    <div key={idx} className="p-3 bg-[#121212] border border-gray-800/80 rounded-sm flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="text-[11px] font-mono font-bold text-gray-300 uppercase">{hist.name}</span>
                          <span className="text-[8px] font-mono text-emerald-500 bg-emerald-950/40 px-1.5 py-0.5 rounded-sm border border-emerald-900/60 tracking-widest">
                            DAY {hist.day}
                          </span>
                        </div>
                        <p className="text-[9px] font-mono text-gray-600 mt-1 uppercase tracking-widest">PERMANENTLY STORED IN RAM</p>
                      </div>
                      <span className="text-[11px] font-mono text-gray-400 font-bold">${itemInfo.estimatedPrice.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Backend Diagnostics Proof of Work */}
        {!isLoading && forecastData && (
          <footer className="p-6 border border-gray-800/60 bg-[#0a0a0a] rounded-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>BACKEND DIAGNOSTICS [O(1) HASH / O(N LOG N) HEAP]</span>
              </h4>
              <span className="text-[9px] font-mono text-gray-600 tracking-widest">LIVE JSON PAYLOAD</span>
            </div>
            <pre className="text-[10px] text-emerald-600/80 font-mono overflow-x-auto bg-[#050505] p-4 rounded-sm border border-gray-900/80 max-h-48">
              {JSON.stringify(forecastData, null, 2)}
            </pre>
          </footer>
        )}
      </main>

      {/* Slide-out Cart Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0d0d0d] border-l border-gray-800 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-800/80 mb-6">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono">AUTOMATED QUEUE</h2>
                  <p className="text-[10px] font-mono text-gray-500 uppercase mt-1">USER: {activeUserId}</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-white font-mono text-sm px-2">X</button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-600 font-mono text-[10px] uppercase tracking-widest border border-dashed border-gray-800/60 bg-[#121212] rounded-sm">
                  YOUR AUTOMATED RESTOCK QUEUE IS EMPTY.
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((cartItem) => (
                    <div key={cartItem.id} className="flex justify-between items-center p-4 bg-[#121212] border border-gray-800/80 rounded-sm">
                      <div>
                        <h4 className="text-[11px] font-bold text-gray-200 uppercase font-mono">{cartItem.name}</h4>
                        <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mt-1 block">WMA Triggered</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-[11px] font-mono font-bold text-emerald-500">${cartItem.price.toFixed(2)}</span>
                        <button onClick={() => handleCancelRestock(cartItem.name)} className="text-gray-600 hover:text-red-500 text-[10px] font-bold font-mono">X</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-800/80 pt-6">
              <div className="flex justify-between items-center mb-6 px-2">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">SUBTOTAL</span>
                <span className="text-xl font-mono font-black text-gray-200">${cartTotal.toFixed(2)}</span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={handleExecuteFullCheckout}
                className="w-full py-3.5 bg-emerald-800/80 hover:bg-emerald-700 disabled:bg-[#121212] disabled:text-gray-600 disabled:border-gray-800 border border-emerald-600 text-white font-mono text-[11px] font-bold uppercase rounded-sm transition-colors flex justify-center items-center tracking-widest"
              >
                CONFIRM & EXECUTE ORDER
              </button>

              <p className="text-[9px] font-mono text-gray-600 text-center mt-4 uppercase tracking-widest">
                {autoOrderEnabled
                  ? "ZERO-CLICK ENABLED: ITEMS DISPATCH AT SCHEDULED DATE UNLESS SWIPED."
                  : "MANUAL APPROVAL MODE ENABLED."}
              </p>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}