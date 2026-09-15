// Contoh di komponen React
import { useStore } from '../store/useStore';

function GuestList() {
  const guests = useStore((s) => s.getGuests());
  const isLoading = useStore((s) => s.isLoading);
  const error = useStore((s) => s.error);
  const clearError = useStore((s) => s.clearError);
  const addGuest = useStore((s) => s.addGuest);
  const deleteGuest = useStore((s) => s.deleteGuest);

  const handleAdd = async () => {
    await addGuest({ name: 'Budi', phone: '08123' });
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}
      {guests.map((g) => (
        <div key={g.id}>
          {g.name}
          <button onClick={() => deleteGuest(g.id)}>Hapus</button>
        </div>
      ))}
      <button onClick={handleAdd}>Tambah Tamu</button>
    </div>
  );
}
