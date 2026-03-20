import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ISettings } from '../../types';
import { Save, Loader2, Store, CreditCard, Bell, Truck } from 'lucide-react';
import AlertModal from '../../components/common/AlertModal';

const SettingsPage = () => {
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'success'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get<ISettings>('/settings');
      setSettings(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = <T extends keyof ISettings>(section: T, field: string, value: any) => {
    if (!settings) return;
    const currentSection = settings[section];
    if (typeof currentSection === 'object' && currentSection !== null) {
      setSettings({
        ...settings,
        [section]: { ...currentSection, [field]: value }
      });
    }
  };

  const handleNestedChange = <T extends keyof ISettings, S extends keyof ISettings[T]>(
    section: T, 
    subSection: S, 
    field: string, 
    value: any
  ) => {
    if (!settings) return;
    const currentSection = settings[section];
    if (typeof currentSection === 'object' && currentSection !== null) {
      const currentSubSection = (currentSection as any)[subSection];
      if (typeof currentSubSection === 'object' && currentSubSection !== null) {
        setSettings({
          ...settings,
          [section]: {
            ...currentSection,
            [subSection]: { ...currentSubSection, [field]: value }
          }
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await api.patch('/settings', settings);
      setAlert({ isOpen: true, title: 'Éxito', message: 'Configuración guardada correctamente', type: 'success' });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'Error al guardar la configuración', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Configuración del Sistema</h1>
        <button 
          onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Guardar Cambios
        </button>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Info */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Store size={20} /> Tienda</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nombre de la Tienda</label>
            <input type="text" value={settings.store.name} onChange={(e) => handleChange('store', 'name', e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email de contacto (público)</label>
            <input type="email" value={settings.store.contactEmail || ''} onChange={(e) => handleChange('store', 'contactEmail', e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
        </div>

        {/* Bank Transfer Details */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><CreditCard size={20} /> Transferencia Bancaria</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Titular</label>
            <input type="text" value={settings.payment.bankTransfer.holderName} onChange={(e) => handleNestedChange('payment', 'bankTransfer', 'holderName', e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">CBU</label>
              <input type="text" value={settings.payment.bankTransfer.cbu} onChange={(e) => handleNestedChange('payment', 'bankTransfer', 'cbu', e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Alias</label>
              <input type="text" value={settings.payment.bankTransfer.alias} onChange={(e) => handleNestedChange('payment', 'bankTransfer', 'alias', e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Banco</label>
            <input type="text" value={settings.payment.bankTransfer.bank} onChange={(e) => handleNestedChange('payment', 'bankTransfer', 'bank', e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
        </div>

        {/* Notifications Toggle */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Bell size={20} /> Notificaciones</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm">Notificar nuevo pedido por email</span>
            <input type="checkbox" checked={settings.notifications.emailEvents.newOrder} onChange={(e) => handleNestedChange('notifications', 'emailEvents', 'newOrder', e.target.checked)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Alerta de stock bajo</span>
            <input type="checkbox" checked={settings.notifications.emailEvents.lowStock} onChange={(e) => handleNestedChange('notifications', 'emailEvents', 'lowStock', e.target.checked)} />
          </div>
        </div>

        {/* Shipping Options */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Truck size={20} /> Envíos</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Monto mínimo para cuotas</label>
            <input type="number" value={settings.payment.minAmountForInstallments} onChange={(e) => handleChange('payment', 'minAmountForInstallments', Number(e.target.value))} className="w-full border rounded-lg p-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
