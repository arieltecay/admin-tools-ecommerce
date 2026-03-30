import { FC, useState } from 'react';
import type { IOperatingExpensesSectionProps } from './types';

const OperatingExpensesSection: FC<IOperatingExpensesSectionProps> = ({
  expenses,
  loading,
  onRefresh,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingId) {
        await onUpdate(editingId, data);
        setEditingId(null);
      } else {
        await onAdd(data);
      }

      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (expense: any) => {
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split('T')[0],
      category: expense.category,
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-4">Cargando gastos operativos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gastos Operativos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Agregar Gasto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded space-y-4">
          <div>
            <label className="block text-sm font-medium">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Monto</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Categoría</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Descripción</th>
              <th className="border p-2 text-left">Monto</th>
              <th className="border p-2 text-left">Categoría</th>
              <th className="border p-2 text-left">Fecha</th>
              <th className="border p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="border p-4 text-center text-gray-500">
                  No hay gastos operativos registrados
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="border p-2">{expense.description}</td>
                  <td className="border p-2">${expense.amount.toFixed(2)}</td>
                  <td className="border p-2">{expense.category}</td>
                  <td className="border p-2">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="border p-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('¿Está seguro?')) {
                          onDelete(expense.id);
                        }
                      }}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OperatingExpensesSection;
