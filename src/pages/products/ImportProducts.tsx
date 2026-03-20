import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Loader2, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import api from '../../services/api';
import AlertModal from '../../components/common/AlertModal';

interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: { row: number; error: string }[];
}

const ImportProducts = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'success'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await api.post<ImportResult>('/import/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      if (response.data.errorCount === 0) {
        setAlert({ isOpen: true, title: 'Éxito', message: `Se importaron ${response.data.successCount} productos correctamente`, type: 'success' });
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setAlert({ isOpen: true, title: 'Error', message: err.response?.data?.message || 'Error al procesar el archivo', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Basic CSV template
    const headers = 'sku,name,slug,categoryName,brandName,costPrice,price,stock,minStock,shortDescription,status';
    const example = 'TAL-20V,Taladro Inalámbrico 20V,taladro-20v,Herramientas Eléctricas,Bosch,45000,65000,10,5,Taladro profesional de alta potencia,active';
    const blob = new Blob([`${headers}\n${example}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/products')} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Importación Masiva de Productos</h1>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100 text-center space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer flex flex-col items-center ${
                file ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <div className={`mb-4 rounded-full p-4 ${file ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                <FileText size={48} />
              </div>
              {file ? (
                <div>
                  <p className="font-bold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-gray-900 text-lg">Haz clic para subir un archivo</p>
                  <p className="text-sm text-gray-500 mt-1">Soporta Excel (.xlsx) y CSV (.csv)</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".xlsx,.csv"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-6 py-2 border rounded-lg font-medium text-gray-600 hover:bg-gray-50"
              >
                <Download size={18} /> Descargar Plantilla
              </button>
              <button 
                disabled={!file || loading}
                onClick={handleUpload}
                className="flex items-center gap-2 px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 shadow-lg shadow-blue-100"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                {loading ? 'Procesando...' : 'Iniciar Importación'}
              </button>
            </div>
          </div>

          {result && (
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Resultado del proceso</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-4">
                  <div className="bg-green-100 text-green-600 rounded-full p-2"><CheckCircle size={24} /></div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">{result.successCount}</p>
                    <p className="text-sm text-green-600 font-medium">Exitosos</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-4">
                  <div className="bg-red-100 text-red-600 rounded-full p-2"><AlertCircle size={24} /></div>
                  <div>
                    <p className="text-2xl font-bold text-red-700">{result.errorCount}</p>
                    <p className="text-sm text-red-600 font-medium">Errores</p>
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Log de Errores</h3>
                  <div className="max-h-60 overflow-y-auto border rounded-lg divide-y bg-gray-50">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="p-3 flex gap-4 text-sm">
                        <span className="font-bold text-gray-400 w-16">Fila {err.row}</span>
                        <span className="text-red-600">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <div className="rounded-xl bg-blue-50 p-6 border border-blue-100 space-y-4">
            <h2 className="font-bold text-blue-800 text-lg flex items-center gap-2"><CheckCircle size={20} /> Instrucciones</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>El archivo debe contener los encabezados exactos de la plantilla.</li>
              <li>La columna <span className="font-bold">sku</span> debe ser única.</li>
              <li>Si el <span className="font-bold">sku</span> ya existe, el producto será actualizado.</li>
              <li>Las categorías y marcas deben estar creadas previamente en el sistema.</li>
              <li>Los campos de precio y stock deben ser numéricos.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportProducts;
