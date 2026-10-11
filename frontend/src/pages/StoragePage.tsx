import React from 'react';
import { HardDrive, Database, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { SystemSummary } from '../types/telemetry';
import { formatBytes } from '../services/api';

interface StoragePageProps {
  summary: SystemSummary | null;
}

export const StoragePage: React.FC<StoragePageProps> = ({ summary }) => {
  const disk = summary?.storage;
  const usedFormatted = disk ? formatBytes(disk.used_bytes) : '42.8 GB';
  const freeFormatted = disk ? formatBytes(disk.free_bytes) : '77.5 GB';
  const totalFormatted = disk ? formatBytes(disk.total_bytes) : '120.3 GB';
  const pct = disk?.percent || 35.6;

  const filesystems = [
    {
      mount: '/',
      device: '/dev/nvme0n1p2',
      fsType: 'ext4',
      label: 'Root OS & Containers',
      used: usedFormatted,
      free: freeFormatted,
      total: totalFormatted,
      percent: pct,
    },
    {
      mount: '/boot/firmware',
      device: '/dev/nvme0n1p1',
      fsType: 'vfat',
      label: 'Raspberry Pi Firmware & EEPROM',
      used: '65.5 MB',
      free: '446.5 MB',
      total: '512.0 MB',
      percent: 12.8,
    },
    {
      mount: '/mnt/storage',
      device: '/dev/sda1',
      fsType: 'ext4',
      label: 'Secondary Media / MinIO S3 Volume',
      used: '240.2 GB',
      free: '708.8 GB',
      total: '949.0 GB',
      percent: 25.3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Filesystem &amp; Block Storage</h2>
            <p className="text-xs text-slate-400">
              Mounted partitions, NVMe PCIe Gen 3 SSD, IOPS throughput and space allocation
            </p>
          </div>
        </div>
      </div>

      {/* Main NVMe Overview Card */}
      <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Primary System Volume
            </span>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">PCIe NVMe M.2 SSD</h3>
            <p className="text-xs text-slate-400 mt-0.5">Mounted at / • High endurance root filesystem</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold font-mono text-cyan-300">{pct}%</div>
            <div className="text-xs font-mono text-slate-400">
              {usedFormatted} used of {totalFormatted}
            </div>
          </div>
        </div>

        {/* Big Progress bar */}
        <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Disk I/O stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs text-slate-400">Disk Read Rate</div>
                <div className="text-lg font-bold font-mono text-slate-200">
                  {disk ? `${(disk.read_bytes_sec / 1024).toFixed(1)} KB/s` : '18.4 KB/s'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs text-slate-400">Disk Write Rate</div>
                <div className="text-lg font-bold font-mono text-slate-200">
                  {disk ? `${(disk.write_bytes_sec / 1024).toFixed(1)} KB/s` : '42.0 KB/s'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filesystem table */}
      <div className="rounded-2xl border border-brand-border bg-brand-card/90 overflow-hidden shadow-card">
        <div className="p-5 border-b border-brand-border">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Active Mounted Filesystems
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-brand-darkest/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Mount Point</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Used / Total</th>
                <th className="py-3 px-4">Usage %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filesystems.map((f, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-200">{f.mount}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{f.device}</td>
                  <td className="py-3 px-4 text-cyan-300 text-[11px]">{f.fsType}</td>
                  <td className="py-3 px-4 text-slate-300 text-[11px]">
                    {f.used} / {f.total}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${f.percent}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-300 font-bold">{f.percent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
