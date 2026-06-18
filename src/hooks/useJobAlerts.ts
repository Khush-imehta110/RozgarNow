import { useState, useEffect, useRef } from "react";

export function useJobAlerts() {
  const [newJobs, setNewJobs] = useState<any[]>([]);
  const lastCount = useRef(0);

  async function checkJobs() {
    try {
      const token = localStorage.getItem("token");

      // Not logged in → don't call API
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/jobs/matching`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!data.success) return;

      const count = data.jobs.length;

      // If new jobs appeared → show notification
      if (count > lastCount.current) {
        const difference = count - lastCount.current;
        setNewJobs(data.jobs.slice(0, difference));
      }

      lastCount.current = count;
    } catch (err) {
      console.log("Job alert error:", err);
    }
  }

  useEffect(() => {
    checkJobs(); // first run

    const interval = setInterval(() => {
      checkJobs();
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return newJobs;
}