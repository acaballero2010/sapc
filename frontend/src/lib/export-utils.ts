"use client";

// CSV Export Utility
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ",";
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    "\n" +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? "" : row[k];
            cell = typeof cell === "object" ? JSON.stringify(cell).replace(/"/g, '""') : String(cell).replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// JSON Export Utility
export function exportToJSON(filename: string, data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".json") ? filename : `${filename}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// iCalendar (.ics) Generator for Case Conferences & Consultations
export function exportToICS(event: {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes?: number;
}) {
  const duration = event.durationMinutes || 60;
  const startDateTime = new Date(`${event.startDate}T${event.startTime}:00`);
  const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//San Antonio de Padua College//SAPC IntellySys//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:sapc-${Date.now()}@sapc.edu.ph`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDateTime)}`,
    `DTEND:${formatDate(endDateTime)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Google Calendar Direct URL Generator
export function getGoogleCalendarUrl(event: {
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  durationMinutes?: number;
}): string {
  const duration = event.durationMinutes || 60;
  const startDateTime = new Date(`${event.startDate}T${event.startTime}:00`);
  const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${formatDate(startDateTime)}/${formatDate(endDateTime)}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
