export const metadata = { title: "Size Guide | Honey Badger" };

const ROWS = [
  { size: "S", chest: "36-38", waist: "30-32" },
  { size: "M", chest: "38-40", waist: "32-34" },
  { size: "L", chest: "40-42", waist: "34-36" },
  { size: "XL", chest: "42-44", waist: "36-38" },
  { size: "XXL", chest: "44-46", waist: "38-40" },
  { size: "3XL", chest: "46-48", waist: "40-42" }
];

export default function SizeGuidePage() {
  return (
    <main className="max-w-[700px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl tracking-wider mb-6">SIZE GUIDE</h1>
      <p className="text-sm text-neutral-500 mb-6">All measurements in inches. Measure at the fullest part of chest and natural waistline.</p>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-neutral-100 text-left">
            <th className="p-3">Size</th>
            <th className="p-3">Chest</th>
            <th className="p-3">Waist</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.size} className="border-t">
              <td className="p-3 font-semibold">{r.size}</td>
              <td className="p-3">{r.chest}</td>
              <td className="p-3">{r.waist}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
