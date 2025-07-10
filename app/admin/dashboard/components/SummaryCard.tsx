// app/admin/dashboard/components/SummaryCard.tsx
import { SummaryStats } from "../page";

const SummaryItem = ({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) => (
  <div className="flex justify-between items-center text-sm">
    <div className="flex items-center">
      <span className={`w-3 h-3 rounded-full mr-2 ${colorClass}`}></span>
      <span className="text-gray-600">{label}</span>
    </div>
    <span className="font-bold text-gray-800">{value}</span>
  </div>
);

const SummaryCard = ({ stats }: { stats: SummaryStats }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h3 className="text-lg font-bold mb-4">Ringkasan Hari Ini</h3>

      {/* Progress Bar Kehadiran */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-blue-700">
            Persentase Kehadiran
          </span>
          <span className="text-sm font-medium text-blue-700">
            {stats.persentaseKehadiran.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${stats.persentaseKehadiran}%` }}
          ></div>
        </div>
      </div>

      {/* Daftar Statistik */}
      <div className="space-y-3">
        <SummaryItem
          label="Hadir"
          value={stats.hadir}
          colorClass="bg-green-500"
        />
        <SummaryItem
          label="Sakit"
          value={stats.sakit}
          colorClass="bg-yellow-400"
        />
        <SummaryItem label="Izin" value={stats.izin} colorClass="bg-blue-500" />
        <SummaryItem
          label="Cuti"
          value={stats.cuti}
          colorClass="bg-purple-500"
        />
        <SummaryItem
          label="Tanpa Keterangan"
          value={stats.tanpaKeterangan}
          colorClass="bg-gray-400"
        />
      </div>
    </div>
  );
};

export default SummaryCard;
