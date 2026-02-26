import React, { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit, 
  ShoppingCart,
  Tag,
  Layers,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { InventoryItem } from "../types";
import { cn } from "../lib/utils";

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    brand: "",
    model: "",
    price: "",
    stock: "",
    type: "frame",
    image: null as string | null
  });

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("visionx_token");
      const res = await fetch("/api/inventory", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("visionx_token");
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          brand: newItem.brand,
          model: newItem.model,
          price: parseFloat(newItem.price),
          stock: parseInt(newItem.stock),
          type: newItem.type,
          image_url: newItem.image,
          details: JSON.stringify({ added_at: new Date().toISOString() })
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewItem({ brand: "", model: "", price: "", stock: "", type: "frame", image: null });
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === "all" || item.type === filter;
    const matchesSearch = item.brand.toLowerCase().includes(search.toLowerCase()) || 
                         item.model.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const addToCart = async (item: InventoryItem) => {
    try {
      const token = localStorage.getItem("visionx_token");
      await fetch("/api/cart", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ inventory_id: item.id, quantity: 1 })
      });
      alert(`${item.brand} added to cart!`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Optical Inventory</h1>
          <p className="text-slate-500">Manage frames, lenses, and accessories.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="gradient-bg text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Item
        </button>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-card p-8 border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Package className="w-8 h-8 text-cyan-400" />
                  Add New Product
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Brand Name</label>
                    <input
                      required
                      type="text"
                      value={newItem.brand}
                      onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      placeholder="e.g. Ray-Ban"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Model Name</label>
                    <input
                      required
                      type="text"
                      value={newItem.model}
                      onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      placeholder="e.g. Aviator"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price ($)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stock Quantity</label>
                    <input
                      required
                      type="number"
                      value={newItem.stock}
                      onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select
                      value={newItem.type}
                      onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    >
                      <option value="frame">Frame</option>
                      <option value="sunglasses">Sunglasses</option>
                      <option value="lens">Lens</option>
                      <option value="accessory">Accessory</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Product Image</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={cn(
                      "border-2 border-dashed rounded-2xl p-8 text-center transition-all",
                      newItem.image ? "border-cyan-500 bg-cyan-500/5" : "border-white/10 group-hover:border-white/20 bg-white/5"
                    )}>
                      {newItem.image ? (
                        <div className="flex items-center justify-center gap-4">
                          <img src={newItem.image} alt="Preview" className="w-20 h-16 object-cover rounded-lg shadow-lg" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">Image Selected</p>
                            <p className="text-xs text-slate-500">Click or drag to change</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                          <p className="text-sm font-bold text-white">Upload Product Image</p>
                          <p className="text-xs text-slate-500">Supports JPG, PNG (Max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] gradient-bg text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search brand or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["all", "frame", "sunglasses", "lens", "accessory"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filter === t ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-400 hover:text-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden border-white/5 hover:border-white/20 transition-all group"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={item.image_url || `https://picsum.photos/seed/${item.id}/400/300`} 
                  alt={item.model}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-cyan-400 text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    {item.type}
                  </span>
                </div>
                {item.stock < 5 && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                      Low Stock
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.brand}</p>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{item.model}</h3>
                  </div>
                  <p className="text-xl font-bold text-white">${item.price}</p>
                </div>

                <div className="flex items-center gap-4 mt-4 mb-6">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Layers className="w-4 h-4" />
                    <span className="text-xs font-medium">{item.stock} in stock</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Tag className="w-4 h-4" />
                    <span className="text-xs font-medium">New Arrival</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => addToCart(item)}
                    className="flex-1 gradient-bg text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
