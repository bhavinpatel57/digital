'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [shop, setShop] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    const loadBranches = async () => {
      if (!shop?._id) return;

      try {
        const res = await fetch(`/api/shop/branch/list?shopId=${shop._id}`);
        const json = await res.json();
        if (res.ok) setBranches(json.branches || []);
        else setBranches([]);
      } catch (err) {
        setBranches([]);
      }
    };

    loadBranches();
  }, [shop]);

  return (
    <ShopContext.Provider value={{ shop, setShop, branches, selectedBranch, setSelectedBranch }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
