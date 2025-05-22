import os from "os";
import osu from "os-utils";
import checkDiskSpace from "check-disk-space";
import speedTest from "speedtest-net";

export const getServerMetrics = async (req, res) => {
  try {
    osu.cpuUsage(async (cpuPercent) => {
      const totalMem = os.totalmem() / 1024 / 1024; // MB
      const freeMem = os.freemem() / 1024 / 1024;
      const usedMem = totalMem - freeMem;
      const uptime = os.uptime();
      const loadAverage = os.loadavg();

      const netSpeed = await speedTest({ acceptLicense: true, acceptGdpr: true });

      // ✅ Detecta la ruta del disco según el sistema operativo
      const diskPath = os.platform() === "win32" ? "C:\\" : "/";

      const diskInfo = await checkDiskSpace(diskPath);
      const freeDisk = diskInfo.free / 1024 / 1024 / 1024;
      const totalDisk = diskInfo.size / 1024 / 1024 / 1024;

      res.status(200).json({
        cpuUsage: `${(cpuPercent * 100).toFixed(2)}%`,
        memory: {
          total: `${totalMem.toFixed(2)} MB`,
          used: `${usedMem.toFixed(2)} MB`,
          free: `${freeMem.toFixed(2)} MB`,
        },
        disk: {
          total: `${totalDisk.toFixed(2)} GB`,
          free: `${freeDisk.toFixed(2)} GB`,
        },
        network: {
          download: `${(netSpeed.download.bandwidth / 125000).toFixed(2)} Mbps`,
          upload: `${(netSpeed.upload.bandwidth / 125000).toFixed(2)} Mbps`,
          ping: `${netSpeed.ping.latency} ms`
        },
        uptime: `${(uptime / 60).toFixed(2)} minutes`,
        loadAverage,
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching metrics", error });
  }
};
