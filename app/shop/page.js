'use client';

import { useEffect, useState, useRef } from 'react';
import {
  ExInput,
  ExForm,
  ExButton,
  ExDialog,
  ExDivider
} from '@bhavinpatel57/element-x';
import { notifyGlobal } from '../components/NotificationProvider';
import { useAuth } from '@/context/AuthContext';
import { useShop } from '@/context/ShopContext';

export default function ShopPage() {
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editingShop, setEditingShop] = useState(null);
  const shopDialogRef = useRef(null);
  const branchDialogRef = useRef(null);

  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    domain: '',
    contactEmail: '',
    address: '',
  });

  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
  });

  const { user } = useAuth();
  const { shop, setShop } = useShop();

  useEffect(() => {
    if (user) fetchShops();
  }, [user]);

  useEffect(() => {
    if (shop) fetchBranches(shop._id);
  }, [shop]);

  const handleShopChange = (key, value) => {
    setShopForm(prev => ({ ...prev, [key]: value }));
  };

  const handleBranchChange = (key, value) => {
    setBranchForm(prev => ({ ...prev, [key]: value }));
  };

  const fetchShops = async () => {
    try {
      const res = await fetch('/api/shop/list');
      const data = await res.json();

      if (res.ok && Array.isArray(data.shops)) {
        setShops(data.shops);
        if (!shop && data.shops.length) setShop(data.shops[0]);
      } else {
        setShops([]);
        notifyGlobal(data.error || 'Failed to load shops', 'error');
      }
    } catch (err) {
      setShops([]);
      notifyGlobal('Error fetching shops', 'error');
    }
  };

  const fetchBranches = async (shopId) => {
    try {
      const res = await fetch(`/api/shop/branch/list?shopId=${shopId}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.branches)) {
        setBranches(data.branches);
      } else {
        setBranches([]);
        notifyGlobal(data.error || 'Failed to load branches', 'error');
      }
    } catch (err) {
      setBranches([]);
      notifyGlobal('Error fetching branches', 'error');
    }
  };

  const handleDeleteShop = async (shopId) => {
  if (!confirm('Are you sure you want to delete this shop?')) return;

  try {
    const res = await fetch('/api/shop/delete', {
      method: 'DELETE',
      body: JSON.stringify({ shopId }),
    });

    const data = await res.json();

    if (res.ok) {
      notifyGlobal('Shop deleted', 'success');
      fetchShops();
      if (shop?._id === shopId) {
        setShop(null);
        setBranches([]);
      }
    } else {
      notifyGlobal(data.error || 'Error deleting shop', 'error');
    }
  } catch (err) {
    notifyGlobal('Error deleting shop', 'error');
  }
};
const handleDeleteBranch = async (branchId) => {
  if (!confirm('Are you sure you want to delete this branch?')) return;

  try {
    const res = await fetch('/api/shop/branch/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ branchId, shopId: shop._id }), // ✅ include shopId
    });

    const data = await res.json();

    if (res.ok) {
      notifyGlobal('Branch deleted', 'success');
      fetchBranches(shop._id);
    } else {
      notifyGlobal(data.error || 'Error deleting branch', 'error');
    }
  } catch (err) {
    notifyGlobal('Error deleting branch', 'error');
  }
};



  const handleShopSubmit = async () => {
    const body = { ...shopForm };
    if (editingShop) body.shopId = editingShop._id;

    const endpoint = editingShop ? '/api/shop/edit' : '/api/shop/create';

    const res = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      notifyGlobal(editingShop ? 'Shop updated' : 'Shop created', 'success');
      closeShopDialog();
      setEditingShop(null);
      setShopForm({ name: '', description: '', domain: '', contactEmail: '', address: '' });
      fetchShops();
    } else {
      notifyGlobal(data.error || 'Error saving shop', 'error');
    }
  };

  const handleBranchSubmit = async () => {
    const body = {
      ...branchForm,
      shopId: shop._id,
      ...(editingBranch ? { branchId: editingBranch._id } : {}),
    };

    const endpoint = editingBranch ? '/api/shop/branch/edit' : '/api/shop/branch/create';

    const res = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      notifyGlobal(editingBranch ? 'Branch updated' : 'Branch created', 'success');
      closeBranchDialog();
      setBranchForm({ name: '', address: '' });
      setEditingBranch(null);
      fetchBranches(shop._id);
    } else {
      notifyGlobal(data.error || 'Error saving branch', 'error');
    }
  };

  const openShopDialog = () => {
    setEditingShop(null);
    setShopForm({ name: '', description: '', domain: '', contactEmail: '', address: '' });
    shopDialogRef.current?.show({ overlay: true });
  };

  const closeShopDialog = () => {
    shopDialogRef.current?.close();
  };

  const openBranchDialog = () => {
    branchDialogRef.current?.show({ overlay: true });
  };

  const closeBranchDialog = () => {
    branchDialogRef.current?.close();
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Shops</h2>
        <ExButton onClick={openShopDialog}>+ Create Shop</ExButton>
      </div>

      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', margin: '1rem 0' }}>
        {Array.isArray(shops) && shops.map(s => (
          <div key={s._id}  onClick={() => setShop(s)}  style={{ minWidth: '200px', border: shop?._id === s._id ? '2px solid #3b82f6' : '1px solid #ccc', padding: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{s.name}</span>
             <div style={{ display: 'flex', gap: '0.25rem' }}>
  <ExButton
    size="xs"
    variant="light"
    onClick={(e) => {
      e.stopPropagation();
      setEditingShop(s);
      setShopForm({
        name: s.name,
        description: s.description || '',
        domain: s.domain || '',
        contactEmail: s.contactEmail || '',
        address: s.address || '',
      });
      shopDialogRef.current?.show({ overlay: true });
    }}
  >✏️</ExButton>
  <ExButton
    size="xs"
    variant="danger"
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteShop(s._id);
    }}
  >🗑️</ExButton>
</div>

            </div>
            <div>
              <p>{s.description}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{s.domain}</p>
            </div>
          </div>
        ))}
      </div>

      {shop && (
        <>
          <ExDivider label={`Branches of ${shop.name}`} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }}>
            <ExButton onClick={openBranchDialog}>+ Create Branch</ExButton>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {Array.isArray(branches) && branches.map(branch => (
              <div key={branch._id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{branch.name}</span>
                 <div style={{ display: 'flex', gap: '0.25rem' }}>
  <ExButton
    size="xs"
    variant="light"
    onClick={(e) => {
      e.stopPropagation();
      setEditingBranch(branch);
      setBranchForm({ name: branch.name, address: branch.address });
      branchDialogRef.current?.show({ overlay: true });
    }}
  >✏️</ExButton>
  <ExButton
    size="xs"
    variant="danger"
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteBranch(branch._id);
    }}
  >🗑️</ExButton>
</div>

                </div>
                <div>
                  <p>{branch.address}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ExDialog ref={shopDialogRef} dialogPadding="10px" closeButton>
        <ExForm onformSubmit={handleShopSubmit} slot='dialog-form' formId='shopForm'>
          <ExInput placeholder="Shop Name" value={shopForm.name} onvalueChanged={(e) => handleShopChange('name', e.detail.value)} />
          <ExInput placeholder="Description" value={shopForm.description} onvalueChanged={(e) => handleShopChange('description', e.detail.value)} />
          <ExInput placeholder="Domain" value={shopForm.domain} onvalueChanged={(e) => handleShopChange('domain', e.detail.value)} />
          <ExInput placeholder="Contact Email" type="email" value={shopForm.contactEmail} onvalueChanged={(e) => handleShopChange('contactEmail', e.detail.value)} />
          <ExInput placeholder="Address" value={shopForm.address} onvalueChanged={(e) => handleShopChange('address', e.detail.value)} />
        </ExForm>
        <ExButton formId='shopForm' slot='custom-buttons'>{editingShop ? 'Update Shop' : 'Create Shop'}</ExButton>
      </ExDialog>

      <ExDialog ref={branchDialogRef} dialogPadding="10px" closeButton>
        <ExForm onformSubmit={handleBranchSubmit} slot='dialog-form' formId="branchForm">
          <ExInput placeholder="Branch Name" value={branchForm.name} onvalueChanged={(e) => handleBranchChange('name', e.detail.value)} />
          <ExInput placeholder="Address" value={branchForm.address} onvalueChanged={(e) => handleBranchChange('address', e.detail.value)} />
        </ExForm>
        <ExButton formId="branchForm" slot='custom-buttons'>{editingBranch ? 'Update Branch' : 'Create Branch'}</ExButton>
      </ExDialog>
    </div>
  );
}
