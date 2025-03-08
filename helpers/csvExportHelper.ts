// helpers/csvExportHelper.ts
export default class CsvExportHelper {
    static exportToCsv(data: any[], filename: string) {
      if (!data || !data.length) {
        console.error("Keine Daten vorhanden");
        return;
      }
  
      const separator = ",";
      const keys = Object.keys(data[0]);
      const csvContent =
        keys.join(separator) +
        "\n" +
        data
          .map(item =>
            keys
              .map(key => {
                let cell = item[key] === null || item[key] === undefined ? "" : item[key].toString();
                // Doppelte Anführungszeichen escapen
                cell = cell.replace(/"/g, '""');
                // Wenn der Zelleninhalt Komma, Zeilenumbruch oder Anführungszeichen enthält, in doppelte Anführungszeichen einschließen
                if (cell.search(/("|,|\n)/g) >= 0) {
                  cell = `"${cell}"`;
                }
                return cell;
              })
              .join(separator)
          )
          .join("\n");
  
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      if ((navigator as any).msSaveBlob) {
        // Für IE 10+
        (navigator as any).msSaveBlob(blob, filename);
      } else {
        const link = document.createElement("a");
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", filename);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    }
  }