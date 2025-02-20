export default defineEventHandler(async (event) => {
    const body = await readBody(event);
  
    try {
      const response = await fetch('https://www.pons.de/newsletter/subscribe.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(body).toString()
      });
  
      if (!response.ok) {
        throw new Error(`Fehler beim Versand: ${response.status}`);
      }
  
      return { success: true, message: 'Anmeldung erfolgreich!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });